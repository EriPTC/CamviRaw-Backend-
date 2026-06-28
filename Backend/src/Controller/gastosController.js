import gastosModel from "../models/gastos.js";
import entregaPersonalizadaModel from "../models/EntregaPersonalizada.js";
import eventosModel from "../models/Eventos.js";

const gastosController = {};

// ^$        = toda la cadena debe ser numerica
// \d+       = uno o mas digitos
// (\.\d+)?  = decimales opcionales
const soloNumeros = /^\d+(\.\d+)?$/;

const formatearPrecio = (valor, erroresPrecio, campo) => {
  if (valor === undefined || valor === null || String(valor).trim() === "") {
    erroresPrecio.push(`${campo} es obligatorio`);
    return valor;
  }

  const valorLimpio = String(valor).trim();
  if (!soloNumeros.test(valorLimpio) || Number(valorLimpio) < 0) {
    erroresPrecio.push(`${campo} no acepta letras, simbolos ni numeros negativos`);
    return valor;
  }

  return Number(valorLimpio);
};

const convertirDineroANumero = (valor) => {
  if (valor === undefined || valor === null || String(valor).trim() === "") return 0;

  const valorLimpio = String(valor).replace("$", "").replace(/,/g, "").trim();
  const numero = Number(valorLimpio);

  if (Number.isNaN(numero)) return 0;
  return numero;
};

const formatearMoneda = (valor) => `$${Number(valor.toFixed(2))}`;

const calcularResumenFinanciero = async () => {
  const todosLosGastos = await gastosModel.find();
  const eventos = await eventosModel.find()
    .populate("idCotizacion", "precio");
  const entregas = await entregaPersonalizadaModel.find()
    .populate("idAlbum", "idEvento");

  let totalGastos = 0;
  let totalCostos = 0;
  let totalIngresosEventos = 0;
  let totalIngresosEntregas = 0;

  todosLosGastos.forEach((gasto) => {
    const tipo = gasto.tipo?.trim().toLowerCase();
    const valor = convertirDineroANumero(gasto.valor);

    if (tipo === "gasto" || tipo === "gastos") {
      totalGastos += valor;
    }

    if (tipo === "costo" || tipo === "costos") {
      totalCostos += valor;
    }
  });

  eventos.forEach((evento) => {
    totalIngresosEventos += convertirDineroANumero(evento.idCotizacion?.precio);
  });

  entregas.forEach((entrega) => {
    const tieneEvento = Boolean(entrega.idAlbum?.idEvento);

    if (!tieneEvento) {
      totalIngresosEntregas += convertirDineroANumero(entrega.precio);
    }
  });

  const totalIngresos = totalIngresosEventos + totalIngresosEntregas;
  const balanceNeto = totalIngresos - totalGastos - totalCostos;

  return {
    totalGastos: formatearMoneda(totalGastos),
    totalCostos: formatearMoneda(totalCostos),
    totalIngresos: formatearMoneda(totalIngresos),
    balanceNeto: formatearMoneda(balanceNeto),
    detalleIngresos: {
      eventos: formatearMoneda(totalIngresosEventos),
      entregasPersonalizadas: formatearMoneda(totalIngresosEntregas),
    },
    valoresNumericos: {
      totalGastos,
      totalCostos,
      totalIngresos,
      balanceNeto,
    },
  };
};

const obtenerFecha = (valor) => {
  if (!valor) return null;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
};

const validarFechaUltimaSemana = (fechaRegistro, errores) => {
  const fecha = obtenerFecha(fechaRegistro);

  if (!fecha) {
    errores.push("fechaRegistro es obligatoria y debe ser valida");
    return;
  }

  const hoy = new Date();
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const haceUnaSemana = new Date(hoySinHora);
  haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);

  if (fecha > hoySinHora) {
    errores.push("fechaRegistro no puede ser mayor al dia actual");
  }

  if (fecha < haceUnaSemana) {
    errores.push("fechaRegistro no puede ser de hace mas de 1 semana");
  }
};

const validarGasto = ({ descripcion, tipo, valor, fechaRegistro, idClasificacion }) => {
  const errores = [];

  if (!descripcion) {
    errores.push("descripcion es obligatoria");
  }

  if (descripcion && descripcion.length < 3) {
    errores.push("descripcion debe tener minimo 3 caracteres");
  }

  if (!tipo) {
    errores.push("tipo es obligatorio");
  }

  formatearPrecio(valor, errores, "valor");
  validarFechaUltimaSemana(fechaRegistro, errores);

  if (!idClasificacion) {
    errores.push("idClasificacion es obligatorio");
  }

  return errores;
};

// SELECT
gastosController.getGastos = async (req, res) => {
  try {
    const page = parseInt(req.body?.page) || 1;
    const limit = parseInt(req.body?.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await gastosModel.countDocuments();

    const gastos = await gastosModel.find()
      .populate("idClasificacion", "nombre")
      .populate("idCompraMaterial", "nombreMaterial precioTotal fechaCompra")
      .skip(skip)
      .limit(limit);
    const resumen = await calcularResumenFinanciero();

    return res.status(200).json({ gastos, total, resumen });
  } catch (error) {
    console.log("Error en gastos " + error);
    return res.status(500).json({ message: "Error en gastos" });
  }
};

// POST
gastosController.insertGasto = async (req, res) => {
  try {
    let { descripcion, tipo, valor, fechaRegistro, idClasificacion, idCompraMaterial } = req.body;
    descripcion = descripcion?.trim();
    tipo = tipo?.trim();
    fechaRegistro = fechaRegistro?.trim();

    const errores = validarGasto({ descripcion, tipo, valor, fechaRegistro, idClasificacion });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    valor = formatearPrecio(valor, [], "valor");

    const newGasto = new gastosModel({
      descripcion,
      tipo,
      valor,
      fechaRegistro,
      idClasificacion,
      idCompraMaterial,
    });

    await newGasto.save();
    return res.status(200).json({ message: "Gasto creado" });
  } catch (error) {
    console.log("Error en gastos " + error);
    return res.status(500).json({ message: "Error en gastos" });
  }
};

// DELETE
gastosController.deleteGasto = async (req, res) => {
  try {
    const gasto = await gastosModel.findByIdAndDelete(req.params.id);
    if (!gasto) {
      return res.status(404).json({ message: "Gasto no encontrado" });
    }
    return res.status(200).json({ message: "Gasto eliminado" });
  } catch (error) {
    console.log("Error en gastos " + error);
    return res.status(500).json({ message: "Error en gastos" });
  }
};

// PUT
gastosController.updateGasto = async (req, res) => {
  try {
    let { descripcion, tipo, valor, fechaRegistro, idClasificacion, idCompraMaterial } = req.body;
    descripcion = descripcion?.trim();
    tipo = tipo?.trim();
    fechaRegistro = fechaRegistro?.trim();

    const errores = validarGasto({ descripcion, tipo, valor, fechaRegistro, idClasificacion });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    valor = formatearPrecio(valor, [], "valor");

    await gastosModel.findByIdAndUpdate(
      req.params.id,
      { descripcion, tipo, valor, fechaRegistro, idClasificacion, idCompraMaterial },
      { new: true },
    );
    return res.status(200).json({ message: "Gasto actualizado" });
  } catch (error) {
    console.log("Error en gastos " + error);
    return res.status(500).json({ message: "Error en gastos" });
  }
};

export default gastosController;
