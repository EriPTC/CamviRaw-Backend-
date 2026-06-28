import compraMaterialModel from "../models/compraMaterial.js";
import gastosModel from "../models/gastos.js";
import inventarioModel from "../models/inventario.js";

const compraMaterialController = {};

// ^$        = toda la cadena debe ser numerica
// \d+       = uno o mas digitos
// (\.\d+)?  = decimales opcionales
const soloNumeros = /^\d+(\.\d+)?$/;

const formatearPrecio = (precio, erroresPrecio, campo) => {
  if (precio === undefined || precio === null || String(precio).trim() === "") {
    erroresPrecio.push(`${campo} es obligatorio`);
    return precio;
  }

  const precioLimpio = String(precio).trim();
  if (!soloNumeros.test(precioLimpio) || Number(precioLimpio) < 0) {
    erroresPrecio.push(`${campo} no acepta letras, simbolos ni numeros negativos`);
    return precio;
  }

  return Number(precioLimpio);
};

const validarNumero = (numero, errores, campo) => {
  if (numero === undefined || numero === null || String(numero).trim() === "") return;

  const numeroLimpio = String(numero).trim();
  if (!soloNumeros.test(numeroLimpio) || Number(numeroLimpio) < 0) {
    errores.push(`${campo} no acepta letras, simbolos ni numeros negativos`);
  }
};

const obtenerFecha = (valor) => {
  if (!valor) return null;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
};

const validarFechaUltimaSemana = (fechaCompra, errores) => {
  const fecha = obtenerFecha(fechaCompra);

  if (!fecha) {
    errores.push("fechaCompra es obligatoria y debe ser valida");
    return;
  }

  const hoy = new Date();
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const haceUnaSemana = new Date(hoySinHora);
  haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);

  if (fecha > hoySinHora) {
    errores.push("fechaCompra no puede ser mayor al dia actual");
  }

  if (fecha < haceUnaSemana) {
    errores.push("fechaCompra no puede ser de hace mas de 1 semana");
  }
};

const validarCompra = ({ nombreMaterial, fechaCompra, precioTotal, idClasificacion, Cantidad }) => {
  const errores = [];

  if (!nombreMaterial) {
    errores.push("nombreMaterial es obligatorio");
  }

  validarFechaUltimaSemana(fechaCompra, errores);
  formatearPrecio(precioTotal, errores, "precioTotal");
  validarNumero(Cantidad, errores, "Cantidad");

  if (!idClasificacion) {
    errores.push("idClasificacion es obligatorio");
  }

  return errores;
};

// SELECT
compraMaterialController.getCompras = async (req, res) => {
  try {
    const page = parseInt(req.body?.page) || 1;
    const limit = parseInt(req.body?.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await compraMaterialModel.countDocuments();

    const compras = await compraMaterialModel.find()
      .populate("idClasificacion", "nombre")
      .populate("idProveedor", "Nombre telefono correo")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ compras, total });
  } catch (error) {
    console.log("Error en compras de material " + error);
    return res.status(500).json({ message: "Error en compras de material" });
  }
};

// POST
compraMaterialController.insertCompra = async (req, res) => {
  try {
    let {
      nombreMaterial,
      idClasificacion,
      fechaCompra,
      idProveedor,
      precioTotal,
      Cantidad,
      Descripcion,
    } = req.body;
    nombreMaterial = nombreMaterial?.trim();
    fechaCompra = fechaCompra?.trim();
    Descripcion = Descripcion?.trim();

    const errores = validarCompra({ nombreMaterial, fechaCompra, precioTotal, idClasificacion, Cantidad });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    precioTotal = formatearPrecio(precioTotal, [], "precioTotal");

    const newCompra = new compraMaterialModel({
      nombreMaterial,
      idClasificacion,
      fechaCompra,
      idProveedor,
      precioTotal,
      Cantidad,
      Descripcion,
    });

    const savedCompra = await newCompra.save();

    await gastosModel.create({
      descripcion: `Compra de material: ${nombreMaterial}`,
      tipo: "Costo",
      valor: precioTotal,
      fechaRegistro: fechaCompra,
      idClasificacion,
      idCompraMaterial: savedCompra._id,
    });

    await inventarioModel.create({
      Equipo: nombreMaterial,
      Cantidad: Cantidad || 1,
      Descripcion,
      Estado: "Buen estado",
      idClasificacion,
      idCompraMaterial: savedCompra._id,
      tipoInventario: "Material",
    });

    return res.status(200).json({ message: "Compra de material creada" });
  } catch (error) {
    console.log("Error en compras de material " + error);
    return res.status(500).json({ message: "Error en compras de material" });
  }
};

// DELETE
compraMaterialController.deleteCompra = async (req, res) => {
  try {
    const compra = await compraMaterialModel.findByIdAndDelete(req.params.id);
    if (!compra) {
      return res.status(404).json({ message: "Compra de material no encontrada" });
    }
    return res.status(200).json({ message: "Compra de material eliminada" });
  } catch (error) {
    console.log("Error en compras de material " + error);
    return res.status(500).json({ message: "Error en compras de material" });
  }
};

// PUT
compraMaterialController.updateCompra = async (req, res) => {
  try {
    let {
      nombreMaterial,
      idClasificacion,
      fechaCompra,
      idProveedor,
      precioTotal,
      Cantidad,
      Descripcion,
    } = req.body;
    nombreMaterial = nombreMaterial?.trim();
    fechaCompra = fechaCompra?.trim();
    Descripcion = Descripcion?.trim();

    const errores = validarCompra({ nombreMaterial, fechaCompra, precioTotal, idClasificacion, Cantidad });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    precioTotal = formatearPrecio(precioTotal, [], "precioTotal");

    await compraMaterialModel.findByIdAndUpdate(
      req.params.id,
      {
        nombreMaterial,
        idClasificacion,
        fechaCompra,
        idProveedor,
        precioTotal,
        Cantidad,
        Descripcion,
      },
      { new: true },
    );
    return res.status(200).json({ message: "Compra de material actualizada" });
  } catch (error) {
    console.log("Error en compras de material " + error);
    return res.status(500).json({ message: "Error en compras de material" });
  }
};

export default compraMaterialController;
