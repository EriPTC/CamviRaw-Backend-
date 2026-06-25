import combustibleModel from "../models/combustible.js";

const combustibleController = {};

// GET ALL
combustibleController.getCombustibles = async (req, res) => {
  try {
    const combustibles = await combustibleModel.find();
    return res.status(200).json(combustibles);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
combustibleController.getCombustibleById = async (req, res) => {
  try {
    const combustible = await combustibleModel.findById(req.params.id);
    if (!combustible) return res.status(404).json({ message: "Combustible no encontrado" });
    return res.status(200).json(combustible);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT
combustibleController.insertCombustible = async (req, res) => {
  try {
    let { Nombre, precio } = req.body;

    Nombre = Nombre?.trim();

    if (!Nombre || precio === undefined) {
      return res.status(400).json({ message: "Campos requeridos: Nombre, precio" });
    }
    if (Number(precio) < 0) {
      return res.status(400).json({ message: "El precio no puede ser negativo" });
    }

    const newCombustible = new combustibleModel({ Nombre, precio });
    await newCombustible.save();
    return res.status(201).json({ message: "Combustible guardado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE
combustibleController.updateCombustible = async (req, res) => {
  try {
    const { Nombre, precio } = req.body;

    const updated = await combustibleModel.findByIdAndUpdate(
      req.params.id,
      { Nombre, precio },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Combustible no encontrado" });
    return res.status(200).json({ message: "Combustible actualizado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
combustibleController.deleteCombustible = async (req, res) => {
  try {
    const deleted = await combustibleModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Combustible no encontrado" });
    return res.status(200).json({ message: "Combustible eliminado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default combustibleController;
