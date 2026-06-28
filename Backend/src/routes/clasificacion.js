import express from "express";
import clasificacionController from "../Controller/clasificacionController.js";

const router = express.Router();

router.route("/")
  .post(clasificacionController.getClasificaciones);

router.route("/insert")
  .post(clasificacionController.insertClasificacion);

router.route("/:id")
  .delete(clasificacionController.deleteClasificacion)
  .put(clasificacionController.updateClasificacion);

export default router;
