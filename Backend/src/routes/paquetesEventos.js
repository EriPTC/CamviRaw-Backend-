import express from "express";
import paquetesEventosController from "../Controller/paquetesEventosController.js";

const router = express.Router();

router.route("/")
  .post(paquetesEventosController.getPaquetes);

router.route("/insert")
  .post(paquetesEventosController.insertPaquete);

router.route("/:id")
  .delete(paquetesEventosController.deletePaquete)
  .put(paquetesEventosController.updatePaquete);

export default router;
