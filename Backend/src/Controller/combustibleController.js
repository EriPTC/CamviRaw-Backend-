import combustibleModel from "../models/combustible.js";

const combustibleController = {};

// ^$            = obligan a que toda la cadena cumpla la regla, no solo una parte
// A-Za-z        = letras sin tilde
// \u00C0-\u017F = letras con tilde, enes, u con dieresis, etc.
// \s            = espacios
// +             = minimo 1 caracter (no vacio)
const soloLetras = /^[A-Za-z\u00C0-\u017F\s]+$/;

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

const validarCombustible = ({ Nombre, precio }) => {
  const errores = [];

  if (!Nombre) {
    errores.push("Nombre es obligatorio");
  }

  if (Nombre && !soloLetras.test(Nombre)) {
    errores.push("Nombre no debe tener numeros ni caracteres especiales");
  }

  formatearPrecio(precio, errores, "precio");

  return errores;
};

// SELECT
combustibleController.getCombustibles = async (req, res) => {
  try {
    const combustibles = await combustibleModel.find();

    return res.status(200).json({ combustibles });
  } catch (error) {
    console.log("Error en combustibles " + error);
    return res.status(500).json({ message: "Error en combustibles" });
  }
};

// POST
combustibleController.insertCombustible = async (req, res) => {
  try {
    let { Nombre, precio } = req.body;
    Nombre = Nombre?.trim();

    const errores = validarCombustible({ Nombre, precio });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    precio = formatearPrecio(precio, [], "precio");

    const newCombustible = new combustibleModel({
      Nombre,
      precio,
    });

    await newCombustible.save();
    return res.status(200).json({ message: "Combustible creado" });
  } catch (error) {
    console.log("Error en combustibles " + error);
    return res.status(500).json({ message: "Error en combustibles" });
  }
};

// DELETE
combustibleController.deleteCombustible = async (req, res) => {
  try {
    const combustible = await combustibleModel.findByIdAndDelete(req.params.id);
    if (!combustible) {
      return res.status(404).json({ message: "Combustible no encontrado" });
    }
    return res.status(200).json({ message: "Combustible eliminado" });
  } catch (error) {
    console.log("Error en combustibles " + error);
    return res.status(500).json({ message: "Error en combustibles" });
  }
};

// PUT
combustibleController.updateCombustible = async (req, res) => {
  try {
    let { Nombre, precio } = req.body;
    Nombre = Nombre?.trim();

    const errores = validarCombustible({ Nombre, precio });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    precio = formatearPrecio(precio, [], "precio");

    await combustibleModel.findByIdAndUpdate(
      req.params.id,
      { Nombre, precio },
      { new: true },
    );
    return res.status(200).json({ message: "Combustible actualizado" });
  } catch (error) {
    console.log("Error en combustibles " + error);
    return res.status(500).json({ message: "Error en combustibles" });
  }
};

export default combustibleController;
