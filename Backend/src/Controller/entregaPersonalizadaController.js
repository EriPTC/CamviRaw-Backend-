import albumModel from "../models/Album.js";
import cotizacionesModel from "../models/Cotizaciones.js";
import entregaPersonalizadaModel from "../models/EntregaPersonalizada.js";
import eventosModel from "../models/Eventos.js";
import fechasBloqueadasModel from "../models/FechasBloqueadas.js";

const entregaPersonalizadaController = {};

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

const obtenerFecha = (valor) => {
  if (!valor) return null;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
};

const sumarDias = (fecha, dias) => {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setDate(nuevaFecha.getDate() + dias);
  return nuevaFecha;
};

const fechaBloqueada = async (fechaEntrega) => {
  const fecha = obtenerFecha(fechaEntrega);
  if (!fecha) return false;

  const inicio = new Date(fecha);
  const fin = sumarDias(inicio, 1);

  const bloqueada = await fechasBloqueadasModel.findOne({
    fecha: { $gte: inicio, $lt: fin },
    activo: true,
  });

  return Boolean(bloqueada);
};

const obtenerMinutos = (hora) => {
  if (!hora) return null;

  const texto = String(hora).trim().toLowerCase();
  const partes = texto.match(/^(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?$/);
  if (!partes) return null;

  let horas = Number(partes[1]);
  const minutos = Number(partes[2] || 0);
  const periodo = partes[3];

  if (periodo?.startsWith("p") && horas < 12) horas += 12;
  if (periodo?.startsWith("a") && horas === 12) horas = 0;

  if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) return null;

  return horas * 60 + minutos;
};

const estadoEntrega = (fechaEntrega) => {
  const fecha = obtenerFecha(fechaEntrega);
  const hoy = new Date();
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  if (!fecha || fecha > hoySinHora) return "pendiente";
  if (fecha.getTime() === hoySinHora.getTime()) return "dia de entrega";
  return "entregado";
};

const getEventDateFromAlbum = async (idAlbum) => {
  const album = await albumModel.findById(idAlbum);
  if (!album?.idEvento) return null;

  const evento = await eventosModel.findById(album.idEvento);
  if (!evento?.idCotizacion) return null;

  const cotizacion = await cotizacionesModel.findById(evento.idCotizacion);
  return cotizacion?.fechaEvento || null;
};

const syncEntregaStatus = async (entrega) => {
  const nuevoEstado = estadoEntrega(entrega.fechaEntrega);
  if (entrega.estado !== nuevoEstado) {
    entrega.estado = nuevoEstado;
    await entrega.save();
  }
  return entrega;
};

const validarEntrega = async ({ idAlbum, fechaEntrega, HoraEntrega, Direccion, precio }) => {
  const errores = [];
  const fecha = obtenerFecha(fechaEntrega);
  const fechaEvento = idAlbum ? obtenerFecha(await getEventDateFromAlbum(idAlbum)) : null;
  const esEntregaIndependiente = !fechaEvento;

  if (!fecha) {
    errores.push("fechaEntrega es obligatoria y debe ser valida");
  }

  if (fecha) {
    const hoy = new Date();
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const minimo = sumarDias(hoySinHora, 14);

    if (fecha < minimo) {
      errores.push("fechaEntrega debe tener minimo 2 semanas de distancia desde hoy");
    }

    if (fechaEvento) {
      const minimoEvento = sumarDias(fechaEvento, 14);
      if (fecha < minimoEvento) {
        errores.push("fechaEntrega debe tener minimo 2 semanas de distancia despues del evento");
      }
    }
  }

  if (!HoraEntrega) {
    errores.push("horaEntrega es obligatoria");
  }

  if (HoraEntrega) {
    const minutos = obtenerMinutos(HoraEntrega);
    if (minutos === null || minutos < 7 * 60 || minutos > 17 * 60) {
      errores.push("horaEntrega debe estar entre 7:00 a.m y 5:00 p.m");
    }
  }

  if (!Array.isArray(Direccion) || Direccion.length === 0) {
    errores.push("Direccion es obligatoria");
  }

  if (esEntregaIndependiente) {
    formatearPrecio(precio, errores, "precio");
  }

  if (await fechaBloqueada(fechaEntrega)) {
    errores.push("fechaEntrega esta bloqueada y no se puede reservar");
  }

  return errores;
};

