import inventarioModel from "../models/inventario.js";

const inventarioController = {};

// ^$        = toda la cadena debe ser numerica
// \d+       = uno o mas digitos
// (\.\d+)?  = decimales opcionales
const soloNumeros = /^\d+(\.\d+)?$/;

const validarNumero = (numero, errores, campo) => {
  if (numero === undefined || numero === null || String(numero).trim() === "") {
    errores.push(`${campo} es obligatorio`);
    return;
  }

  const numeroLimpio = String(numero).trim();
  if (!soloNumeros.test(numeroLimpio) || Number(numeroLimpio) < 0) {
    errores.push(`${campo} no acepta letras, simbolos ni numeros negativos`);
  }
};

const validarInventario = ({ Equipo, Cantidad, idClasificacion }) => {
  const errores = [];

  if (!Equipo) {
    errores.push("Equipo es obligatorio");
  }

  if (Equipo && Equipo.length < 3) {
    errores.push("Equipo debe tener minimo 3 caracteres");
  }

  validarNumero(Cantidad, errores, "Cantidad");

  if (!idClasificacion) {
    errores.push("idClasificacion es obligatorio");
  }

  return errores;
};

// SELECT
inventarioController.getInventario = async (req, res) => {
  try {
    const page = parseInt(req.body?.page) || 1;
    const limit = parseInt(req.body?.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await inventarioModel.countDocuments();

    const inventario = await inventarioModel.find()
      .populate("idClasificacion", "nombre")
      .populate("idCompraMaterial", "nombreMaterial precioTotal fechaCompra")
      .populate("idAlquiler", "Nombre Precio")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ inventario, total });
  } catch (error) {
    console.log("Error en inventario " + error);
    return res.status(500).json({ message: "Error en inventario" });
  }
};

// POST
inventarioController.insertInventario = async (req, res) => {
  try {
    let {
      Equipo,
      Cantidad,
      Descripcion,
      Estado,
      idClasificacion,
      idCompraMaterial,
      idAlquiler,
      tipoInventario,
    } = req.body;
    Equipo = Equipo?.trim();
    Descripcion = Descripcion?.trim();
    Estado = Estado?.trim();
    tipoInventario = tipoInventario?.trim();

    const errores = validarInventario({ Equipo, Cantidad, idClasificacion });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    const newInventario = new inventarioModel({
      Equipo,
      Cantidad,
      Descripcion,
      Estado: Estado || "Buen estado",
      idClasificacion,
      idCompraMaterial,
      idAlquiler,
      tipoInventario: tipoInventario || "Propio",
    });

    await newInventario.save();
    return res.status(200).json({ message: "Inventario creado" });
  } catch (error) {
    console.log("Error en inventario " + error);
    return res.status(500).json({ message: "Error en inventario" });
  }
};

// DELETE
inventarioController.deleteInventario = async (req, res) => {
  try {
    const inventario = await inventarioModel.findByIdAndDelete(req.params.id);
    if (!inventario) {
      return res.status(404).json({ message: "Inventario no encontrado" });
    }
    return res.status(200).json({ message: "Inventario eliminado" });
  } catch (error) {
    console.log("Error en inventario " + error);
    return res.status(500).json({ message: "Error en inventario" });
  }
};

// PUT
inventarioController.updateInventario = async (req, res) => {
  try {
    let {
      Equipo,
      Cantidad,
      Descripcion,
      Estado,
      idClasificacion,
      idCompraMaterial,
      idAlquiler,
      tipoInventario,
    } = req.body;
    Equipo = Equipo?.trim();
    Descripcion = Descripcion?.trim();
    Estado = Estado?.trim();
    tipoInventario = tipoInventario?.trim();

    const errores = validarInventario({ Equipo, Cantidad, idClasificacion });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    await inventarioModel.findByIdAndUpdate(
      req.params.id,
      {
        Equipo,
        Cantidad,
        Descripcion,
        Estado: Estado || "Buen estado",
        idClasificacion,
        idCompraMaterial,
        idAlquiler,
        tipoInventario,
      },
      { new: true },
    );
    return res.status(200).json({ message: "Inventario actualizado" });
  } catch (error) {
    console.log("Error en inventario " + error);
    return res.status(500).json({ message: "Error en inventario" });
  }
};

export default inventarioController;
