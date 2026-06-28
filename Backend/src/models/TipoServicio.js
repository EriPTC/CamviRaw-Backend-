/*
Campos:
    nombre,
    descripcion
*/

import { Schema, model } from "mongoose";

const tipoServicioSchema = new Schema(
  {
    nombre: { type: String },
    descripcion: { type: String },
  },
  {
    timestamps: true,
    strict: false,
    collection: "TipoServicio",
  },
);

export default model("TipoServicio", tipoServicioSchema);
