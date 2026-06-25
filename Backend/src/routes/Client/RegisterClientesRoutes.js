import express from 'express';
import upload from '../../utils/CloudinaryClientes.js';
import registerClientesController from "../../Controller/Client/RegisterClientesController.js";

const router = express.Router();

router.route("/")
    .post(upload.single('FotoPerfil'), registerClientesController.register);

router.route("/verifyCodeEmail")
    .post(registerClientesController.verifyCode);

router.route("/resendCode")
    .post(registerClientesController.resendCode);

export default router;
