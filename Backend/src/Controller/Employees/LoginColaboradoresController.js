import bcrypt from "bcryptjs";
import JsonWebToken from "jsonwebtoken";
import colaboradoresModel from "../../models/ColaboradoresModels.js";
import { config } from "../../../config.js";

const loginColaboradores = {};

loginColaboradores.login = async (req, res) => {
    try {
        const { Correo, Contrasena } = req.body;

        if (!Correo || !Contrasena) {
            return res.status(400).json({ message: "Correo y Contrasena son obligatorios" });
        }

        // validar correo
        const correoTrim = Correo.trim();
        const erroresCorreo = [];

        if (!correoTrim.includes("@")) {
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
            return res.status(403).json({ message: "Cuenta de colaborador bloqueada" });
        }

        const isMatch = await bcrypt.compare(Contrasena, colaboradorFound.Contrasena);

        if (!isMatch) {
            colaboradorFound.loginAttempts = (colaboradorFound.loginAttempts ?? 0) + 1;

            if (colaboradorFound.loginAttempts >= 5) {
                colaboradorFound.timeOut = Date.now() + 15 * 60 * 1000;
                colaboradorFound.loginAttempts = 0;
                await colaboradorFound.save();
                return res.status(403).json({ message: "Cuenta de colaborador bloqueada" });
            }

            await colaboradorFound.save();
            return res.status(401).json({ message: "Contrasena incorrecta" });
        }

        colaboradorFound.loginAttempts = 0;
        colaboradorFound.timeOut = null;
        await colaboradorFound.save();

        // Generar token
        const token = JsonWebToken.sign(
            { id: colaboradorFound._id, userType: "Colaborador" },
            config.JWT.secret,
            { expiresIn: "30d" },
        );

        res.cookie("authColaboradorCookie", token);

        return res.status(200).json({ message: "Login de colaborador exitoso" });
    } catch (error) {
        console.log("Error en login de colaborador: " + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default loginColaboradores;
