import express from "express";
import tipoServicioController from "../Controller/tipoServicioController.js";

const router = express.Router();

router.route("/")
  .post(tipoServicioController.getTiposServicio);

router.route("/insert")
  .post(tipoServicioController.insertTipoServicio);

router.route("/:id")
  .delete(tipoServicioController.deleteTipoServicio)
  .put(tipoServicioController.updateTipoServicio);

export default router;
