import vehiculosModel from "../models/vehiculos.js";

const vehiculosController = {};

// GET ALL
vehiculosController.getVehiculos = async (req, res) => {
  try {
    const vehiculos = await vehiculosModel.find()
      .populate("idProveedor", "Nombre telefono correo")
      .populate("idCombustible", "Nombre precio");
    return res.status(200).json(vehiculos);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
vehiculosController.getVehiculoById = async (req, res) => {
  try {
    const vehiculo = await vehiculosModel.findById(req.params.id)
      .populate("idProveedor", "Nombre telefono correo")
      .populate("idCombustible", "Nombre precio");
    if (!vehiculo) return res.status(404).json({ message: "Vehículo no encontrado" });
    return res.status(200).json(vehiculo);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT
vehiculosController.insertVehiculo = async (req, res) => {
  try {
    let { ConsumoGalon, tipo, nombre, Alquiler,  idProveedor, idCombustible } = req.body;

    nombre = nombre?.trim();
    tipo = tipo?.trim();

    if (!nombre || !tipo || Alquiler === undefined) {
      return res.status(400).json({ message: "Campos requeridos: nombre, tipo, Alquiler" });
    }

    

    const newVehiculo = new vehiculosModel({
      ConsumoGalon, tipo, nombre, Alquiler,  idProveedor, idCombustible,
    });
    await newVehiculo.save();
    return res.status(201).json({ message: "Vehículo guardado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE
vehiculosController.updateVehiculo = async (req, res) => {
  try {
    const { ConsumoGalon, tipo, nombre, Alquiler,  idProveedor, idCombustible } = req.body;

    
    const updateData = { ConsumoGalon, tipo, nombre, Alquiler, idProveedor, idCombustible };
    

    const updated = await vehiculosModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Vehículo no encontrado" });
    return res.status(200).json({ message: "Vehículo actualizado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
vehiculosController.deleteVehiculo = async (req, res) => {
  try {
    const deleted = await vehiculosModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Vehículo no encontrado" });
    return res.status(200).json({ message: "Vehículo eliminado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default vehiculosController;
