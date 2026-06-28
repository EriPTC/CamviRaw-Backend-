import express from "express";
import alquilerEquipoController from "../Controller/alquilerEquipoController.js";

const router = express.Router();

router.route("/")
  .post(alquilerEquipoController.getAlquileres);

router.route("/insert")
  .post(alquilerEquipoController.insertAlquiler);

router.route("/:id")
  .delete(alquilerEquipoController.deleteAlquiler)
  .put(alquilerEquipoController.updateAlquiler);

export default router;
