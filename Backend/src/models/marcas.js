/*
Campos:
    Nombre,
    telefono,
    correo,
    imagen,
    idMarketing,
    descripcion
*/

import { Schema, model } from "mongoose";

const marcasSchema = new Schema(
  {
    Nombre: { type: String },
    telefono: { type: String },
    correo: { type: String },
    imagen: { type: String },
    idMarketing: { type: Schema.Types.ObjectId, ref: "Marketing" },
    descripcion: { type: String },
  },
  { timestamps: true, strict: false, collection: "Marcas" },
);

export default model("Marcas", marcasSchema);
