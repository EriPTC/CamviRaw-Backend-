import express from "express";
import logoutClientesController from "../../Controller/Client/LogoutClientesController.js";

const router = express.Router();

router.route("/").post(logoutClientesController.logout);

export default router;
