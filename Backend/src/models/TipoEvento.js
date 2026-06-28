/*
Campos:
    nombre,
    descripcion
*/

import { Schema, model } from "mongoose";

const tipoEventoSchema = new Schema(
  {
    nombre: { type: String },
    descripcion: { type: String },
  },
  {
    timestamps: true,
    strict: false,
    collection: "TipoEvento",
  },
);

export default model("TipoEvento", tipoEventoSchema);
