import express from "express";
import servicioController from "../Controller/servicioController.js";

const router = express.Router();

router.route("/")
  .post(servicioController.getServicios);

router.route("/insert")
  .post(servicioController.insertServicio);

router.route("/:id")
  .delete(servicioController.deleteServicio)
  .put(servicioController.updateServicio);

export default router;
