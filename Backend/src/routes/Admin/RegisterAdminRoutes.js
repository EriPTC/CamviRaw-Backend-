import express from 'express';
import upload from '../../utils/CloudinaryAdmin.js';
import registerAdminController from "../../Controller/Admin/RegisterAdminController.js";

const router = express.Router();

router.route("/")
    .post(upload.single('FotoPerfil'), registerAdminController.register);

export default router;
