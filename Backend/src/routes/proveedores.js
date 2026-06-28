import express from "express";
import proveedoresController from "../Controller/proveedoresController.js";

const router = express.Router();

router.route("/")
  .post(proveedoresController.getProveedores);

router.route("/insert")
  .post(proveedoresController.insertProveedor);

router.route("/:id")
  .delete(proveedoresController.deleteProveedor)
  .put(proveedoresController.updateProveedor);

export default router;
