import express from 'express';
import upload from '../../utils/CloudinaryColaboradores.js';
import colaboradoresController from '../../Controller/Employees/ColaboradoresController.js';

const router = express.Router();

router.route('/')
    .get(colaboradoresController.getColaboradores);

router.route('/:id')
    .delete(colaboradoresController.deleteColaborador)
    .put(upload.single('Foto'), colaboradoresController.updateColaborador);

export default router;
