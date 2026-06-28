import express from "express";
import entregaPersonalizadaController from "../Controller/entregaPersonalizadaController.js";

const router = express.Router();

router.route("/")
  .post(entregaPersonalizadaController.getEntregas);

router.route("/insert")
  .post(entregaPersonalizadaController.insertEntrega);

router.route("/:id")
  .delete(entregaPersonalizadaController.deleteEntrega)
  .put(entregaPersonalizadaController.updateEntrega);

export default router;
