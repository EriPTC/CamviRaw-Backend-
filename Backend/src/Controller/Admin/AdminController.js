import adminModels from "../../models/AdminModels.js";
import { v2 as cloudinary } from "cloudinary";
import bcryptjs from "bcryptjs";

const adminController = {};
const soloLetras = /^[A-Za-z\u00C0-\u017F\s]+$/;

adminController.getAdmin = async (req, res) => {
  try {
    const admin = await adminModels.find();
    return res.status(200).json(admin);
  } catch (error) {
    console.log("Error al obtener admins: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};





adminController.deleteAdmin = async (req, res) => {
  try {
    const foundAdmin = await adminModels.findById(req.params.id);

    if (!foundAdmin) {
      return res.status(404).json({ message: "Admin no encontrado" });
    }

    if (foundAdmin.public_id) {
      await cloudinary.uploader.destroy(foundAdmin.public_id);
    }

    await adminModels.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Admin eliminado" });
  } catch (error) {
    console.log("Error al eliminar admin: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

adminController.updateAdmin = async (req, res) => {
  try {
    let {
      Nombre,
      Apellido,
      Correo,
      Contrasena,
      isVerified,
      loginAttempts,
      timeOut,
    } = req.body;

    const foundAdmin = await adminModels.findById(req.params.id);

    if (!foundAdmin) {
      return res.status(404).json({ message: "Admin no encontrado" });
    }

    // sanitizar datos de entrada
    Nombre = Nombre?.trim();
    Apellido = Apellido?.trim();
    Correo = Correo?.trim();
    Contrasena = Contrasena?.trim();

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
      if (req.file?.filename) {
        await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
      }
      return res.status(400).json({ message: erroresNombre.join(", ") });
    }

    // validar correo
    const erroresCorreo = [];

    if (Correo && !Correo.includes("@")) {
      erroresCorreo.push("Correo debe contener @");
    }

    if (erroresCorreo.length > 0) {
      if (req.file?.filename) {
        await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
      }
      return res.status(400).json({ message: erroresCorreo.join(", ") });
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
      if (req.file?.filename) {
        await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
      }
      return res.status(400).json({
        message: `La contrasena es invalida. Debe contener: ${erroresPassword.join(", ")}.`,
      });
    }

    const updatedData = {
      Nombre,
      Apellido,
      Correo,
      isVerified,
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
      if (foundAdmin.public_id) {
        await cloudinary.uploader.destroy(foundAdmin.public_id);
      }

      updatedData.FotoPerfil = req.file.path;
      updatedData.public_id = req.file.filename;
    }

    const updatedAdmin = await adminModels.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true },
    );

    return res.status(200).json(updatedAdmin);
  } catch (error) {
    console.log("Error al actualizar admin: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default adminController;
