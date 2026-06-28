import express from "express";
import marcasController from "../Controller/marcasController.js";

const router = express.Router();

router.route("/")
  .post(marcasController.getMarcas);

router.route("/insert")
  .post(marcasController.insertMarca);

router.route("/:id")
  .delete(marcasController.deleteMarca)
  .put(marcasController.updateMarca);

export default router;
