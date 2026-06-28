import express from "express";
import albumController from "../Controller/albumController.js";

const router = express.Router();

router.route("/")
  .post(albumController.getAlbumes);

router.route("/insert")
  .post(albumController.insertAlbum);

router.route("/:id")
  .delete(albumController.deleteAlbum)
  .put(albumController.updateAlbum);

export default router;
