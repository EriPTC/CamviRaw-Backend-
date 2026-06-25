import express from "express";
import compraMaterialController from "../controllers/compraMaterialController.js";

const router = express.Router();

router.route("/")
  .get(compraMaterialController.getCompras)
  .post(compraMaterialController.insertCompra);

router.route("/:id")
  .get(compraMaterialController.getCompraById)
  .put(compraMaterialController.updateCompra)
  .delete(compraMaterialController.deleteCompra);

export default router;
