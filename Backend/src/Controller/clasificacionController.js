import clasificacionModel from "../models/clasificacion.js";

const clasificacionController = {};

// GET ALL
clasificacionController.getClasificaciones = async (req, res) => {
  try {
    const clasificaciones = await clasificacionModel.find();
    return res.status(200).json(clasificaciones);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
clasificacionController.getClasificacionById = async (req, res) => {
  try {
    const clasificacion = await clasificacionModel.findById(req.params.id);
    if (!clasificacion) return res.status(404).json({ message: "Clasificacion no encontrada" });
    return res.status(200).json(clasificacion);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT
clasificacionController.insertClasificacion = async (req, res) => {
  try {
    let { nombre } = req.body;
    nombre = nombre?.trim();

    if (!nombre) return res.status(400).json({ message: "Campo requerido: nombre" });
    if (nombre.length < 2) return res.status(400).json({ message: "Nombre muy corto" });

    const newClasificacion = new clasificacionModel({ nombre });
    await newClasificacion.save();
    return res.status(201).json({ message: "Clasificacion guardada" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE
clasificacionController.updateClasificacion = async (req, res) => {
  try {
    const { nombre } = req.body;
    const updated = await clasificacionModel.findByIdAndUpdate(
      req.params.id,
      { nombre },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Clasificacion no encontrada" });
    return res.status(200).json({ message: "Clasificacion actualizada" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
clasificacionController.deleteClasificacion = async (req, res) => {
  try {
    const deleted = await clasificacionModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Clasificacion no encontrada" });
    return res.status(200).json({ message: "Clasificacion eliminada" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default clasificacionController;
