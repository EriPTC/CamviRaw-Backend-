import express from "express";
import gastosController from "../controllers/gastosController.js";

const router = express.Router();

router.route("/")
  .get(gastosController.getGastos)
  .post(gastosController.insertGasto);

router.route("/:id")
  .get(gastosController.getGastoById)
  .put(gastosController.updateGasto)
  .delete(gastosController.deleteGasto);

export default router;
