import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import adminModel from "../../models/AdminModels.js";

const registerAdminController = {};
const soloLetras = /^[A-Za-z\u00C0-\u017F\s]+$/;

const deleteUploadedImage = async (req) => {
    if (req.file?.filename) {
        await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
    }
};

registerAdminController.register = async (req, res) => {
    let {
        Nombre,
        Apellido,
        Correo,
        Contrasena,
        loginAttempts,
        timeOut,
    } = req.body;

    try {
        Nombre = Nombre?.trim();
        Apellido = Apellido?.trim();
        Correo = Correo?.trim();

        // validar nombre y apellido
        const erroresNombre = [];

        if (!Nombre) {
            erroresNombre.push("Nombre es obligatorio");
        } else {
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

        if (!Correo) {
            erroresCorreo.push("Correo es obligatorio");
        } else if (!Correo.includes("@")) {
            erroresCorreo.push("Correo debe contener @");
        }

        if (erroresCorreo.length > 0) {
            await deleteUploadedImage(req);
            return res.status(400).json({ message: erroresCorreo.join(", ") });
        }

        // validacion de contrasena
        const erroresPassword = [];

        if (!Contrasena) {
            erroresPassword.push("Contrasena es obligatoria");
        } else {
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

        const existAdmin = await adminModel.findOne({ Correo });
        if (existAdmin) {
            await deleteUploadedImage(req);
            return res.status(400).json({ message: "El administrador ya existe" });
        }

        // encriptar contrasena
        const passwordHash = await bcryptjs.hash(Contrasena, 10);

        const newAdmin = new adminModel({
            Nombre,
            Apellido,
            Correo,
            Contrasena: passwordHash,
            FotoPerfil: req.file?.path || "",
            public_id: req.file?.filename || "",
            isVerified: true,
            loginAttempts: loginAttempts ?? 0,
            timeOut,
        });

        await newAdmin.save();

        return res.status(201).json({
            message: "Administrador registrado exitosamente",
        });
    } catch (error) {
        console.log("Error al registrar admin: " + error);
        await deleteUploadedImage(req);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default registerAdminController;
