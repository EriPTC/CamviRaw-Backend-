import express from "express";
import loginColaboradores from "../../Controller/Employees/LoginColaboradoresController.js";

const router = express.Router();

router.route("/").post(loginColaboradores.login);

export default router;
