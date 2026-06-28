import express from "express";
import gastosController from "../Controller/gastosController.js";

const router = express.Router();

router.route("/")
  .post(gastosController.getGastos);

router.route("/insert")
  .post(gastosController.insertGasto);

router.route("/:id")
  .delete(gastosController.deleteGasto)
  .put(gastosController.updateGasto);

export default router;
