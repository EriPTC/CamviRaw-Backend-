import proveedoresModel from "../models/proveedores.js";
import upload from "../utils/cloudinaryConfig.js";

const proveedoresController = {};

// GET ALL
proveedoresController.getProveedores = async (req, res) => {
  try {
    const proveedores = await proveedoresModel.find();
    return res.status(200).json(proveedores);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
proveedoresController.getProveedorById = async (req, res) => {
  try {
    const proveedor = await proveedoresModel.findById(req.params.id);
    if (!proveedor) return res.status(404).json({ message: "Proveedor no encontrado" });
    return res.status(200).json(proveedor);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT
proveedoresController.insertProveedor = async (req, res) => {
  try {
    let { Nombre, telefono, correo, descripcion, direccion } = req.body;

    Nombre = Nombre?.trim();
    correo = correo?.trim();
    telefono = telefono?.trim();

    if (!Nombre || !telefono || !correo) {
      return res.status(400).json({ message: "Campos requeridos: Nombre, telefono, correo" });
    }
    if (Nombre.length < 2) {
      return res.status(400).json({ message: "Nombre muy corto" });
    }

    const foto = req.file ? req.file.path : null;

    const newProveedor = new proveedoresModel({ Nombre, telefono, correo, descripcion, direccion, foto });
    await newProveedor.save();
    return res.status(201).json({ message: "Proveedor guardado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE
proveedoresController.updateProveedor = async (req, res) => {
  try {
    let { Nombre, telefono, correo, descripcion, direccion } = req.body;

    Nombre = Nombre?.trim();
    correo = correo?.trim();

    const foto = req.file ? req.file.path : undefined;
    const updateData = { Nombre, telefono, correo, descripcion, direccion };
    if (foto) updateData.foto = foto;

    const updated = await proveedoresModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Proveedor no encontrado" });
    return res.status(200).json({ message: "Proveedor actualizado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
proveedoresController.deleteProveedor = async (req, res) => {
  try {
    const deleted = await proveedoresModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Proveedor no encontrado" });
    return res.status(200).json({ message: "Proveedor eliminado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default proveedoresController;
