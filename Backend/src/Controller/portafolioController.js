import portafolioModel from "../models/Portafolio.js";

const portafolioController = {};

const limpiarImagenes = (imagenes) => {
  if (!Array.isArray(imagenes)) return imagenes;

  return imagenes.map((imagen) => ({
    ...imagen,
    imagen: imagen.imagen?.trim(),
    public_id: imagen.public_id?.trim(),
  }));
};

const validarPortafolio = ({ nombre, imagenes }) => {
  const errores = [];

  if (!nombre) {
    errores.push("nombre es obligatorio");
  }

  if (!Array.isArray(imagenes) || imagenes.length < 5) {
    errores.push("imagenes es obligatorio y debe tener minimo 5 imagenes");
  }

  return errores;
};

// SELECT
portafolioController.getPortafolios = async (req, res) => {
  try {
    const portafolios = await portafolioModel.find()
      .populate("idTipoEvento", "nombre descripcion");

    return res.status(200).json({ portafolios });
  } catch (error) {
    console.log("Error en portafolios " + error);
    return res.status(500).json({ message: "Error en portafolios" });
  }
};

// POST
portafolioController.insertPortafolio = async (req, res) => {
  try {
    let { nombre, imagenes, idTipoEvento } = req.body;
    nombre = nombre?.trim();
    imagenes = limpiarImagenes(imagenes);

    const errores = validarPortafolio({ nombre, imagenes });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    const newPortafolio = new portafolioModel({
      nombre,
      imagenes,
      idTipoEvento,
    });

    await newPortafolio.save();
    return res.status(200).json({ message: "Portafolio creado" });
  } catch (error) {
    console.log("Error en portafolios " + error);
    return res.status(500).json({ message: "Error en portafolios" });
  }
};

// DELETE
portafolioController.deletePortafolio = async (req, res) => {
  try {
    const portafolio = await portafolioModel.findByIdAndDelete(req.params.id);
    if (!portafolio) {
      return res.status(404).json({ message: "Portafolio no encontrado" });
    }
    return res.status(200).json({ message: "Portafolio eliminado" });
  } catch (error) {
    console.log("Error en portafolios " + error);
    return res.status(500).json({ message: "Error en portafolios" });
  }
};

// PUT
portafolioController.updatePortafolio = async (req, res) => {
  try {
    let { nombre, imagenes, idTipoEvento } = req.body;
    nombre = nombre?.trim();
    imagenes = limpiarImagenes(imagenes);

    const errores = validarPortafolio({ nombre, imagenes });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    await portafolioModel.findByIdAndUpdate(
      req.params.id,
      { nombre, imagenes, idTipoEvento },
      { new: true },
    );
    return res.status(200).json({ message: "Portafolio actualizado" });
  } catch (error) {
    console.log("Error en portafolios " + error);
    return res.status(500).json({ message: "Error en portafolios" });
  }
};

export default portafolioController;
