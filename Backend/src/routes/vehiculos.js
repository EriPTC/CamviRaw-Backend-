import express from "express";
import vehiculosController from "../Controller/vehiculosController.js";

const router = express.Router();

router.route("/")
  .post(vehiculosController.getVehiculos);

router.route("/insert")
  .post(vehiculosController.insertVehiculo);

router.route("/:id")
  .delete(vehiculosController.deleteVehiculo)
  .put(vehiculosController.updateVehiculo);

export default router;
