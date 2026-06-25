import express from "express";
import paquetesEventosController from "../controllers/paquetesEventosController.js";

const router = express.Router();

router.route("/")
  .get(paquetesEventosController.getPaquetes)
  .post(paquetesEventosController.insertPaquete);

router.route("/:id")
  .get(paquetesEventosController.getPaqueteById)
  .put(paquetesEventosController.updatePaquete)
  .delete(paquetesEventosController.deletePaquete);

export default router;
