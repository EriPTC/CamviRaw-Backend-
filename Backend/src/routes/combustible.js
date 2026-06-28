import express from "express";
import combustibleController from "../Controller/combustibleController.js";

const router = express.Router();

router.route("/")
  .post(combustibleController.getCombustibles);

router.route("/insert")
  .post(combustibleController.insertCombustible);

router.route("/:id")
  .delete(combustibleController.deleteCombustible)
  .put(combustibleController.updateCombustible);

export default router;
