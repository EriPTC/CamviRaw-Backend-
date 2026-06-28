import servicioModel from "../models/servicio.js";

const servicioController = {};

// ^$        = toda la cadena debe ser numerica
// \d+       = uno o mas digitos
// (\.\d+)?  = decimales opcionales
const soloNumeros = /^\d+(\.\d+)?$/;

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

const formatearPrecio = (precio, erroresPrecio, campo) => {
  if (precio === undefined || precio === null || String(precio).trim() === "") {
    erroresPrecio.push(`${campo} es obligatorio`);
    return precio;
  }

  const precioLimpio = String(precio).trim();
  if (!soloNumeros.test(precioLimpio) || Number(precioLimpio) < 0) {
    erroresPrecio.push(`${campo} no acepta letras, simbolos ni numeros negativos`);
    return precio;
  }

  return Number(precioLimpio);
};

const formatearMedida = (medida) => {
  if (!medida) return medida;
  const texto = String(medida).trim();
  const partes = texto.split(/[xX*]/);

  if (partes.length !== 2) return texto;

  return `${partes[0].trim()} x ${partes[1].trim()}`;
};

const limpiarFotos = (fotos) => {
  if (!Array.isArray(fotos)) return fotos;

  return fotos.map((foto) => ({
    ...foto,
    medidas: formatearMedida(foto.medidas),
  }));
};

const validarNumero = (numero, errores, campo) => {
  if (numero === undefined || numero === null || String(numero).trim() === "") {
    errores.push(`${campo} es obligatorio`);
    return;
  }

  const numeroLimpio = String(numero).trim();
  if (!soloNumeros.test(numeroLimpio) || Number(numeroLimpio) < 0) {
    errores.push(`${campo} no acepta letras, simbolos ni numeros negativos`);
  }
};

const validarServicio = ({ nombreServicio, idTipoServicio, precio, fotos }) => {
  const errores = [];

  if (!nombreServicio) {
    errores.push("nombreServicio es obligatorio");
  }

  if (!idTipoServicio) {
    errores.push("idTipoServicio es obligatorio");
  }

  formatearPrecio(precio, errores, "precio");

  if (!Array.isArray(fotos) || fotos.length === 0) {
    errores.push("fotos es obligatorio");
  }

  if (Array.isArray(fotos)) {
    fotos.forEach((foto, index) => {
      validarNumero(foto.Cantidad, errores, `fotos[${index}].Cantidad`);

      if (!foto.medidas) {
        errores.push(`fotos[${index}].medidas es obligatorio`);
      }

      if (foto.medidas && !medidaRegex.test(String(foto.medidas).trim())) {
        errores.push(`fotos[${index}].medidas debe tener formato como 4 x 6`);
      }
    });
  }

  return errores;
};

// SELECT
servicioController.getServicios = async (req, res) => {
  try {
    const page = parseInt(req.body?.page) || 1;
    const limit = parseInt(req.body?.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await servicioModel.countDocuments();

    const servicios = await servicioModel.find()
      .populate("idTipoServicio", "nombre descripcion")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ servicios, total });
  } catch (error) {
    console.log("Error en servicios " + error);
    return res.status(500).json({ message: "Error en servicios" });
  }
};

// POST
servicioController.insertServicio = async (req, res) => {
  try {
    let { nombreServicio, idTipoServicio, tipoServicio, precio, fotos } = req.body;
    nombreServicio = nombreServicio?.trim();
    idTipoServicio = idTipoServicio || tipoServicio;
    fotos = limpiarFotos(fotos);

    const errores = validarServicio({ nombreServicio, idTipoServicio, precio, fotos });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    precio = formatearPrecio(precio, [], "precio");

    const newServicio = new servicioModel({
      nombreServicio,
      idTipoServicio,
      precio,
      fotos,
    });

    await newServicio.save();
    return res.status(200).json({ message: "Servicio creado" });
  } catch (error) {
    console.log("Error en servicios " + error);
    return res.status(500).json({ message: "Error en servicios" });
  }
};

// DELETE
servicioController.deleteServicio = async (req, res) => {
  try {
    const servicio = await servicioModel.findByIdAndDelete(req.params.id);
    if (!servicio) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }
    return res.status(200).json({ message: "Servicio eliminado" });
  } catch (error) {
    console.log("Error en servicios " + error);
    return res.status(500).json({ message: "Error en servicios" });
  }
};

// PUT
servicioController.updateServicio = async (req, res) => {
  try {
    let { nombreServicio, idTipoServicio, tipoServicio, precio, fotos } = req.body;
    nombreServicio = nombreServicio?.trim();
    idTipoServicio = idTipoServicio || tipoServicio;
    fotos = limpiarFotos(fotos);

    const errores = validarServicio({ nombreServicio, idTipoServicio, precio, fotos });
    if (errores.length > 0) {
      return res.status(400).json({ message: errores.join(", ") });
    }

    precio = formatearPrecio(precio, [], "precio");

    await servicioModel.findByIdAndUpdate(
      req.params.id,
      { nombreServicio, idTipoServicio, precio, fotos },
      { new: true },
    );
    return res.status(200).json({ message: "Servicio actualizado" });
  } catch (error) {
    console.log("Error en servicios " + error);
    return res.status(500).json({ message: "Error en servicios" });
  }
};

export default servicioController;
