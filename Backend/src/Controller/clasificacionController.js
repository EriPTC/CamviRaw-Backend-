import clasificacionModel from "../models/clasificacion.js";

const clasificacionController = {};

// ^$            = obligan a que toda la cadena cumpla la regla, no solo una parte
// A-Za-z        = letras sin tilde
// \u00C0-\u017F = letras con tilde, enes, u con dieresis, etc.
// \s            = espacios
// +             = minimo 1 caracter (no vacio)
const soloLetras = /^[A-Za-z\u00C0-\u017F\s]+$/;

const validarClasificacion = (nombre) => {
  const erroresNombre = [];

  if (!nombre) {
    erroresNombre.push("nombre es obligatorio");
  }

  if (nombre) {
    if (nombre.length < 3) {
      erroresNombre.push("nombre debe tener minimo 3 caracteres");
    }
    if (!soloLetras.test(nombre)) {
      erroresNombre.push("nombre no debe tener numeros ni caracteres especiales");
    }
  }

  return erroresNombre;
};

// SELECT
clasificacionController.getClasificaciones = async (req, res) => {
  try {
    const clasificaciones = await clasificacionModel.find();

    return res.status(200).json({ clasificaciones });
  } catch (error) {
    console.log("Error en clasificaciones " + error);
    return res.status(500).json({ message: "Error en clasificaciones" });
  }
};

// POST
clasificacionController.insertClasificacion = async (req, res) => {
  try {
    let { nombre } = req.body;
    nombre = nombre?.trim();

    const erroresNombre = validarClasificacion(nombre);
    if (erroresNombre.length > 0) {
      return res.status(400).json({ message: erroresNombre.join(", ") });
    }

    const newClasificacion = new clasificacionModel({
      nombre,
    });

    await newClasificacion.save();
    return res.status(200).json({ message: "Clasificacion creada" });
  } catch (error) {
    console.log("Error en clasificaciones " + error);
    return res.status(500).json({ message: "Error en clasificaciones" });
  }
};

// DELETE
clasificacionController.deleteClasificacion = async (req, res) => {
  try {
    const clasificacion = await clasificacionModel.findByIdAndDelete(req.params.id);
    if (!clasificacion) {
      return res.status(404).json({ message: "Clasificacion no encontrada" });
    }
    return res.status(200).json({ message: "Clasificacion eliminada" });
  } catch (error) {
    console.log("Error en clasificaciones " + error);
    return res.status(500).json({ message: "Error en clasificaciones" });
  }
};

// PUT
clasificacionController.updateClasificacion = async (req, res) => {
  try {
    let { nombre } = req.body;
    nombre = nombre?.trim();

    const erroresNombre = validarClasificacion(nombre);
    if (erroresNombre.length > 0) {
      return res.status(400).json({ message: erroresNombre.join(", ") });
    }

    await clasificacionModel.findByIdAndUpdate(
      req.params.id,
      { nombre },
      { new: true },
    );
    return res.status(200).json({ message: "Clasificacion actualizada" });
  } catch (error) {
    console.log("Error en clasificaciones " + error);
    return res.status(500).json({ message: "Error en clasificaciones" });
  }
};

export default clasificacionController;
