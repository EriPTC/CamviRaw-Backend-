import express from "express";
import inventarioController from "../controllers/inventarioController.js";

const router = express.Router();

router.route("/")
  .get(inventarioController.getInventario)
  .post(inventarioController.insertInventario);

router.route("/:id")
  .get(inventarioController.getInventarioById)
  .put(inventarioController.updateInventario)
  .delete(inventarioController.deleteInventario);

export default router;
