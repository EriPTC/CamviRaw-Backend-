import marcasModel from "../models/marcas.js";

const marcasController = {};

// ^$            = obligan a que toda la cadena cumpla la regla, no solo una parte
// A-Za-z        = letras sin tilde
// \u00C0-\u017F = letras con tilde, enes, u con dieresis, etc.
// \s            = espacios
// +             = minimo 1 caracter (no vacio)
const soloLetras = /^[A-Za-z\u00C0-\u017F\s]+$/;

// ^$    = toda la cadena debe cumplir el formato
// \d{4} = exactamente 4 numeros
// -     = guion obligatorio
const telefonoRegex = /^\d{4}-\d{4}$/;

const formatearTelefono = (telefono) => {
  if (!telefono) return telefono;
  const soloDigitos = String(telefono).replace(/\D/g, "");

  if (soloDigitos.length === 8) {
    return `${soloDigitos.slice(0, 4)}-${soloDigitos.slice(4)}`;
  }

  return String(telefono).trim();
};

const validarMarca = ({ Nombre, telefono, correo, idMarketing }) => {
  const errores = [];

  if (!Nombre) {
    errores.push("Nombre es obligatorio");
  }

  if (Nombre && !soloLetras.test(Nombre)) {
    errores.push("Nombre no debe tener numeros ni caracteres especiales");
  }

  if (!telefono) {
    errores.push("telefono es obligatorio");
  }

  if (telefono && !telefonoRegex.test(telefono)) {
    errores.push("telefono debe tener formato 1234-1234");
  }

  if (!correo) {
    errores.push("correo es obligatorio");
  }

  if (correo && !correo.includes("@")) {
    errores.push("correo debe incluir @");
  }

  if (!idMarketing) {
    errores.push("idMarketing es obligatorio");
  }

  return errores;
};

// SELECT
marcasController.getMarcas = async (req, res) => {
  try {
    const page = parseInt(req.body?.page) || 1;
    const limit = parseInt(req.body?.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await marcasModel.countDocuments();

    const marcas = await marcasModel.find()
      .populate("idMarketing", "nombre descripcion")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ marcas, total });
  } catch (error) {
    console.log("Error en marcas " + error);
    return res.status(500).json({ message: "Error en marcas" });
  }
};

// POST
marcasController.insertMarca = async (req, res) => {
  try {
    let { Nombre, telefono, correo, imagen, idMarketing, descripcion } = req.body;
    Nombre = Nombre?.trim();
    telefono = formatearTelefono(telefono);
    correo = correo?.trim();
    imagen = imagen?.trim();
    descripcion = descripcion?.trim();

    const errores = validarMarca({ Nombre, telefono, correo, idMarketing });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    const newMarca = new marcasModel({
      Nombre,
      telefono,
      correo,
      imagen,
      idMarketing,
      descripcion,
    });

    await newMarca.save();
    return res.status(200).json({ message: "Marca creada" });
  } catch (error) {
    console.log("Error en marcas " + error);
    return res.status(500).json({ message: "Error en marcas" });
  }
};

// DELETE
marcasController.deleteMarca = async (req, res) => {
  try {
    const marca = await marcasModel.findByIdAndDelete(req.params.id);
    if (!marca) {
      return res.status(404).json({ message: "Marca no encontrada" });
    }
    return res.status(200).json({ message: "Marca eliminada" });
  } catch (error) {
    console.log("Error en marcas " + error);
    return res.status(500).json({ message: "Error en marcas" });
  }
};

// PUT
marcasController.updateMarca = async (req, res) => {
  try {
    let { Nombre, telefono, correo, imagen, idMarketing, descripcion } = req.body;
    Nombre = Nombre?.trim();
    telefono = formatearTelefono(telefono);
    correo = correo?.trim();
    imagen = imagen?.trim();
    descripcion = descripcion?.trim();

    const errores = validarMarca({ Nombre, telefono, correo, idMarketing });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    await marcasModel.findByIdAndUpdate(
      req.params.id,
      { Nombre, telefono, correo, imagen, idMarketing, descripcion },
      { new: true },
    );
    return res.status(200).json({ message: "Marca actualizada" });
  } catch (error) {
    console.log("Error en marcas " + error);
    return res.status(500).json({ message: "Error en marcas" });
  }
};

export default marcasController;
