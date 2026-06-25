import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import {config} from '../../config.js';

cloudinary.config({
    cloud_name: config.cloudinary.cloudinary_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret
});


//guardar las img

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Administradores',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf']
    }
});

//configurar multer
const upload = multer({ storage });



export default upload;