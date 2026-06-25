import compraMaterialModel from "../models/compraMaterial.js";

const compraMaterialController = {};

// GET ALL
compraMaterialController.getCompras = async (req, res) => {
  try {
    const compras = await compraMaterialModel.find()
      .populate("idProveedor", "Nombre telefono correo");
    return res.status(200).json(compras);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
compraMaterialController.getCompraById = async (req, res) => {
  try {
    const compra = await compraMaterialModel.findById(req.params.id)
      .populate("idProveedor", "Nombre telefono correo");
    if (!compra) return res.status(404).json({ message: "CompraMaterial no encontrada" });
    return res.status(200).json(compra);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT
compraMaterialController.insertCompra = async (req, res) => {
  try {
    let { nombreMaterial, categoria, fechaCompra, idProveedor, precioTotal } = req.body;

    nombreMaterial = nombreMaterial?.trim();
    categoria = categoria?.trim();

    if (!nombreMaterial || !categoria || precioTotal === undefined) {
      return res.status(400).json({ message: "Campos requeridos: nombreMaterial, categoria, precioTotal" });
    }
    if (Number(precioTotal) < 0) {
      return res.status(400).json({ message: "El precio no puede ser negativo" });
    }

    const newCompra = new compraMaterialModel({
      nombreMaterial, categoria, fechaCompra,
      idProveedor: idProveedor || [],
      precioTotal,
    });
    await newCompra.save();
    return res.status(201).json({ message: "CompraMaterial guardada" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE
compraMaterialController.updateCompra = async (req, res) => {
  try {
    const { nombreMaterial, categoria, fechaCompra, idProveedor, precioTotal } = req.body;

    const updated = await compraMaterialModel.findByIdAndUpdate(
      req.params.id,
      { nombreMaterial, categoria, fechaCompra, idProveedor, precioTotal },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "CompraMaterial no encontrada" });
    return res.status(200).json({ message: "CompraMaterial actualizada" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
compraMaterialController.deleteCompra = async (req, res) => {
  try {
    const deleted = await compraMaterialModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "CompraMaterial no encontrada" });
    return res.status(200).json({ message: "CompraMaterial eliminada" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default compraMaterialController;
