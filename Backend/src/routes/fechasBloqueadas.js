import express from "express";
import fechasBloqueadasController from "../Controller/fechasBloqueadasController.js";

const router = express.Router();

router.route("/")
  .post(fechasBloqueadasController.getFechasBloqueadas);

router.route("/insert")
  .post(fechasBloqueadasController.insertFechaBloqueada);

router.route("/:id")
  .delete(fechasBloqueadasController.deleteFechaBloqueada)
  .put(fechasBloqueadasController.updateFechaBloqueada);

export default router;
