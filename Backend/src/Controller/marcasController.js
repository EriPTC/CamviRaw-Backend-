import marcasModel from "../models/marcas.js";

const marcasController = {};

// GET ALL
marcasController.getMarcas = async (req, res) => {
  try {
    const marcas = await marcasModel.find();
    return res.status(200).json(marcas);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
marcasController.getMarcaById = async (req, res) => {
  try {
    const marca = await marcasModel.findById(req.params.id);
    if (!marca) return res.status(404).json({ message: "Marca no encontrada" });
    return res.status(200).json(marca);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT
marcasController.insertMarca = async (req, res) => {
  try {
    let { Nombre, telefono, correo } = req.body;

    Nombre = Nombre?.trim();
    correo = correo?.trim();

    if (!Nombre || !correo) {
      return res.status(400).json({ message: "Campos requeridos: Nombre, correo" });
    }
    if (Nombre.length < 2) {
      return res.status(400).json({ message: "Nombre muy corto" });
    }

    const imagen = req.file ? req.file.path : null;

    const newMarca = new marcasModel({ Nombre, telefono, correo, imagen });
    await newMarca.save();
    return res.status(201).json({ message: "Marca guardada" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE
marcasController.updateMarca = async (req, res) => {
  try {
    let { Nombre, telefono, correo } = req.body;
    Nombre = Nombre?.trim();

    const imagen = req.file ? req.file.path : undefined;
    const updateData = { Nombre, telefono, correo };
    if (imagen) updateData.imagen = imagen;

    const updated = await marcasModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Marca no encontrada" });
    return res.status(200).json({ message: "Marca actualizada" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
marcasController.deleteMarca = async (req, res) => {
  try {
    const deleted = await marcasModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Marca no encontrada" });
    return res.status(200).json({ message: "Marca eliminada" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default marcasController;
