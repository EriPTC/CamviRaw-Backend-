import express from "express";
import cotizacionesController from "../Controller/cotizacionesController.js";

const router = express.Router();

router.route("/")
  .post(cotizacionesController.getCotizaciones);

router.route("/insert")
  .post(cotizacionesController.insertCotizacion);

router.route("/:id")
  .delete(cotizacionesController.deleteCotizacion)
  .put(cotizacionesController.updateCotizacion);

export default router;
