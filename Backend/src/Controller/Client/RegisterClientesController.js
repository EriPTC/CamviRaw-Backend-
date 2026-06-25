import bcryptjs from "bcryptjs";
import crypto from "crypto";
import JsonWebToken from "jsonwebtoken";
import nodemailer from "nodemailer";
import { v2 as cloudinary } from "cloudinary";
import clientesModel from "../../models/ClientesModels.js";
import { config } from "../../../config.js";

const registerClientesController = {};
const soloLetras = /^[A-Za-z\u00C0-\u017F\s]+$/;
const telefonoRegex = /^\d{3,4}-\d{4}$/;




const createTransporter = () => nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.email.user_email,
        pass: config.email.user_password,
    },
});

const deleteUploadedImage = async (publicId) => {
    if (publicId) {
        await cloudinary.uploader.destroy(publicId).catch(() => {});
    }
};







registerClientesController.register = async (req, res) => {
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

    try {
        // sanitizar datos de entrada
        Nombre = Nombre?.trim();
        Apellido = Apellido?.trim();
        Correo = Correo?.trim();
        Telefono = Telefono?.trim();

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

        if (!Apellido) {
            erroresNombre.push("Apellido es obligatorio");
        } else {
            if (Apellido.length < 3 || Apellido.length > 50) {
                erroresNombre.push("Apellido debe tener entre 3 y 50 caracteres");
            }
            if (!soloLetras.test(Apellido)) {
                erroresNombre.push("Apellido no debe tener numeros ni caracteres especiales");
            }
        }

        if (erroresNombre.length > 0) {
            await deleteUploadedImage(req.file?.filename);
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
            await deleteUploadedImage(req.file?.filename);
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
            await deleteUploadedImage(req.file?.filename);
            return res.status(400).json({ message: erroresTelefono.join(", ") });
        }

        // validar fecha de nacimiento
        const erroresFecha = [];

        if (FechaNacimiento) {
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
        }

        if (erroresFecha.length > 0) {
            await deleteUploadedImage(req.file?.filename);
            return res.status(400).json({ message: erroresFecha.join(", ") });
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
            await deleteUploadedImage(req.file?.filename);
            return res.status(400).json({
                message: `La contrasena es invalida. Debe contener: ${erroresPassword.join(", ")}.`,
            });
        }

        const existCliente = await clientesModel.findOne({ Correo });
        if (existCliente) {
            await deleteUploadedImage(req.file?.filename);
            return res.status(400).json({ message: "El cliente ya existe" });
        }

        const pendingToken = req.cookies.clienteVerificationToken;
        if (pendingToken) {
            try {
                const decodedPending = JsonWebToken.verify(pendingToken, config.JWT.secret);
                if (decodedPending.Correo === Correo && decodedPending.timeOut && decodedPending.timeOut > Date.now()) {
                    await deleteUploadedImage(req.file?.filename);
                    return res.status(403).json({ message: "Registro de cliente bloqueado por 15 minutos" });
                }
            } catch (error) {
                res.clearCookie("clienteVerificationToken");
            }
        }

        // encriptar contrasena
        const passwordHash = await bcryptjs.hash(Contrasena, 10);
        const verificationCode = crypto.randomBytes(3).toString("hex");

        // generar token de verificacion de correo
        const token = JsonWebToken.sign(
            {
                Nombre,
                Apellido,
                Correo,
                Contrasena: passwordHash,
                Telefono,
                FechaNacimiento,
                FotoPerfil: req.file?.path || "",
                public_id: req.file?.filename || "",
                loginAttempts: loginAttempts ?? 0,
                timeOut,
                verificationCode,
                resendAttempts: 0,
            },
            config.JWT.secret,
            { expiresIn: "15m" },
        );

        // generar cookie de verificacion
        res.cookie("clienteVerificationToken", token);

        // enviar codigo por correo
        await createTransporter().sendMail({
            from: config.email.user_email,
            to: Correo,
            subject: "Verificacion de correo - Cliente",
            text: `Tu codigo de verificacion de cliente es: ${verificationCode}\n\nEste codigo expira en 15 minutos.`,
        });

        return res.status(200).json({ message: "Codigo de verificacion enviado al cliente" });
    } catch (error) {
        console.log("Error al iniciar registro de cliente: " + error);
        await deleteUploadedImage(req.file?.filename);
        res.clearCookie("clienteVerificationToken");
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};







registerClientesController.verifyCode = async (req, res) => {
    try {
        const { verificationCodeRequest } = req.body;
        const token = req.cookies.clienteVerificationToken;

        if (!token) {
            return res.status(400).json({ message: "No hay registro de cliente pendiente" });
        }

        const decoded = JsonWebToken.verify(token, config.JWT.secret);

        if (decoded.timeOut && decoded.timeOut > Date.now()) {
            return res.status(403).json({ message: "Registro de cliente bloqueado por 15 minutos" });
        }

        if (verificationCodeRequest !== decoded.verificationCode) {
            return res.status(400).json({ message: "Codigo de verificacion invalido" });
        }

        const existCliente = await clientesModel.findOne({ Correo: decoded.Correo });
        if (existCliente) {
            await deleteUploadedImage(decoded.public_id);
            res.clearCookie("clienteVerificationToken");
            return res.status(400).json({ message: "El cliente ya existe" });
        }

        const newCliente = new clientesModel({
            Nombre: decoded.Nombre,
            Apellido: decoded.Apellido,
            Correo: decoded.Correo,
            Contrasena: decoded.Contrasena,
            Telefono: decoded.Telefono,
            FechaNacimiento: decoded.FechaNacimiento,
            FotoPerfil: decoded.FotoPerfil,
            public_id: decoded.public_id,
            loginAttempts: decoded.loginAttempts ?? 0,
            timeOut: decoded.timeOut,
        });

        await newCliente.save();

        res.clearCookie("clienteVerificationToken");
        return res.status(201).json({ message: "Cliente registrado y correo verificado" });
    } catch (error) {
        console.log("Error al verificar cliente: " + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};






registerClientesController.resendCode = async (req, res) => {
    try {
        const { Correo } = req.body;
        const token = req.cookies.clienteVerificationToken;

        if (!token) {
            return res.status(400).json({ message: "No hay registro de cliente pendiente" });
        }

        const decoded = JsonWebToken.verify(token, config.JWT.secret);
        const correoTrim = Correo?.trim();

        // validar correo
        const erroresCorreo = [];

        if (!correoTrim) {
            erroresCorreo.push("Correo es obligatorio");
        } else if (!correoTrim.includes("@")) {
            erroresCorreo.push("Correo debe contener @");
        }

        if (erroresCorreo.length > 0) {
            return res.status(400).json({ message: erroresCorreo.join(", ") });
        }

        if (decoded.Correo !== correoTrim) {
            return res.status(403).json({ message: "No autorizado para reenviar codigo" });
        }

        if (decoded.timeOut && decoded.timeOut > Date.now()) {
            return res.status(403).json({ message: "Registro de cliente bloqueado por 15 minutos" });
        }

        const resendAttempts = decoded.resendAttempts ?? 0;
        if (resendAttempts >= 3) {
            // bloquear registro pendiente por exceder reenvios
            const blockedToken = JsonWebToken.sign(
                { ...decoded, timeOut: Date.now() + 15 * 60 * 1000 },
                config.JWT.secret,
                { expiresIn: "15m" },
            );

            res.cookie("clienteVerificationToken", blockedToken);
            return res.status(403).json({ message: "Registro de cliente bloqueado por 15 minutos" });
        }

        const newCode = crypto.randomBytes(3).toString("hex");

        // generar token con nuevo codigo
        const newToken = JsonWebToken.sign(
            {
                ...decoded,
                verificationCode: newCode,
                resendAttempts: resendAttempts + 1,
            },
            config.JWT.secret,
            { expiresIn: "15m" },
        );

        // reemplazar cookie con nuevo codigo
        res.cookie("clienteVerificationToken", newToken);

        await createTransporter().sendMail({
            from: config.email.user_email,
            to: decoded.Correo,
            subject: "Nuevo codigo de verificacion - Cliente",
            text: `Tu nuevo codigo de verificacion de cliente es: ${newCode}\n\nEste codigo expira en 15 minutos.`,
        });

        return res.status(200).json({ message: "Codigo de verificacion reenviado" });
    } catch (error) {
        console.log("Error reenviando codigo de cliente: " + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default registerClientesController;
