import fechasBloqueadasModel from "../models/FechasBloqueadas.js";

const fechasBloqueadasController = {};

const obtenerFecha = (valor) => {
  if (!valor) return null;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
};

const sumarDias = (fecha, dias) => {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setDate(nuevaFecha.getDate() + dias);
  return nuevaFecha;
};

// SELECT
fechasBloqueadasController.getFechasBloqueadas = async (req, res) => {
  try {
    const fechasBloqueadas = await fechasBloqueadasModel.find();

    return res.status(200).json({ fechasBloqueadas });
  } catch (error) {
    console.log("Error en fechas bloqueadas " + error);
    return res.status(500).json({ message: "Error en fechas bloqueadas" });
  }
};

// POST
fechasBloqueadasController.insertFechaBloqueada = async (req, res) => {
  try {
    let { fecha, motivo, activo } = req.body;
    fecha = fecha?.trim();
    motivo = motivo?.trim();

    const fechaParseada = obtenerFecha(fecha);
    if (!fechaParseada) {
      return res.status(400).json({ message: "fecha es obligatoria y debe ser valida" });
    }

    const inicio = new Date(fechaParseada);
    const fin = sumarDias(inicio, 1);
    const existe = await fechasBloqueadasModel.findOne({
      fecha: { $gte: inicio, $lt: fin },
      activo: true,
    });

    if (existe) {
      return res.status(400).json({ message: "Esta fecha ya esta bloqueada" });
    }

    const newFechaBloqueada = new fechasBloqueadasModel({
      fecha: fechaParseada,
      motivo,
      activo: activo ?? true,
    });

    await newFechaBloqueada.save();
    return res.status(200).json({ message: "Fecha bloqueada creada" });
  } catch (error) {
    console.log("Error en fechas bloqueadas " + error);
    return res.status(500).json({ message: "Error en fechas bloqueadas" });
  }
};

// DELETE
fechasBloqueadasController.deleteFechaBloqueada = async (req, res) => {
  try {
    const fechaBloqueada = await fechasBloqueadasModel.findByIdAndDelete(req.params.id);
    if (!fechaBloqueada) {
      return res.status(404).json({ message: "Fecha bloqueada no encontrada" });
    }
    return res.status(200).json({ message: "Fecha bloqueada eliminada" });
  } catch (error) {
    console.log("Error en fechas bloqueadas " + error);
    return res.status(500).json({ message: "Error en fechas bloqueadas" });
  }
};

// PUT
fechasBloqueadasController.updateFechaBloqueada = async (req, res) => {
  try {
    let { fecha, motivo, activo } = req.body;
    fecha = fecha?.trim();
    motivo = motivo?.trim();

    const fechaParseada = obtenerFecha(fecha);
    if (!fechaParseada) {
      return res.status(400).json({ message: "fecha es obligatoria y debe ser valida" });
    }

    await fechasBloqueadasModel.findByIdAndUpdate(
      req.params.id,
      { fecha: fechaParseada, motivo, activo: activo ?? true },
      { new: true },
    );
    return res.status(200).json({ message: "Fecha bloqueada actualizada" });
  } catch (error) {
    console.log("Error en fechas bloqueadas " + error);
    return res.status(500).json({ message: "Error en fechas bloqueadas" });
  }
};

export default fechasBloqueadasController;
