import express from "express";
import marcasController from "../controllers/marcasController.js";
import upload from "../utils/cloudinaryConfig.js";

const router = express.Router();

router.route("/")
  .get(marcasController.getMarcas)
  .post(upload.single("imagen"), marcasController.insertMarca);

router.route("/:id")
  .get(marcasController.getMarcaById)
  .put(upload.single("imagen"), marcasController.updateMarca)
  .delete(marcasController.deleteMarca);

export default router;
