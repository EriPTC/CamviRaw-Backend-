import express from "express";
import loginClientes from "../../Controller/Client/LoginClientesController.js";

const router = express.Router();

router.route("/").post(loginClientes.login);

export default router;
