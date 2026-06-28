import proveedoresModel from "../models/proveedores.js";

const proveedoresController = {};

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

const validarProveedor = ({ Nombre, telefono, correo, direccion }) => {
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

  if (!direccion) {
    errores.push("direccion es obligatoria");
  }

  return errores;
};

// SELECT
proveedoresController.getProveedores = async (req, res) => {
  try {
    const page = parseInt(req.body?.page) || 1;
    const limit = parseInt(req.body?.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await proveedoresModel.countDocuments();

    const proveedores = await proveedoresModel.find().skip(skip).limit(limit);

    return res.status(200).json({ proveedores, total });
  } catch (error) {
    console.log("Error en proveedores " + error);
    return res.status(500).json({ message: "Error en proveedores" });
  }
};

// POST
proveedoresController.insertProveedor = async (req, res) => {
  try {
    let { Nombre, telefono, correo, descripcion, direccion, foto } = req.body;
    Nombre = Nombre?.trim();
    telefono = formatearTelefono(telefono);
    correo = correo?.trim();
    descripcion = descripcion?.trim();
    direccion = direccion?.trim();
    foto = foto?.trim();

    const errores = validarProveedor({ Nombre, telefono, correo, direccion });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    const newProveedor = new proveedoresModel({
      Nombre,
      telefono,
      correo,
      descripcion,
      direccion,
      foto,
    });

    await newProveedor.save();
    return res.status(200).json({ message: "Proveedor creado" });
  } catch (error) {
    console.log("Error en proveedores " + error);
    return res.status(500).json({ message: "Error en proveedores" });
  }
};

// DELETE
proveedoresController.deleteProveedor = async (req, res) => {
  try {
    const proveedor = await proveedoresModel.findByIdAndDelete(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    return res.status(200).json({ message: "Proveedor eliminado" });
  } catch (error) {
    console.log("Error en proveedores " + error);
    return res.status(500).json({ message: "Error en proveedores" });
  }
};

// PUT
proveedoresController.updateProveedor = async (req, res) => {
  try {
    let { Nombre, telefono, correo, descripcion, direccion, foto } = req.body;
    Nombre = Nombre?.trim();
    telefono = formatearTelefono(telefono);
    correo = correo?.trim();
    descripcion = descripcion?.trim();
    direccion = direccion?.trim();
    foto = foto?.trim();

    const errores = validarProveedor({ Nombre, telefono, correo, direccion });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    await proveedoresModel.findByIdAndUpdate(
      req.params.id,
      { Nombre, telefono, correo, descripcion, direccion, foto },
      { new: true },
    );
    return res.status(200).json({ message: "Proveedor actualizado" });
  } catch (error) {
    console.log("Error en proveedores " + error);
    return res.status(500).json({ message: "Error en proveedores" });
  }
};

export default proveedoresController;
