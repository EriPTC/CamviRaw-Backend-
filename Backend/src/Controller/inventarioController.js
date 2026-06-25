import inventarioModel from "../models/inventario.js";

const inventarioController = {};

// GET ALL
inventarioController.getInventario = async (req, res) => {
  try {
    const items = await inventarioModel.find()
      .populate("idCompraMaterial", "nombreMaterial categoria precioTotal fechaCompra");
    return res.status(200).json(items);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
inventarioController.getInventarioById = async (req, res) => {
  try {
    const item = await inventarioModel.findById(req.params.id)
      .populate("idCompraMaterial", "nombreMaterial categoria precioTotal fechaCompra");
    if (!item) return res.status(404).json({ message: "Item de inventario no encontrado" });
    return res.status(200).json(item);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT
inventarioController.insertInventario = async (req, res) => {
  try {
    let { Equipo, Cantidad, Descripcion, Estado, idCompraMaterial } = req.body;

    Equipo = Equipo?.trim();
    Estado = Estado?.trim();

    if (!Equipo || Cantidad === undefined || !Estado) {
      return res.status(400).json({ message: "Campos requeridos: Equipo, Cantidad, Estado" });
    }
    if (Number(Cantidad) < 0) {
      return res.status(400).json({ message: "La cantidad no puede ser negativa" });
    }

    const newItem = new inventarioModel({ Equipo, Cantidad, Descripcion, Estado, idCompraMaterial });
    await newItem.save();
    return res.status(201).json({ message: "Item de inventario guardado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE
inventarioController.updateInventario = async (req, res) => {
  try {
    const { Equipo, Cantidad, Descripcion, Estado, idCompraMaterial } = req.body;

    const updated = await inventarioModel.findByIdAndUpdate(
      req.params.id,
      { Equipo, Cantidad, Descripcion, Estado, idCompraMaterial },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Item de inventario no encontrado" });
    return res.status(200).json({ message: "Inventario actualizado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
inventarioController.deleteInventario = async (req, res) => {
  try {
    const deleted = await inventarioModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Item de inventario no encontrado" });
    return res.status(200).json({ message: "Item de inventario eliminado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default inventarioController;
