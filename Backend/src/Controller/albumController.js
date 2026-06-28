import albumModel from "../models/Album.js";
import cotizacionesModel from "../models/Cotizaciones.js";
import eventosModel from "../models/Eventos.js";
import paquetesEventosModel from "../models/paquetesEventos.js";
import servicioModel from "../models/servicio.js";

const albumController = {};

/*
Tabla de medidaRegex:
Simbolo        | Que hace
/              | Inicio de la expresion regular
^              | Debe empezar aqui, no puede haber nada antes
\d             | Acepta cualquier numero del 0 al 9
+              | Uno o mas numeros
(\.\d+)?       | Permite decimales opcionales, ejemplo 4.5
\s*            | Permite espacios opcionales
[xX*]          | Acepta x, X o * como separador de medida
\s*            | Permite espacios opcionales despues del separador
\d+(\.\d+)?    | Segundo numero de la medida, tambien puede tener decimales
$              | Debe terminar aqui, no puede haber nada despues
/              | Fin de la expresion regular
*/
const medidaRegex = /^\d+(\.\d+)?\s*[xX*]\s*\d+(\.\d+)?$/;

const formatearMedida = (medida) => {
  if (!medida) return medida;
  const texto = String(medida).trim();
  const partes = texto.split(/[xX*]/);

  if (partes.length !== 2) return texto;

  return `${partes[0].trim()} x ${partes[1].trim()}`;
};

const limpiarImagenes = (imagenes) => {
  if (!Array.isArray(imagenes)) return imagenes;

  return imagenes.map((foto) => ({
    ...foto,
    url: foto.url?.trim(),
    public_id: foto.public_id?.trim(),
    isFavorite: Boolean(foto.isFavorite),
    Tamano: formatearMedida(foto.Tamano || foto.tamano || foto["Tama\u00F1o"]),
  }));
};

const getPhotoLimitsByEvent = async (idEvento) => {
  const event = await eventosModel.findById(idEvento);
  if (!event?.idCotizacion) return null;

  const cotizacion = await cotizacionesModel.findById(event.idCotizacion);
  if (!cotizacion) return null;

  const serviceIds = [];

  if (Array.isArray(cotizacion.idServicio)) {
    serviceIds.push(...cotizacion.idServicio);
  }

  if (cotizacion.idPaqueteServicios) {
    const paquete = await paquetesEventosModel.findById(cotizacion.idPaqueteServicios);
    if (Array.isArray(paquete?.idServicios)) {
      serviceIds.push(...paquete.idServicios);
    }
  }

  const servicios = await servicioModel.find({ _id: { $in: serviceIds } });
  const limites = {};

  servicios.forEach((servicio) => {
    servicio.fotos?.forEach((foto) => {
      const medida = formatearMedida(foto.medidas);
      if (!medida) return;

      limites[medida] = (limites[medida] || 0) + Number(foto.Cantidad || 0);
    });
  });

  return limites;
};

const validarAlbum = async ({ imagen, IdCliente, idEvento }) => {
  const errores = [];

  if (!Array.isArray(imagen) || imagen.length === 0) {
    errores.push("imagen es obligatoria");
  }

  if (!IdCliente) {
    errores.push("IdCliente es obligatorio");
  }

  if (!idEvento) {
    errores.push("idEvento es obligatorio");
  }

  if (errores.length > 0) return errores;

  const fotosSeleccionadas = imagen.filter((foto) => foto.isFavorite);
  if (fotosSeleccionadas.length === 0) return errores;

  const limites = await getPhotoLimitsByEvent(idEvento);
  if (!limites) {
    errores.push("No se encontro la cotizacion del evento para validar las fotos");
    return errores;
  }

  const seleccionadasPorTamano = {};

  fotosSeleccionadas.forEach((foto, index) => {
    const medida = foto.Tamano;

    if (!medida) {
      errores.push(`imagen[${index}] debe tener Tamano`);
      return;
    }

    if (!medidaRegex.test(String(medida).trim())) {
      errores.push(`imagen[${index}] debe tener Tamano valido, ejemplo 4 x 6`);
      return;
    }

    seleccionadasPorTamano[medida] = (seleccionadasPorTamano[medida] || 0) + 1;
  });

  Object.entries(seleccionadasPorTamano).forEach(([medida, cantidad]) => {
    const limite = limites[medida] || 0;
    if (cantidad > limite) {
      errores.push(`Solo puede seleccionar ${limite} fotos de ${medida}`);
    }
  });

  return errores;
};

// SELECT
albumController.getAlbumes = async (req, res) => {
  try {
    const page = parseInt(req.body?.page) || 1;
    const limit = parseInt(req.body?.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await albumModel.countDocuments();

    const albumes = await albumModel.find()
      .populate("IdCliente", "Nombre Apellido Correo")
      .populate("idEvento", "estado idCotizacion")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ albumes, total });
  } catch (error) {
    console.log("Error en albumes " + error);
    return res.status(500).json({ message: "Error en albumes" });
  }
};

// POST
albumController.insertAlbum = async (req, res) => {
  try {
    let { imagen, public_id, IdCliente, idEvento } = req.body;
    imagen = limpiarImagenes(imagen);
    public_id = public_id?.trim();

    const errores = await validarAlbum({ imagen, IdCliente, idEvento });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    const newAlbum = new albumModel({
      imagen,
      public_id,
      IdCliente,
      idEvento,
    });

    await newAlbum.save();
    return res.status(200).json({ message: "Album creado" });
  } catch (error) {
    console.log("Error en albumes " + error);
    return res.status(500).json({ message: "Error en albumes" });
  }
};

// DELETE
albumController.deleteAlbum = async (req, res) => {
  try {
    const album = await albumModel.findByIdAndDelete(req.params.id);
    if (!album) {
      return res.status(404).json({ message: "Album no encontrado" });
    }
    return res.status(200).json({ message: "Album eliminado" });
  } catch (error) {
    console.log("Error en albumes " + error);
    return res.status(500).json({ message: "Error en albumes" });
  }
};

// PUT
albumController.updateAlbum = async (req, res) => {
  try {
    let { imagen, public_id, IdCliente, idEvento } = req.body;
    imagen = limpiarImagenes(imagen);
    public_id = public_id?.trim();

    const errores = await validarAlbum({ imagen, IdCliente, idEvento });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    await albumModel.findByIdAndUpdate(
      req.params.id,
      { imagen, public_id, IdCliente, idEvento },
      { new: true },
    );
    return res.status(200).json({ message: "Album actualizado" });
  } catch (error) {
    console.log("Error en albumes " + error);
    return res.status(500).json({ message: "Error en albumes" });
  }
};

export default albumController;
