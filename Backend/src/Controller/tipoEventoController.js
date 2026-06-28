import tipoEventoModel from "../models/TipoEvento.js";

const tipoEventoController = {};

// ^$            = obligan a que toda la cadena cumpla la regla, no solo una parte
// A-Za-z        = letras sin tilde
// \u00C0-\u017F = letras con tilde, enes, u con dieresis, etc.
// \s            = espacios
// +             = minimo 1 caracter (no vacio)
const soloLetras = /^[A-Za-z\u00C0-\u017F\s]+$/;

const validarTipoEvento = (nombre) => {
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
tipoEventoController.getTiposEvento = async (req, res) => {
  try {
    const tiposEvento = await tipoEventoModel.find();

    return res.status(200).json({ tiposEvento });
  } catch (error) {
    console.log("Error en tipos de evento " + error);
    return res.status(500).json({ message: "Error en tipos de evento" });
  }
};

// POST
tipoEventoController.insertTipoEvento = async (req, res) => {
  try {
    let { nombre, NombreCategoria, descripcion } = req.body;
    nombre = nombre?.trim() || NombreCategoria?.trim();
    descripcion = descripcion?.trim();

    const errores = validarTipoEvento(nombre);
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    const newTipoEvento = new tipoEventoModel({
      nombre,
      descripcion,
    });

    await newTipoEvento.save();
    return res.status(200).json({ message: "Tipo de evento creado" });
  } catch (error) {
    console.log("Error en tipos de evento " + error);
    return res.status(500).json({ message: "Error en tipos de evento" });
  }
};

// DELETE
tipoEventoController.deleteTipoEvento = async (req, res) => {
  try {
    const tipoEvento = await tipoEventoModel.findByIdAndDelete(req.params.id);
    if (!tipoEvento) {
      return res.status(404).json({ message: "Tipo de evento no encontrado" });
    }
    return res.status(200).json({ message: "Tipo de evento eliminado" });
  } catch (error) {
    console.log("Error en tipos de evento " + error);
    return res.status(500).json({ message: "Error en tipos de evento" });
  }
};

// PUT
tipoEventoController.updateTipoEvento = async (req, res) => {
  try {
    let { nombre, NombreCategoria, descripcion } = req.body;
    nombre = nombre?.trim() || NombreCategoria?.trim();
    descripcion = descripcion?.trim();

    const errores = validarTipoEvento(nombre);
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    await tipoEventoModel.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion },
      { new: true },
    );
    return res.status(200).json({ message: "Tipo de evento actualizado" });
  } catch (error) {
    console.log("Error en tipos de evento " + error);
    return res.status(500).json({ message: "Error en tipos de evento" });
  }
};

export default tipoEventoController;
