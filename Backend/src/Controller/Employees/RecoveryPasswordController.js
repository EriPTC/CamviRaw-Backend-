import JsonWebToken from "jsonwebtoken";
import { config } from "../../../config.js";
import bcryptjs from "bcryptjs";
import colaboradoresModel from "../../models/ColaboradoresModels.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const recoveryPasswordController = {};

const createTransporter = () => nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email.user_email,
    pass: config.email.user_password,
  },
});

recoveryPasswordController.recoverPassword = async (req, res) => {
  try {
    const { Correo } = req.body;
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

    const colaboradorFound = await colaboradoresModel.findOne({ Correo: correoTrim });

    if (!colaboradorFound) {
      return res.status(404).json({ message: "Colaborador no encontrado" });
    }

    if (colaboradorFound.timeOut && colaboradorFound.timeOut > Date.now()) {
      return res.status(403).json({ message: "Cuenta de colaborador bloqueada temporalmente" });
    }

    const code = crypto.randomBytes(3).toString("hex");

    const token = JsonWebToken.sign(
      {
        Correo: correoTrim,
        code,
        userType: "Colaborador",
        verified: false,
      },
      config.JWT.secret,
      { expiresIn: "15m" },
    );

    // generar cookie al ingresar correo
    res.cookie("recoveryColaboradorCookie", token);

    await createTransporter().sendMail({
      from: config.email.user_email,
      to: correoTrim,
      subject: "Recuperar contrasena - Colaborador",
      text: `Para recuperar tu contrasena de colaborador, utiliza este codigo: ${code}\n\nEste codigo expira en 15 minutos.`,
    });

    return res.status(200).json({ message: "Codigo de recuperacion enviado al colaborador" });
  } catch (error) {
    console.log("Error en recuperacion de colaborador: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

recoveryPasswordController.verifyCode = async (req, res) => {
  try {
    const { codeRequest } = req.body;
    const token = req.cookies.recoveryColaboradorCookie;

    if (!token) {
      return res.status(400).json({ message: "No hay solicitud de recuperacion de colaborador" });
    }

    const decoded = JsonWebToken.verify(token, config.JWT.secret);

    if (decoded.code !== codeRequest) {
      return res.status(400).json({ message: "Codigo de colaborador invalido" });
    }

    const newToken = JsonWebToken.sign(
      {
        Correo: decoded.Correo,
        userType: "Colaborador",
        verified: true,
      },
      config.JWT.secret,
      { expiresIn: "15m" },
    );

    // borrar cookie anterior y generar cookie verificada
    res.clearCookie("recoveryColaboradorCookie");
    res.cookie("recoveryColaboradorCookie", newToken);

    return res.status(200).json({ message: "Codigo de colaborador verificado correctamente" });
  } catch (error) {
    console.log("Error verificando codigo de colaborador: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

recoveryPasswordController.resendCode = async (req, res) => {
  try {
    const { Correo } = req.body;
    const correoTrim = Correo?.trim();
    const token = req.cookies.recoveryColaboradorCookie;

    if (!token) {
      return res.status(400).json({ message: "No hay solicitud pendiente de recuperacion de colaborador" });
    }

    const decoded = JsonWebToken.verify(token, config.JWT.secret);

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
      return res.status(403).json({ message: "No autorizado para reenviar codigo de colaborador" });
    }

    const newCode = crypto.randomBytes(3).toString("hex");
    const newToken = JsonWebToken.sign(
      { ...decoded, code: newCode, verified: false },
      config.JWT.secret,
      { expiresIn: "15m" },
    );

    // reemplazar cookie con nuevo codigo
    res.cookie("recoveryColaboradorCookie", newToken);

    await createTransporter().sendMail({
      from: config.email.user_email,
      to: correoTrim,
      subject: "Nuevo codigo de recuperacion - Colaborador",
      text: `Tu nuevo codigo de recuperacion de colaborador es: ${newCode}\n\nExpira en 15 minutos.`,
    });

    return res.status(200).json({ message: "Codigo de recuperacion de colaborador reenviado" });
  } catch (error) {
    console.log("Error reenviando codigo de colaborador: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

recoveryPasswordController.newPassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword } = req.body;

    if (!newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "Nueva contrasena y confirmacion son obligatorias" });
    }

    // validacion de contrasena
    const erroresPassword = [];

    if (newPassword.length < 8) {
      erroresPassword.push("minimo 8 caracteres");
    }
    if (!/[A-Z]/.test(newPassword)) {
      erroresPassword.push("una letra mayuscula");
    }
    if (!/\d/.test(newPassword)) {
      erroresPassword.push("un numero");
    }
    if (!/[^a-zA-Z0-9]/.test(newPassword)) {
      erroresPassword.push("un caracter especial (ej: @, #, $, %, _, etc.)");
    }

    if (erroresPassword.length > 0) {
      return res.status(400).json({
        message: `La contrasena es invalida. Debe contener: ${erroresPassword.join(", ")}.`,
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Las contrasenas no coinciden" });
    }

    const token = req.cookies.recoveryColaboradorCookie;

    if (!token) {
      return res.status(400).json({ message: "No hay solicitud de recuperacion de colaborador" });
    }

    const decoded = JsonWebToken.verify(token, config.JWT.secret);

    if (!decoded.verified) {
      return res.status(400).json({ message: "Codigo de colaborador no verificado" });
    }

    const passwordHash = await bcryptjs.hash(newPassword, 10);
    await colaboradoresModel.findOneAndUpdate(
      { Correo: decoded.Correo },
      { Contrasena: passwordHash, timeOut: null, loginAttempts: 0 },
      { new: true },
    );

    res.clearCookie("recoveryColaboradorCookie");
    return res.status(200).json({ message: "Contrasena de colaborador actualizada" });
  } catch (error) {
    console.log("Error cambiando contrasena de colaborador: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default recoveryPasswordController;
