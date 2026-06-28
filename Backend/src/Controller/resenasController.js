import resenasModel from "../models/Reseñas.js";

const resenasController = {};

// SELECT
resenasController.getResenas = async (req, res) => {
  try {
    const resenas = await resenasModel.find()
      .populate("idAlbum", "imagen public_id");

    return res.status(200).json({ resenas });
  } catch (error) {
    console.log("Error en resenas " + error);
    return res.status(500).json({ message: "Error en resenas" });
  }
};

// POST
resenasController.insertResena = async (req, res) => {
  try {
    let { comentario, idAlbum } = req.body;
    comentario = comentario?.trim();

    if (!comentario) {
      return res.status(400).json({ message: "comentario es obligatorio" });
    }

    const newResena = new resenasModel({
      comentario,
      idAlbum,
    });

    await newResena.save();
    return res.status(200).json({ message: "Resena creada" });
  } catch (error) {
    console.log("Error en resenas " + error);
    return res.status(500).json({ message: "Error en resenas" });
  }
};

// DELETE
resenasController.deleteResena = async (req, res) => {
  try {
    const resena = await resenasModel.findByIdAndDelete(req.params.id);
    if (!resena) {
      return res.status(404).json({ message: "Resena no encontrada" });
    }
    return res.status(200).json({ message: "Resena eliminada" });
  } catch (error) {
    console.log("Error en resenas " + error);
    return res.status(500).json({ message: "Error en resenas" });
  }
};

// PUT
resenasController.updateResena = async (req, res) => {
  try {
    let { comentario, idAlbum } = req.body;
    comentario = comentario?.trim();

    if (!comentario) {
      return res.status(400).json({ message: "comentario es obligatorio" });
    }

    await resenasModel.findByIdAndUpdate(
      req.params.id,
      { comentario, idAlbum },
      { new: true },
    );
    return res.status(200).json({ message: "Resena actualizada" });
  } catch (error) {
    console.log("Error en resenas " + error);
    return res.status(500).json({ message: "Error en resenas" });
  }
};

export default resenasController;
