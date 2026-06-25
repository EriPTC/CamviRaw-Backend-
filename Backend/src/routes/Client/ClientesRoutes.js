import express from 'express';
import upload from '../../utils/CloudinaryClientes.js';
import clientesController from '../../Controller/Client/ClientesController.js';

const router = express.Router();

router.route('/')
    .get(clientesController.getClientes);

router.route('/:id')
    .delete(clientesController.deleteCliente)
    .put(upload.single('FotoPerfil'), clientesController.updateCliente);

export default router;
