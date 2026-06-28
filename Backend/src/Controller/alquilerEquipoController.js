import alquilerEquipoModel from "../models/alquilerEquipo.js";
import inventarioModel from "../models/inventario.js";

const alquilerEquipoController = {};

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

const validarNumero = (numero, errores, campo) => {
  if (numero === undefined || numero === null || String(numero).trim() === "") return;

  const numeroLimpio = String(numero).trim();
  if (!soloNumeros.test(numeroLimpio) || Number(numeroLimpio) < 0) {
    errores.push(`${campo} no acepta letras, simbolos ni numeros negativos`);
  }
};

const validarAlquiler = ({ Nombre, Precio, idProveedor, Cantidad }) => {
  const errores = [];

  if (!Nombre) {
    errores.push("Nombre es obligatorio");
  }

  if (Nombre && Nombre.length < 3) {
    errores.push("Nombre debe tener minimo 3 caracteres");
  }

  formatearPrecio(Precio, errores, "Precio");

  if (!idProveedor) {
    errores.push("idProveedor es obligatorio");
  }

  validarNumero(Cantidad, errores, "Cantidad");

  return errores;
};

// SELECT
alquilerEquipoController.getAlquileres = async (req, res) => {
  try {
    const page = parseInt(req.body?.page) || 1;
    const limit = parseInt(req.body?.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await alquilerEquipoModel.countDocuments();

    const alquileres = await alquilerEquipoModel.find()
      .populate("idProveedor", "Nombre telefono correo")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ alquileres, total });
  } catch (error) {
    console.log("Error en alquileres " + error);
    return res.status(500).json({ message: "Error en alquileres" });
  }
};

// POST
alquilerEquipoController.insertAlquiler = async (req, res) => {
  try {
    let { Nombre, Precio, Descripcion, idProveedor, idClasificacion, Cantidad } = req.body;
    Nombre = Nombre?.trim();
    Descripcion = Descripcion?.trim();

    const errores = validarAlquiler({ Nombre, Precio, idProveedor, Cantidad });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    Precio = formatearPrecio(Precio, [], "Precio");

    const newAlquiler = new alquilerEquipoModel({
      Nombre,
      Precio,
      Descripcion,
      idProveedor,
    });

    const savedAlquiler = await newAlquiler.save();

    await inventarioModel.create({
      Equipo: Nombre,
      Cantidad: Cantidad || 1,
      Descripcion,
      Estado: "Buen estado",
      idClasificacion,
      idAlquiler: savedAlquiler._id,
      tipoInventario: "Alquiler",
    });

    return res.status(200).json({ message: "Alquiler creado" });
  } catch (error) {
    console.log("Error en alquileres " + error);
    return res.status(500).json({ message: "Error en alquileres" });
  }
};

// DELETE
alquilerEquipoController.deleteAlquiler = async (req, res) => {
  try {
    const alquiler = await alquilerEquipoModel.findByIdAndDelete(req.params.id);
    if (!alquiler) {
      return res.status(404).json({ message: "Alquiler no encontrado" });
    }
    return res.status(200).json({ message: "Alquiler eliminado" });
  } catch (error) {
    console.log("Error en alquileres " + error);
    return res.status(500).json({ message: "Error en alquileres" });
  }
};

// PUT
alquilerEquipoController.updateAlquiler = async (req, res) => {
  try {
    let { Nombre, Precio, Descripcion, idProveedor } = req.body;
    Nombre = Nombre?.trim();
    Descripcion = Descripcion?.trim();

    const errores = validarAlquiler({ Nombre, Precio, idProveedor });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    Precio = formatearPrecio(Precio, [], "Precio");

    await alquilerEquipoModel.findByIdAndUpdate(
      req.params.id,
      { Nombre, Precio, Descripcion, idProveedor },
      { new: true },
    );
    return res.status(200).json({ message: "Alquiler actualizado" });
  } catch (error) {
    console.log("Error en alquileres " + error);
    return res.status(500).json({ message: "Error en alquileres" });
  }
};

export default alquilerEquipoController;
