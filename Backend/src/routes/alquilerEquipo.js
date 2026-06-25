import express from "express";
import alquilerEquipoController from "../controllers/alquilerEquipoController.js";

const router = express.Router();

router.route("/")
  .get(alquilerEquipoController.getAlquileres)
  .post(alquilerEquipoController.insertAlquiler);

router.route("/:id")
  .get(alquilerEquipoController.getAlquilerById)
  .put(alquilerEquipoController.updateAlquiler)
  .delete(alquilerEquipoController.deleteAlquiler);

export default router;
