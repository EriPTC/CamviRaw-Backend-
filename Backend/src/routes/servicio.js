import express from "express";
import servicioController from "../controllers/servicioController.js";

const router = express.Router();

router.route("/")
  .get(servicioController.getServicios)
  .post(servicioController.insertServicio);

router.route("/:id")
  .get(servicioController.getServicioById)
  .put(servicioController.updateServicio)
  .delete(servicioController.deleteServicio);

export default router;
