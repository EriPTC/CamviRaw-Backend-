import express from "express";
import resenasController from "../Controller/resenasController.js";

const router = express.Router();

router.route("/")
  .post(resenasController.getResenas);

router.route("/insert")
  .post(resenasController.insertResena);

router.route("/:id")
  .delete(resenasController.deleteResena)
  .put(resenasController.updateResena);

export default router;
