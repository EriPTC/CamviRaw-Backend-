import tipoServicioModel from "../models/TipoServicio.js";

const tipoServicioController = {};

// ^$            = obligan a que toda la cadena cumpla la regla, no solo una parte
// A-Za-z        = letras sin tilde
// \u00C0-\u017F = letras con tilde, enes, u con dieresis, etc.
// \s            = espacios
// +             = minimo 1 caracter (no vacio)
const soloLetras = /^[A-Za-z\u00C0-\u017F\s]+$/;

const validarTipoServicio = (nombre) => {
  const errores = [];

  if (!nombre) {
    errores.push("nombre es obligatorio");
  }

  if (nombre && !soloLetras.test(nombre)) {
    errores.push("nombre no debe tener numeros ni caracteres especiales");
  }

  return errores;
};

// SELECT
tipoServicioController.getTiposServicio = async (req, res) => {
  try {
    const tiposServicio = await tipoServicioModel.find();

    return res.status(200).json({ tiposServicio });
  } catch (error) {
    console.log("Error en tipos de servicio " + error);
    return res.status(500).json({ message: "Error en tipos de servicio" });
  }
};

// POST
tipoServicioController.insertTipoServicio = async (req, res) => {
  try {
    let { nombre, descripcion } = req.body;
    nombre = nombre?.trim();
    descripcion = descripcion?.trim();

    const errores = validarTipoServicio(nombre);
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    const newTipoServicio = new tipoServicioModel({
      nombre,
      descripcion,
    });

    await newTipoServicio.save();
    return res.status(200).json({ message: "Tipo de servicio creado" });
  } catch (error) {
    console.log("Error en tipos de servicio " + error);
    return res.status(500).json({ message: "Error en tipos de servicio" });
  }
};

// DELETE
tipoServicioController.deleteTipoServicio = async (req, res) => {
  try {
    const tipoServicio = await tipoServicioModel.findByIdAndDelete(req.params.id);
    if (!tipoServicio) {
      return res.status(404).json({ message: "Tipo de servicio no encontrado" });
    }
    return res.status(200).json({ message: "Tipo de servicio eliminado" });
  } catch (error) {
    console.log("Error en tipos de servicio " + error);
    return res.status(500).json({ message: "Error en tipos de servicio" });
  }
};

// PUT
tipoServicioController.updateTipoServicio = async (req, res) => {
  try {
    let { nombre, descripcion } = req.body;
    nombre = nombre?.trim();
    descripcion = descripcion?.trim();

    const errores = validarTipoServicio(nombre);
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    await tipoServicioModel.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion },
      { new: true },
    );
    return res.status(200).json({ message: "Tipo de servicio actualizado" });
  } catch (error) {
    console.log("Error en tipos de servicio " + error);
    return res.status(500).json({ message: "Error en tipos de servicio" });
  }
};

export default tipoServicioController;
