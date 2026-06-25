import express from "express";
import clasificacionController from "../controllers/clasificacionController.js";

const router = express.Router();

router.route("/")
  .get(clasificacionController.getClasificaciones)
  .post(clasificacionController.insertClasificacion);

router.route("/:id")
  .get(clasificacionController.getClasificacionById)
  .put(clasificacionController.updateClasificacion)
  .delete(clasificacionController.deleteClasificacion);

export default router;
