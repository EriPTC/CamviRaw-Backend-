import bcrypt from "bcryptjs";
import JsonWebToken from "jsonwebtoken";
import adminModels from "../../models/AdminModels.js";
import { config } from "../../../config.js";

const loginAdmin = {};

loginAdmin.login = async (req, res) => {
    try {
        const { Correo, Contrasena } = req.body;

        if (!Correo || !Contrasena) {
            return res.status(400).json({ message: "Correo y Contraseña son requeridos" });
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

        const userFound = await adminModels.findOne({ Correo: correoTrim });

        //verificar correo
        if (!userFound) {
            return res.status(404).json({ message: "Administrador no encontrado" });
        }

        //verificar cuenta no bloqueada
        if (userFound.timeOut && userFound.timeOut > Date.now()) {
            return res.status(403).json({ message: "Cuenta bloqueada" });
        }

        //validar contraseña
        const isMatch = await bcrypt.compare(Contrasena, userFound.Contrasena);

        if (!isMatch) {
            //si se equivoca se suma 1 al intento fallido
            userFound.loginAttempts = (userFound.loginAttempts ?? userFound.loginAttemps ?? 0) + 1;

            //bloquear cuenta a los 5 intentos fallidos
            if (userFound.loginAttempts >= 5) {
                userFound.timeOut = Date.now() + 15 * 60 * 1000;
                userFound.loginAttempts = 0;

                await userFound.save();

                return res.status(403).json({ message: "Cuenta bloqueada" });
            }

            await userFound.save();
            return res.status(401).json({ message: "Contraseña Incorrecta" });
        }

        //si accede se reinician las cuentas
        userFound.loginAttempts = 0;
        userFound.timeOut = null;
        await userFound.save();

        //generar cookie
        const token = JsonWebToken.sign(
            //#1 que se guarda
            { id: userFound._id, userType: "Admin" },

            //llave secreta
            config.JWT.secret,

            //cuando expira
            { expiresIn: "30d" },
        );

        res.cookie("authCookie", token);

        return res.status(200).json({ message: "Login exitoso" });
    } catch (error) {
        console.log("error found" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default loginAdmin;
