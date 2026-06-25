import express from 'express';
import upload from '../../utils/CloudinaryColaboradores.js';
import registerColaboradoresController from "../../Controller/Employees/RegisterColaboradoresController.js";

const router = express.Router();

router.route("/")
    .post(upload.single('Foto'), registerColaboradoresController.register);

export default router;
