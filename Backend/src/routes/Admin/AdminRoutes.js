import express from 'express';
import upload from '../../utils/CloudinaryAdmin.js';
import AdminController from '../../Controller/Admin/AdminController.js';

const router = express.Router();

router.route('/')
    .get(AdminController.getAdmin)   
    
router.route('/:id')
    .delete(AdminController.deleteAdmin)
    .put(upload.single('FotoPerfil'), AdminController.updateAdmin);
    //single 1 imagen
    //array varias imagenes .array('images', 5) 5 cantidad de imagenes a subir
    //fields para subir campos y archivos {name: 'pdf', maxCount: 1}])


export default router;
