import express from "express";
import marketingController from "../Controller/marketingController.js";

const router = express.Router();

router.route("/")
  .post(marketingController.getMarketing);

router.route("/insert")
  .post(marketingController.insertMarketing);

router.route("/:id")
  .delete(marketingController.deleteMarketing)
  .put(marketingController.updateMarketing);

export default router;
