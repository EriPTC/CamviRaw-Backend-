import vehiculosModel from "../models/vehiculos.js";

const vehiculosController = {};

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
  if (numero === undefined || numero === null || String(numero).trim() === "") {
    errores.push(`${campo} es obligatorio`);
    return;
  }

  const numeroLimpio = String(numero).trim();
  if (!soloNumeros.test(numeroLimpio) || Number(numeroLimpio) < 0) {
    errores.push(`${campo} no acepta letras, simbolos ni numeros negativos`);
  }
};

const validarVehiculo = ({ ConsumoGalon, tipo, Alquiler, idCombustible }) => {
  const errores = [];

  validarNumero(ConsumoGalon, errores, "ConsumoGalon");

  if (!tipo) {
    errores.push("tipo es obligatorio");
  }

  if (tipo && tipo.length < 3) {
    errores.push("tipo debe tener minimo 3 caracteres");
  }

  formatearPrecio(Alquiler, errores, "Alquiler");

  if (!idCombustible) {
    errores.push("idCombustible es obligatorio");
  }

  return errores;
};

// SELECT
vehiculosController.getVehiculos = async (req, res) => {
  try {
    const vehiculos = await vehiculosModel.find()
      .populate("idProveedor", "Nombre telefono correo")
      .populate("idCombustible", "Nombre precio");

    return res.status(200).json({ vehiculos });
  } catch (error) {
    console.log("Error en vehiculos " + error);
    return res.status(500).json({ message: "Error en vehiculos" });
  }
};

// POST
vehiculosController.insertVehiculo = async (req, res) => {
  try {
    let { ConsumoGalon, tipo, nombre, Alquiler, idProveedor, idCombustible } = req.body;
    tipo = tipo?.trim();
    nombre = nombre?.trim();

    const errores = validarVehiculo({ ConsumoGalon, tipo, Alquiler, idCombustible });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    Alquiler = formatearPrecio(Alquiler, [], "Alquiler");

    const newVehiculo = new vehiculosModel({
      ConsumoGalon,
      tipo,
      nombre,
      Alquiler,
      idProveedor,
      idCombustible,
    });

    await newVehiculo.save();
    return res.status(200).json({ message: "Vehiculo creado" });
  } catch (error) {
    console.log("Error en vehiculos " + error);
    return res.status(500).json({ message: "Error en vehiculos" });
  }
};

// DELETE
vehiculosController.deleteVehiculo = async (req, res) => {
  try {
    const vehiculo = await vehiculosModel.findByIdAndDelete(req.params.id);
    if (!vehiculo) {
      return res.status(404).json({ message: "Vehiculo no encontrado" });
    }
    return res.status(200).json({ message: "Vehiculo eliminado" });
  } catch (error) {
    console.log("Error en vehiculos " + error);
    return res.status(500).json({ message: "Error en vehiculos" });
  }
};

// PUT
vehiculosController.updateVehiculo = async (req, res) => {
  try {
    let { ConsumoGalon, tipo, nombre, Alquiler, idProveedor, idCombustible } = req.body;
    tipo = tipo?.trim();
    nombre = nombre?.trim();

    const errores = validarVehiculo({ ConsumoGalon, tipo, Alquiler, idCombustible });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    Alquiler = formatearPrecio(Alquiler, [], "Alquiler");

    await vehiculosModel.findByIdAndUpdate(
      req.params.id,
      { ConsumoGalon, tipo, nombre, Alquiler, idProveedor, idCombustible },
      { new: true },
    );
    return res.status(200).json({ message: "Vehiculo actualizado" });
  } catch (error) {
    console.log("Error en vehiculos " + error);
    return res.status(500).json({ message: "Error en vehiculos" });
  }
};

export default vehiculosController;
