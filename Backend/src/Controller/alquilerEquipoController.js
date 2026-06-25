import alquilerEquipoModel from "../models/alquilerEquipo.js";

const alquilerEquipoController = {};

// GET ALL
alquilerEquipoController.getAlquileres = async (req, res) => {
  try {
    const alquileres = await alquilerEquipoModel.find()
      .populate("idProveedor", "Nombre telefono correo");
    return res.status(200).json(alquileres);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
alquilerEquipoController.getAlquilerById = async (req, res) => {
  try {
    const alquiler = await alquilerEquipoModel.findById(req.params.id)
      .populate("idProveedor", "Nombre telefono correo");
    if (!alquiler) return res.status(404).json({ message: "AlquilerEquipo no encontrado" });
    return res.status(200).json(alquiler);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT
alquilerEquipoController.insertAlquiler = async (req, res) => {
  try {
    let { Nombre, Precio, Descripcion, idProveedor } = req.body;

    Nombre = Nombre?.trim();

    if (!Nombre || Precio === undefined || !idProveedor) {
      return res.status(400).json({ message: "Campos requeridos: Nombre, Precio, idProveedor" });
    }
    if (Number(Precio) < 0) {
      return res.status(400).json({ message: "El precio no puede ser negativo" });
    }

    const newAlquiler = new alquilerEquipoModel({ Nombre, Precio, Descripcion, idProveedor });
    await newAlquiler.save();
    return res.status(201).json({ message: "AlquilerEquipo guardado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE
alquilerEquipoController.updateAlquiler = async (req, res) => {
  try {
    const { Nombre, Precio, Descripcion, idProveedor } = req.body;

    const updated = await alquilerEquipoModel.findByIdAndUpdate(
      req.params.id,
      { Nombre, Precio, Descripcion, idProveedor },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "AlquilerEquipo no encontrado" });
    return res.status(200).json({ message: "AlquilerEquipo actualizado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
alquilerEquipoController.deleteAlquiler = async (req, res) => {
  try {
    const deleted = await alquilerEquipoModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "AlquilerEquipo no encontrado" });
    return res.status(200).json({ message: "AlquilerEquipo eliminado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default alquilerEquipoController;
