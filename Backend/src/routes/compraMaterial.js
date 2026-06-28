import express from "express";
import compraMaterialController from "../Controller/compraMaterialController.js";

const router = express.Router();

router.route("/")
  .post(compraMaterialController.getCompras);

router.route("/insert")
  .post(compraMaterialController.insertCompra);

router.route("/:id")
  .delete(compraMaterialController.deleteCompra)
  .put(compraMaterialController.updateCompra);

export default router;
