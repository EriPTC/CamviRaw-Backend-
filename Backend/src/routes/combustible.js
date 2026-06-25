import express from "express";
import combustibleController from "../controllers/combustibleController.js";

const router = express.Router();

router.route("/")
  .get(combustibleController.getCombustibles)
  .post(combustibleController.insertCombustible);

router.route("/:id")
  .get(combustibleController.getCombustibleById)
  .put(combustibleController.updateCombustible)
  .delete(combustibleController.deleteCombustible);

export default router;
