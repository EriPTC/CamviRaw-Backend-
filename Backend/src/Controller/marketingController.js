import marketingModel from "../models/Marketing.js";

const marketingController = {};

// SELECT
marketingController.getMarketing = async (req, res) => {
  try {
    const marketing = await marketingModel.find();

    return res.status(200).json({ marketing });
  } catch (error) {
    console.log("Error en marketing " + error);
    return res.status(500).json({ message: "Error en marketing" });
  }
};

// POST
marketingController.insertMarketing = async (req, res) => {
  try {
    let { nombre, descripcion } = req.body;
    nombre = nombre?.trim();
    descripcion = descripcion?.trim();

    if (!nombre) {
      return res.status(400).json({ message: "nombre es obligatorio" });
    }

    const newMarketing = new marketingModel({
      nombre,
      descripcion,
    });

    await newMarketing.save();
    return res.status(200).json({ message: "Marketing creado" });
  } catch (error) {
    console.log("Error en marketing " + error);
    return res.status(500).json({ message: "Error en marketing" });
  }
};

// DELETE
marketingController.deleteMarketing = async (req, res) => {
  try {
    const marketing = await marketingModel.findByIdAndDelete(req.params.id);
    if (!marketing) {
      return res.status(404).json({ message: "Marketing no encontrado" });
    }
    return res.status(200).json({ message: "Marketing eliminado" });
  } catch (error) {
    console.log("Error en marketing " + error);
    return res.status(500).json({ message: "Error en marketing" });
  }
};

// PUT
marketingController.updateMarketing = async (req, res) => {
  try {
    let { nombre, descripcion } = req.body;
    nombre = nombre?.trim();
    descripcion = descripcion?.trim();

    if (!nombre) {
      return res.status(400).json({ message: "nombre es obligatorio" });
    }

    await marketingModel.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion },
      { new: true },
    );
    return res.status(200).json({ message: "Marketing actualizado" });
  } catch (error) {
    console.log("Error en marketing " + error);
    return res.status(500).json({ message: "Error en marketing" });
  }
};

export default marketingController;
