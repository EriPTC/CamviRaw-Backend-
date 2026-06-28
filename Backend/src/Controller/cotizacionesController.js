import cotizacionesModel from "../models/Cotizaciones.js";
import fechasBloqueadasModel from "../models/FechasBloqueadas.js";

const cotizacionesController = {};

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

const fechaBloqueada = async (fechaEvento) => {
  const fecha = obtenerFecha(fechaEvento);
  if (!fecha) return false;

  const inicio = new Date(fecha);
  const fin = sumarDias(inicio, 1);

  const bloqueada = await fechasBloqueadasModel.findOne({
    fecha: { $gte: inicio, $lt: fin },
    activo: true,
  });

  return Boolean(bloqueada);
};

const validarFechaEvento = (fechaEvento, errores) => {
  const fecha = obtenerFecha(fechaEvento);

  if (!fecha) {
    errores.push("fechaEvento es obligatoria y debe ser valida");
    return;
  }

  const hoy = new Date();
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const minimo = sumarDias(hoySinHora, 14);

  if (fecha < minimo) {
    errores.push("fechaEvento debe tener minimo 2 semanas de distancia desde hoy");
  }
};

const validarCotizacion = async ({ NombreCotizacion, idServicio, idPaqueteServicios, precio, horaEvento, ubicacion, fechaEvento }) => {
  const errores = [];

  if (!NombreCotizacion) {
    errores.push("NombreCotizacion es obligatorio");
  }

  validarFechaEvento(fechaEvento, errores);

  if (!horaEvento) {
    errores.push("horaEvento es obligatorio");
  }

  if (!Array.isArray(ubicacion) || ubicacion.length === 0) {
    errores.push("ubicacion es obligatoria");
  }

  if (!idPaqueteServicios && (!Array.isArray(idServicio) || idServicio.length === 0)) {
    errores.push("Debe seleccionar minimo 1 paquete o 1 servicio");
  }

  formatearPrecio(precio, errores, "precio");

  if (await fechaBloqueada(fechaEvento)) {
    errores.push("fechaEvento esta bloqueada y no se puede reservar");
  }

  return errores;
};

// SELECT
cotizacionesController.getCotizaciones = async (req, res) => {
  try {
    const page = parseInt(req.body?.page) || 1;
    const limit = parseInt(req.body?.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await cotizacionesModel.countDocuments();

    const cotizaciones = await cotizacionesModel.find()
      .populate("idServicio", "nombreServicio idTipoServicio precio fotos")
      .populate("idPaqueteServicios", "Nombre Precio idTipoEvento Estado idServicios")
      .populate("idCliente", "Nombre Apellido Correo")
      .populate("idVehiculo", "nombre tipo Alquiler")
      .populate("idAlquiler", "Nombre Precio")
      .populate("idAdmin", "Nombre Apellido Correo")
      .populate("idColaboradores", "Nombre Apellido Correo")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ cotizaciones, total });
  } catch (error) {
    console.log("Error en cotizaciones " + error);
    return res.status(500).json({ message: "Error en cotizaciones" });
  }
};

// POST
cotizacionesController.insertCotizacion = async (req, res) => {
  try {
    let {
      NombreCotizacion,
      idServicio,
      idPaqueteServicios,
      idCliente,
      idVehiculo,
      idAlquiler,
      idAdmin,
      idColaboradores,
      precio,
      horaEvento,
      ubicacion,
      fechaEvento,
      PDF,
    } = req.body;
    NombreCotizacion = NombreCotizacion?.trim();
    horaEvento = horaEvento?.trim();
    fechaEvento = fechaEvento?.trim();
    PDF = PDF?.trim();

    const errores = await validarCotizacion({
      NombreCotizacion,
      idServicio,
      idPaqueteServicios,
      precio,
      horaEvento,
      ubicacion,
      fechaEvento,
    });

    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    precio = formatearPrecio(precio, [], "precio");

    const newCotizacion = new cotizacionesModel({
      NombreCotizacion,
      idServicio,
      idPaqueteServicios,
      idCliente,
      idVehiculo,
      idAlquiler,
      idAdmin,
      idColaboradores,
      precio,
      horaEvento,
      ubicacion,
      fechaEvento,
      PDF,
      estado: "pendiente de revision",
    });

    await newCotizacion.save();
    return res.status(200).json({ message: "Cotizacion creada" });
  } catch (error) {
    console.log("Error en cotizaciones " + error);
    return res.status(500).json({ message: "Error en cotizaciones" });
  }
};

// DELETE
cotizacionesController.deleteCotizacion = async (req, res) => {
  try {
    const cotizacion = await cotizacionesModel.findByIdAndDelete(req.params.id);
    if (!cotizacion) {
      return res.status(404).json({ message: "Cotizacion no encontrada" });
    }
    return res.status(200).json({ message: "Cotizacion eliminada" });
  } catch (error) {
    console.log("Error en cotizaciones " + error);
    return res.status(500).json({ message: "Error en cotizaciones" });
  }
};

// PUT
cotizacionesController.updateCotizacion = async (req, res) => {
  try {
    let {
      NombreCotizacion,
      idServicio,
      idPaqueteServicios,
      idCliente,
      idVehiculo,
      idAlquiler,
      idAdmin,
      idColaboradores,
      precio,
      horaEvento,
      ubicacion,
      fechaEvento,
      PDF,
      estado,
    } = req.body;
    NombreCotizacion = NombreCotizacion?.trim();
    horaEvento = horaEvento?.trim();
    fechaEvento = fechaEvento?.trim();
    PDF = PDF?.trim();
    estado = estado?.trim();

    const errores = await validarCotizacion({
      NombreCotizacion,
      idServicio,
      idPaqueteServicios,
      precio,
      horaEvento,
      ubicacion,
      fechaEvento,
    });

    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    precio = formatearPrecio(precio, [], "precio");

    await cotizacionesModel.findByIdAndUpdate(
      req.params.id,
      {
        NombreCotizacion,
        idServicio,
        idPaqueteServicios,
        idCliente,
        idVehiculo,
        idAlquiler,
        idAdmin,
        idColaboradores,
        precio,
        horaEvento,
        ubicacion,
        fechaEvento,
        PDF,
        estado: estado || "pendiente de revision",
      },
      { new: true },
    );
    return res.status(200).json({ message: "Cotizacion actualizada" });
  } catch (error) {
    console.log("Error en cotizaciones " + error);
    return res.status(500).json({ message: "Error en cotizaciones" });
  }
};

export default cotizacionesController;
