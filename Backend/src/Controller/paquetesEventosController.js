import paquetesEventosModel from "../models/paquetesEventos.js";

const paquetesEventosController = {};

// GET ALL
paquetesEventosController.getPaquetes = async (req, res) => {
  try {
    const paquetes = await paquetesEventosModel.find()
      .populate("idServicios", "NombreServicio TipoServicio Precio");
    return res.status(200).json(paquetes);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
paquetesEventosController.getPaqueteById = async (req, res) => {
  try {
    const paquete = await paquetesEventosModel.findById(req.params.id)
      .populate("idServicios", "NombreServicio TipoServicio Precio");
    if (!paquete) return res.status(404).json({ message: "Paquete no encontrado" });
    return res.status(200).json(paquete);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT
paquetesEventosController.insertPaquete = async (req, res) => {
  try {
    let { Nombre, Precio, Descripcion, Tipo, Estado, idServicios } = req.body;

    Nombre = Nombre?.trim();
    Tipo = Tipo?.trim();

    if (!Nombre || Precio === undefined || !Tipo) {
      return res.status(400).json({ message: "Campos requeridos: Nombre, Precio, Tipo" });
    }
    if (Number(Precio) < 0) {
      return res.status(400).json({ message: "El precio no puede ser negativo" });
    }

    const newPaquete = new paquetesEventosModel({
      Nombre, Precio, Descripcion, Tipo,
      Estado: Estado || "Activo",
      idServicios: idServicios || [],
    });
    await newPaquete.save();
    return res.status(201).json({ message: "Paquete guardado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE
paquetesEventosController.updatePaquete = async (req, res) => {
  try {
    const { Nombre, Precio, Descripcion, Tipo, Estado, idServicios } = req.body;

    const updated = await paquetesEventosModel.findByIdAndUpdate(
      req.params.id,
      { Nombre, Precio, Descripcion, Tipo, Estado, idServicios },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Paquete no encontrado" });
    return res.status(200).json({ message: "Paquete actualizado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
paquetesEventosController.deletePaquete = async (req, res) => {
  try {
    const deleted = await paquetesEventosModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Paquete no encontrado" });
    return res.status(200).json({ message: "Paquete eliminado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default paquetesEventosController;
