import express from "express";
import proveedoresController from "../controllers/proveedoresController.js";
import upload from "../utils/cloudinaryConfig.js";

const router = express.Router();

router.route("/")
  .get(proveedoresController.getProveedores)
  .post(upload.single("foto"), proveedoresController.insertProveedor);

router.route("/:id")
  .get(proveedoresController.getProveedorById)
  .put(upload.single("foto"), proveedoresController.updateProveedor)
  .delete(proveedoresController.deleteProveedor);

export default router;
