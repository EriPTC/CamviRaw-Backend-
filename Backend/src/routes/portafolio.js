import express from "express";
import portafolioController from "../Controller/portafolioController.js";

const router = express.Router();

router.route("/")
  .post(portafolioController.getPortafolios);

router.route("/insert")
  .post(portafolioController.insertPortafolio);

router.route("/:id")
  .delete(portafolioController.deletePortafolio)
  .put(portafolioController.updatePortafolio);

export default router;
