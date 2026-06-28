import express from "express";
import inventarioController from "../Controller/inventarioController.js";

const router = express.Router();

router.route("/")
  .post(inventarioController.getInventario);

router.route("/insert")
  .post(inventarioController.insertInventario);

router.route("/:id")
  .delete(inventarioController.deleteInventario)
  .put(inventarioController.updateInventario);

export default router;
