import express from "express";
import logoutColaboradoresController from "../../Controller/Employees/LogoutColaboradoresController.js";

const router = express.Router();

router.route("/").post(logoutColaboradoresController.logout);

export default router;
