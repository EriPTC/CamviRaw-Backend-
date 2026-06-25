import gastosModel from "../models/gastos.js";

const gastosController = {};

// GET ALL
gastosController.getGastos = async (req, res) => {
  try {
    const gastos = await gastosModel.find()
      .populate("idClasificacion", "nombre");
    return res.status(200).json(gastos);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
gastosController.getGastoById = async (req, res) => {
  try {
    const gasto = await gastosModel.findById(req.params.id)
      .populate("idClasificacion", "nombre");
    if (!gasto) return res.status(404).json({ message: "Gasto no encontrado" });
    return res.status(200).json(gasto);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT
gastosController.insertGasto = async (req, res) => {
  try {
    let { descripcion, tipo, valor, fechaRegistro, idClasificacion } = req.body;

    descripcion = descripcion?.trim();
    tipo = tipo?.trim();

    if (!descripcion || !tipo || valor === undefined || !idClasificacion) {
      return res.status(400).json({ message: "Campos requeridos: descripcion, tipo, valor, idClasificacion" });
    }
    if (Number(valor) < 0) {
      return res.status(400).json({ message: "El valor no puede ser negativo" });
    }

    const newGasto = new gastosModel({ descripcion, tipo, valor, fechaRegistro, idClasificacion });
    await newGasto.save();
    return res.status(201).json({ message: "Gasto guardado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE
gastosController.updateGasto = async (req, res) => {
  try {
    const { descripcion, tipo, valor, fechaRegistro, idClasificacion } = req.body;

    const updated = await gastosModel.findByIdAndUpdate(
      req.params.id,
      { descripcion, tipo, valor, fechaRegistro, idClasificacion },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Gasto no encontrado" });
    return res.status(200).json({ message: "Gasto actualizado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
gastosController.deleteGasto = async (req, res) => {
  try {
    const deleted = await gastosModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Gasto no encontrado" });
    return res.status(200).json({ message: "Gasto eliminado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default gastosController;
