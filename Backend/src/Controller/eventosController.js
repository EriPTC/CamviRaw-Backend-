import cotizacionesModel from "../models/Cotizaciones.js";
import eventosModel from "../models/Eventos.js";

const eventosController = {};

const obtenerFecha = (valor) => {
  if (!valor) return null;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
};

const estadoEvento = (fechaEvento) => {
  const fecha = obtenerFecha(fechaEvento);
  const hoy = new Date();
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  if (!fecha || fecha > hoySinHora) return "pendiente";
  if (fecha.getTime() === hoySinHora.getTime()) return "en proceso";
  return "finalizado";
};

const limpiarCheckList = (checkList) => {
  if (!Array.isArray(checkList)) return checkList;

  return checkList.map((item) => ({
    ...item,
    nombre: item.nombre?.trim(),
  }));
};

const getCotizacion = async (idCotizacion) => cotizacionesModel.findById(idCotizacion);

const syncEventoStatus = async (evento) => {
  const fechaEvento = evento.idCotizacion?.fechaEvento;
  const nuevoEstado = estadoEvento(fechaEvento);

  if (evento.estado !== nuevoEstado) {
    await eventosModel.findByIdAndUpdate(evento._id, { estado: nuevoEstado });
    evento.estado = nuevoEstado;
  }

  return evento;
};

// SELECT
eventosController.getEventos = async (req, res) => {
  try {
    const page = parseInt(req.body?.page) || 1;
    const limit = parseInt(req.body?.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await eventosModel.countDocuments();

    const eventosRaw = await eventosModel.find()
      .populate("idCotizacion", "NombreCotizacion precio estado fechaEvento")
      .populate("checkList.idEquipo", "Equipo Cantidad Estado")
      .skip(skip)
      .limit(limit);

    const eventos = await Promise.all(eventosRaw.map(syncEventoStatus));

    return res.status(200).json({ eventos, total });
  } catch (error) {
    console.log("Error en eventos " + error);
    return res.status(500).json({ message: "Error en eventos" });
  }
};

// POST
eventosController.insertEvento = async (req, res) => {
  try {
    let { idCotizacion, checkList } = req.body;
    checkList = limpiarCheckList(checkList);

    if (!idCotizacion) {
      return res.status(400).json({ message: "idCotizacion es obligatorio" });
    }

    const cotizacion = await getCotizacion(idCotizacion);
    if (!cotizacion) {
      return res.status(404).json({ message: "Cotizacion no encontrada" });
    }

    const newEvento = new eventosModel({
      idCotizacion,
      checkList,
      estado: estadoEvento(cotizacion.fechaEvento),
    });

    await newEvento.save();
    return res.status(200).json({ message: "Evento creado" });
  } catch (error) {
    console.log("Error en eventos " + error);
    return res.status(500).json({ message: "Error en eventos" });
  }
};

// DELETE
eventosController.deleteEvento = async (req, res) => {
  try {
    const evento = await eventosModel.findByIdAndDelete(req.params.id);
    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    return res.status(200).json({ message: "Evento eliminado" });
  } catch (error) {
    console.log("Error en eventos " + error);
    return res.status(500).json({ message: "Error en eventos" });
  }
};

// PUT
eventosController.updateEvento = async (req, res) => {
  try {
    let { idCotizacion, checkList } = req.body;
    checkList = limpiarCheckList(checkList);

    if (!idCotizacion) {
      return res.status(400).json({ message: "idCotizacion es obligatorio" });
    }

    const cotizacion = await getCotizacion(idCotizacion);
    if (!cotizacion) {
      return res.status(404).json({ message: "Cotizacion no encontrada" });
    }

    await eventosModel.findByIdAndUpdate(
      req.params.id,
      {
        idCotizacion,
        checkList,
        estado: estadoEvento(cotizacion.fechaEvento),
      },
      { new: true },
    );
    return res.status(200).json({ message: "Evento actualizado" });
  } catch (error) {
    console.log("Error en eventos " + error);
    return res.status(500).json({ message: "Error en eventos" });
  }
};

export default eventosController;
