import paquetesEventosModel from "../models/paquetesEventos.js";

const paquetesEventosController = {};

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

const validarPaquete = ({ Nombre, Precio, idTipoEvento, idServicios }) => {
  const errores = [];

  if (!Nombre) {
    errores.push("Nombre es obligatorio");
  }

  if (Nombre && Nombre.length < 3) {
    errores.push("Nombre debe tener minimo 3 caracteres");
  }

  formatearPrecio(Precio, errores, "Precio");

  if (!idTipoEvento) {
    errores.push("idTipoEvento es obligatorio");
  }

  if (!Array.isArray(idServicios) || idServicios.length < 2) {
    errores.push("idServicios debe tener minimo 2 servicios");
  }

  return errores;
};

// SELECT
paquetesEventosController.getPaquetes = async (req, res) => {
  try {
    const page = parseInt(req.body?.page) || 1;
    const limit = parseInt(req.body?.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await paquetesEventosModel.countDocuments();

    const paquetes = await paquetesEventosModel.find()
      .populate("idTipoEvento", "nombre descripcion")
      .populate("idServicios", "nombreServicio idTipoServicio precio fotos")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ paquetes, total });
  } catch (error) {
    console.log("Error en paquetes de eventos " + error);
    return res.status(500).json({ message: "Error en paquetes de eventos" });
  }
};

// POST
paquetesEventosController.insertPaquete = async (req, res) => {
  try {
    let { Nombre, Precio, Descripcion, idTipoEvento, IdTipoEvento, Estado, idServicios } = req.body;
    Nombre = Nombre?.trim();
    Descripcion = Descripcion?.trim();
    Estado = Estado?.trim();
    idTipoEvento = idTipoEvento || IdTipoEvento;

    const errores = validarPaquete({ Nombre, Precio, idTipoEvento, idServicios });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    Precio = formatearPrecio(Precio, [], "Precio");

    const newPaquete = new paquetesEventosModel({
      Nombre,
      Precio,
      Descripcion,
      idTipoEvento,
      Estado: Estado || "Activo",
      idServicios,
    });

    await newPaquete.save();
    return res.status(200).json({ message: "Paquete de eventos creado" });
  } catch (error) {
    console.log("Error en paquetes de eventos " + error);
    return res.status(500).json({ message: "Error en paquetes de eventos" });
  }
};

// DELETE
paquetesEventosController.deletePaquete = async (req, res) => {
  try {
    const paquete = await paquetesEventosModel.findByIdAndDelete(req.params.id);
    if (!paquete) {
      return res.status(404).json({ message: "Paquete de eventos no encontrado" });
    }
    return res.status(200).json({ message: "Paquete de eventos eliminado" });
  } catch (error) {
    console.log("Error en paquetes de eventos " + error);
    return res.status(500).json({ message: "Error en paquetes de eventos" });
  }
};

// PUT
paquetesEventosController.updatePaquete = async (req, res) => {
  try {
    let { Nombre, Precio, Descripcion, idTipoEvento, IdTipoEvento, Estado, idServicios } = req.body;
    Nombre = Nombre?.trim();
    Descripcion = Descripcion?.trim();
    Estado = Estado?.trim();
    idTipoEvento = idTipoEvento || IdTipoEvento;

    const errores = validarPaquete({ Nombre, Precio, idTipoEvento, idServicios });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    Precio = formatearPrecio(Precio, [], "Precio");

    await paquetesEventosModel.findByIdAndUpdate(
      req.params.id,
      {
        Nombre,
        Precio,
        Descripcion,
        idTipoEvento,
        Estado: Estado || "Activo",
        idServicios,
      },
      { new: true },
    );
    return res.status(200).json({ message: "Paquete de eventos actualizado" });
  } catch (error) {
    console.log("Error en paquetes de eventos " + error);
    return res.status(500).json({ message: "Error en paquetes de eventos" });
  }
};

export default paquetesEventosController;
