import bcrypt from "bcryptjs";
import JsonWebToken from "jsonwebtoken";
import clientesModel from "../../models/ClientesModels.js";
import { config } from "../../../config.js";

const loginClientes = {};

loginClientes.login = async (req, res) => {
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

        const clienteFound = await clientesModel.findOne({ Correo: correoTrim });

        if (!clienteFound) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        if (clienteFound.timeOut && clienteFound.timeOut > Date.now()) {
            return res.status(403).json({ message: "Cuenta de cliente bloqueada" });
        }

        const isMatch = await bcrypt.compare(Contrasena, clienteFound.Contrasena);

        if (!isMatch) {
            clienteFound.loginAttempts = (clienteFound.loginAttempts ?? 0) + 1;

            if (clienteFound.loginAttempts >= 5) {
                clienteFound.timeOut = Date.now() + 15 * 60 * 1000;
                clienteFound.loginAttempts = 0;
                await clienteFound.save();
                return res.status(403).json({ message: "Cuenta de cliente bloqueada" });
            }

            await clienteFound.save();
            return res.status(401).json({ message: "Contrasena incorrecta" });
        }

        clienteFound.loginAttempts = 0;
        clienteFound.timeOut = null;
        await clienteFound.save();

        // Generar token
        const token = JsonWebToken.sign(
            { id: clienteFound._id, userType: "Cliente" },
            config.JWT.secret,
            { expiresIn: "30d" },
        );

        res.cookie("authClienteCookie", token);

        return res.status(200).json({ message: "Login de cliente exitoso" });
    } catch (error) {
        console.log("Error en login de cliente: " + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default loginClientes;
