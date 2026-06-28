import express from "express";
import tipoEventoController from "../Controller/tipoEventoController.js";

const router = express.Router();

router.route("/")
  .post(tipoEventoController.getTiposEvento);

router.route("/insert")
  .post(tipoEventoController.insertTipoEvento);

router.route("/:id")
  .delete(tipoEventoController.deleteTipoEvento)
  .put(tipoEventoController.updateTipoEvento);

export default router;
