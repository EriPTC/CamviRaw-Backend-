import { Schema, model } from "mongoose";

const marcasSchema = new Schema(
  {
    Nombre: { type: String },
    telefono: { type: String },
    correo: { type: String },
    imagen: { type: String },
    tipoPaquete: { type: String }
  },
  { timestamps: true, strict: false }
);

export default model("Marcas", marcasSchema);