// SELECT
entregaPersonalizadaController.getEntregas = async (req, res) => {
  try {
    const page = parseInt(req.body?.page) || 1;
    const limit = parseInt(req.body?.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await entregaPersonalizadaModel.countDocuments();

    const entregasRaw = await entregaPersonalizadaModel.find()
      .populate("idAlbum", "imagen public_id idEvento")
      .populate("idCliente", "Nombre Apellido Correo")
      .skip(skip)
      .limit(limit);

    const entregas = await Promise.all(entregasRaw.map(syncEntregaStatus));

    return res.status(200).json({ entregas, total });
  } catch (error) {
    console.log("Error en entregas personalizadas " + error);
    return res.status(500).json({ message: "Error en entregas personalizadas" });
  }
};

// POST
entregaPersonalizadaController.insertEntrega = async (req, res) => {
  try {
    let { idAlbum, idCliente, fechaEntrega, HoraEntrega, horaEntrega, Direccion, precio } = req.body;
    fechaEntrega = fechaEntrega?.trim();
    HoraEntrega = HoraEntrega?.trim() || horaEntrega?.trim();

    const errores = await validarEntrega({
      idAlbum,
      fechaEntrega,
      HoraEntrega,
      Direccion,
      precio,
    });

    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    if (precio !== undefined && precio !== null && String(precio).trim() !== "") {
      precio = formatearPrecio(precio, [], "precio");
    }

    const newEntrega = new entregaPersonalizadaModel({
      idAlbum,
      idCliente,
      fechaEntrega,
      HoraEntrega,
      precio,
      Direccion,
      estado: estadoEntrega(fechaEntrega),
    });

    await newEntrega.save();
    return res.status(200).json({ message: "Entrega personalizada creada" });
  } catch (error) {
    console.log("Error en entregas personalizadas " + error);
    return res.status(500).json({ message: "Error en entregas personalizadas" });
  }
};

// DELETE
entregaPersonalizadaController.deleteEntrega = async (req, res) => {
  try {
    const entrega = await entregaPersonalizadaModel.findByIdAndDelete(req.params.id);
    if (!entrega) {
      return res.status(404).json({ message: "Entrega personalizada no encontrada" });
    }
    return res.status(200).json({ message: "Entrega personalizada eliminada" });
  } catch (error) {
    console.log("Error en entregas personalizadas " + error);
    return res.status(500).json({ message: "Error en entregas personalizadas" });
  }
};

// PUT
entregaPersonalizadaController.updateEntrega = async (req, res) => {
  try {
    let { idAlbum, idCliente, fechaEntrega, HoraEntrega, horaEntrega, Direccion, precio } = req.body;
    fechaEntrega = fechaEntrega?.trim();
    HoraEntrega = HoraEntrega?.trim() || horaEntrega?.trim();

    const errores = await validarEntrega({
      idAlbum,
      fechaEntrega,
      HoraEntrega,
      Direccion,
      precio,
    });

    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    if (precio !== undefined && precio !== null && String(precio).trim() !== "") {
      precio = formatearPrecio(precio, [], "precio");
    }

    await entregaPersonalizadaModel.findByIdAndUpdate(
      req.params.id,
      {
        idAlbum,
        idCliente,
        fechaEntrega,
        HoraEntrega,
        precio,
        Direccion,
        estado: estadoEntrega(fechaEntrega),
      },
      { new: true },
    );
    return res.status(200).json({ message: "Entrega personalizada actualizada" });
  } catch (error) {
    console.log("Error en entregas personalizadas " + error);
    return res.status(500).json({ message: "Error en entregas personalizadas" });
  }
};

export default entregaPersonalizadaController;
