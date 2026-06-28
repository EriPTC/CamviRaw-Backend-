import express from "express";
import eventosController from "../Controller/eventosController.js";

const router = express.Router();

router.route("/")
  .post(eventosController.getEventos);

router.route("/insert")
  .post(eventosController.insertEvento);

router.route("/:id")
  .delete(eventosController.deleteEvento)
  .put(eventosController.updateEvento);

export default router;
