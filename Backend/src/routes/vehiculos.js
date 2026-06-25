import express from "express";
import vehiculosController from "../controllers/vehiculosController.js";
import upload from "../utils/cloudinaryConfig.js";

const router = express.Router();

router.route("/")
  .get(vehiculosController.getVehiculos)
  .post(upload.single("imagen"), vehiculosController.insertVehiculo);

router.route("/:id")
  .get(vehiculosController.getVehiculoById)
  .put(upload.single("imagen"), vehiculosController.updateVehiculo)
  .delete(vehiculosController.deleteVehiculo);

export default router;
