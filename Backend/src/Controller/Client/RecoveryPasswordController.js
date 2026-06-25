import JsonWebToken from "jsonwebtoken";
import { config } from "../../../config.js";
import bcryptjs from "bcryptjs";
import clientesModel from "../../models/ClientesModels.js";
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

    const clienteFound = await clientesModel.findOne({ Correo: correoTrim });

    if (!clienteFound) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    if (clienteFound.timeOut && clienteFound.timeOut > Date.now()) {
      return res.status(403).json({ message: "Cuenta de cliente bloqueada temporalmente" });
    }

    const code = crypto.randomBytes(3).toString("hex");

    const token = JsonWebToken.sign(
      {
        Correo: correoTrim,
        code,
        userType: "Cliente",
        verified: false,
        resendAttempts: 0,
      },
      config.JWT.secret,
      { expiresIn: "15m" },
    );

    // generar cookie al ingresar correo
    res.cookie("recoveryClienteCookie", token);

    await createTransporter().sendMail({
      from: config.email.user_email,
      to: correoTrim,
      subject: "Recuperar contrasena - Cliente",
      text: `Para recuperar tu contrasena de cliente, utiliza este codigo: ${code}\n\nEste codigo expira en 15 minutos.`,
    });

    return res.status(200).json({ message: "Codigo de recuperacion enviado al cliente" });
  } catch (error) {
    console.log("Error en recuperacion de cliente: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

recoveryPasswordController.verifyCode = async (req, res) => {
  try {
    const { codeRequest } = req.body;
    const token = req.cookies.recoveryClienteCookie;

    if (!token) {
      return res.status(400).json({ message: "No hay solicitud de recuperacion de cliente" });
    }

    const decoded = JsonWebToken.verify(token, config.JWT.secret);

    if (decoded.code !== codeRequest) {
      return res.status(400).json({ message: "Codigo de cliente invalido" });
    }

    const newToken = JsonWebToken.sign(
      {
        Correo: decoded.Correo,
        userType: "Cliente",
        verified: true,
        resendAttempts: decoded.resendAttempts ?? 0,
      },
      config.JWT.secret,
      { expiresIn: "15m" },
    );

    // borrar cookie anterior y generar cookie verificada
    res.clearCookie("recoveryClienteCookie");
    res.cookie("recoveryClienteCookie", newToken);

    return res.status(200).json({ message: "Codigo de cliente verificado correctamente" });
  } catch (error) {
    console.log("Error verificando codigo de cliente: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

recoveryPasswordController.resendCode = async (req, res) => {
  try {
    const { Correo } = req.body;
    const correoTrim = Correo?.trim();
    const token = req.cookies.recoveryClienteCookie;

    if (!token) {
      return res.status(400).json({ message: "No hay solicitud pendiente de recuperacion de cliente" });
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
      return res.status(403).json({ message: "No autorizado para reenviar codigo de cliente" });
    }

    const resendAttempts = decoded.resendAttempts ?? 0;
    if (resendAttempts >= 3) {
      await clientesModel.findOneAndUpdate(
        { Correo: correoTrim },
        { timeOut: Date.now() + 15 * 60 * 1000 },
      );

      res.clearCookie("recoveryClienteCookie");
      return res.status(403).json({ message: "Cuenta de cliente bloqueada por 15 minutos" });
    }

    const newCode = crypto.randomBytes(3).toString("hex");
    const newToken = JsonWebToken.sign(
      {
        ...decoded,
        code: newCode,
        verified: false,
        resendAttempts: resendAttempts + 1,
      },
      config.JWT.secret,
      { expiresIn: "15m" },
    );

    // reemplazar cookie con nuevo codigo
    res.cookie("recoveryClienteCookie", newToken);

    await createTransporter().sendMail({
      from: config.email.user_email,
      to: correoTrim,
      subject: "Nuevo codigo de recuperacion - Cliente",
      text: `Tu nuevo codigo de recuperacion de cliente es: ${newCode}\n\nExpira en 15 minutos.`,
    });

    return res.status(200).json({ message: "Codigo de recuperacion de cliente reenviado" });
  } catch (error) {
    console.log("Error reenviando codigo de cliente: " + error);
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

    const token = req.cookies.recoveryClienteCookie;

    if (!token) {
      return res.status(400).json({ message: "No hay solicitud de recuperacion de cliente" });
    }

    const decoded = JsonWebToken.verify(token, config.JWT.secret);

    if (!decoded.verified) {
      return res.status(400).json({ message: "Codigo de cliente no verificado" });
    }

    const passwordHash = await bcryptjs.hash(newPassword, 10);
    await clientesModel.findOneAndUpdate(
      { Correo: decoded.Correo },
      { Contrasena: passwordHash, timeOut: null, loginAttempts: 0 },
      { new: true },
    );

    res.clearCookie("recoveryClienteCookie");
    return res.status(200).json({ message: "Contrasena de cliente actualizada" });
  } catch (error) {
    console.log("Error cambiando contrasena de cliente: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default recoveryPasswordController;
