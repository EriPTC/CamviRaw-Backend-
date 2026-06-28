import clientesModel from "../../models/ClientesModels.js";
import { v2 as cloudinary } from "cloudinary";
import bcryptjs from "bcryptjs";

const clientesController = {};
// ^$     = obligan a que toda la cadena cumpla la regla, no solo una parte
// A-Za-z = letras sin tilde
// \u00C0-\u017F = letras con tilde, eñes, ü, etc.
// \s     = espacios
// +      = mínimo 1 carácter (no vacío)
const soloLetras = /^[A-Za-z\u00C0-\u017F\s]+$/;
const telefonoRegex = /^\d{3,4}-\d{4}$/;

const deleteUploadedImage = async (req) => {
  if (req.file?.filename) {
    await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
  }
};

clientesController.getClientes = async (req, res) => {
  try {
    const clientes = await clientesModel.find();
    return res.status(200).json(clientes);
  } catch (error) {
    console.log("Error al obtener clientes: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

clientesController.deleteCliente = async (req, res) => {
  try {
    const foundCliente = await clientesModel.findById(req.params.id);

    if (!foundCliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    if (foundCliente.public_id) {
      await cloudinary.uploader.destroy(foundCliente.public_id);
    }

    await clientesModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Cliente eliminado" });
  } catch (error) {
    console.log("Error al eliminar cliente: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

clientesController.updateCliente = async (req, res) => {
  try {
    let {
      Nombre,
      Apellido,
      Correo,
      Contrasena,
      Telefono,
      FechaNacimiento,
      loginAttempts,
      timeOut,
    } = req.body;

    Nombre = Nombre?.trim();
    Apellido = Apellido?.trim();
    Correo = Correo?.trim();
    Telefono = Telefono?.trim();

    // validar nombre y apellido
    const erroresNombre = [];

    if (Nombre) {
      if (Nombre.length < 3 || Nombre.length > 50) {
        erroresNombre.push("Nombre debe tener entre 3 y 50 caracteres");
      }
      if (!soloLetras.test(Nombre)) {
        erroresNombre.push("Nombre no debe tener numeros ni caracteres especiales");
      }
    }

    if (Apellido) {
      if (Apellido.length < 3 || Apellido.length > 50) {
        erroresNombre.push("Apellido debe tener entre 3 y 50 caracteres");
      }
      if (!soloLetras.test(Apellido)) {
        erroresNombre.push("Apellido no debe tener numeros ni caracteres especiales");
      }
    }

    if (erroresNombre.length > 0) {
      await deleteUploadedImage(req);
      return res.status(400).json({ message: erroresNombre.join(", ") });
    }

    // validar correo
    const erroresCorreo = [];

    if (Correo && !Correo.includes("@")) {
      erroresCorreo.push("Correo debe contener @");
    }

    if (erroresCorreo.length > 0) {
      await deleteUploadedImage(req);
      return res.status(400).json({ message: erroresCorreo.join(", ") });
    }

    // validar telefono
    const erroresTelefono = [];

    if (Telefono) {
      if (Telefono.length !== 8 && Telefono.length !== 9) {
        erroresTelefono.push("Telefono debe tener 8 o 9 caracteres");
      }
      if (!telefonoRegex.test(Telefono)) {
        erroresTelefono.push("Telefono debe tener guion y solo numeros");
      }
    }

    if (erroresTelefono.length > 0) {
      await deleteUploadedImage(req);
      return res.status(400).json({ message: erroresTelefono.join(", ") });
    }

    // validar fecha de nacimiento
    if (FechaNacimiento) {
      const erroresFecha = [];
      const fecha = new Date(FechaNacimiento);

      if (Number.isNaN(fecha.getTime()) || fecha > new Date()) {
        erroresFecha.push("Fecha de nacimiento invalida");
      } else {
        const hoy = new Date();
        let edad = hoy.getFullYear() - fecha.getFullYear();
        const cumpleEsteAnio = new Date(hoy.getFullYear(), fecha.getMonth(), fecha.getDate());

        if (hoy < cumpleEsteAnio) {
          edad -= 1;
        }
        if (edad < 18) {
          erroresFecha.push("Debe tener al menos 18 anos");
        }

        FechaNacimiento = fecha;
      }

      if (erroresFecha.length > 0) {
        await deleteUploadedImage(req);
        return res.status(400).json({ message: erroresFecha.join(", ") });
      }
    }

    // validacion de contrasena
    const erroresPassword = [];

    if (Contrasena) {
      if (Contrasena.length < 8) {
        erroresPassword.push("minimo 8 caracteres");
      }
      if (!/[A-Z]/.test(Contrasena)) {
        erroresPassword.push("una letra mayuscula");
      }
      if (!/\d/.test(Contrasena)) {
        erroresPassword.push("un numero");
      }
      if (!/[^a-zA-Z0-9]/.test(Contrasena)) {
        erroresPassword.push("un caracter especial (ej: @, #, $, %, _, etc.)");
      }
    }

    if (erroresPassword.length > 0) {
      await deleteUploadedImage(req);
      return res.status(400).json({
        message: `La contrasena es invalida. Debe contener: ${erroresPassword.join(", ")}.`,
      });
    }

    const foundCliente = await clientesModel.findById(req.params.id);

    if (!foundCliente) {
      await deleteUploadedImage(req);
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    const updatedData = {
      Nombre,
      Apellido,
      Correo,
      Telefono,
      FechaNacimiento,
      loginAttempts,
      timeOut,
    };

    if (Contrasena) {
      // encriptar contrasena
      updatedData.Contrasena = await bcryptjs.hash(Contrasena, 10);
    }

    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });

    if (req.file) {
      if (foundCliente.public_id) {
        await cloudinary.uploader.destroy(foundCliente.public_id);
      }

      updatedData.FotoPerfil = req.file.path;
      updatedData.public_id = req.file.filename;
    }

    const updatedCliente = await clientesModel.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true },
    );

    return res.status(200).json(updatedCliente);
  } catch (error) {
    console.log("Error al actualizar cliente: " + error);
    await deleteUploadedImage(req);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default clientesController;
