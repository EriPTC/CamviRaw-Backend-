import servicioModel from "../models/servicio.js";

const servicioController = {};

// GET ALL (con populate)
servicioController.getServicios = async (req, res) => {
  try {
    const servicios = await servicioModel.find()
      .populate("equipo", "Equipo Cantidad Estado")
      .populate("idFotos", "Nombre precio");
    return res.status(200).json(servicios);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
servicioController.getServicioById = async (req, res) => {
  try {
    const servicio = await servicioModel.findById(req.params.id)
      .populate("equipo", "Equipo Cantidad Estado")
      .populate("idFotos", "Nombre precio");
    if (!servicio) return res.status(404).json({ message: "Servicio no encontrado" });
    return res.status(200).json(servicio);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT
servicioController.insertServicio = async (req, res) => {
  try {
    let { NombreServicio, TipoServicio, Precio, equipo, idFotos } = req.body;

    NombreServicio = NombreServicio?.trim();
    TipoServicio = TipoServicio?.trim();

    if (!NombreServicio || !TipoServicio || Precio === undefined) {
      return res.status(400).json({ message: "Campos requeridos: NombreServicio, TipoServicio, Precio" });
    }
    if (Number(Precio) < 0) {
      return res.status(400).json({ message: "El precio no puede ser negativo" });
    }

    const newServicio = new servicioModel({
      NombreServicio,
      TipoServicio,
      Precio,
      equipo: equipo || [],
      idFotos: idFotos || [],
    });
    await newServicio.save();
    return res.status(201).json({ message: "Servicio guardado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE
servicioController.updateServicio = async (req, res) => {
  try {
    let { NombreServicio, TipoServicio, Precio, equipo, idFotos } = req.body;
    NombreServicio = NombreServicio?.trim();

    const updated = await servicioModel.findByIdAndUpdate(
      req.params.id,
      { NombreServicio, TipoServicio, Precio, equipo, idFotos },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Servicio no encontrado" });
    return res.status(200).json({ message: "Servicio actualizado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE
servicioController.deleteServicio = async (req, res) => {
  try {
    const deleted = await servicioModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Servicio no encontrado" });
    return res.status(200).json({ message: "Servicio eliminado" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default servicioController;
