import { Schema, model } from "mongoose";

const proveedoresSchema = new Schema(
  {
    Nombre: { type: String },
    telefono: { type: String },
    correo: { type: String },
    descripcion: { type: String },
    direccion: { type: String },
    foto: { type: String },
  },
  { timestamps: true, strict: false }
);

export default model("Proveedores", proveedoresSchema);
