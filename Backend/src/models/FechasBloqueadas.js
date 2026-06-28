/*
Campos:
    fecha,
    motivo,
    activo
*/

import { Schema, model } from "mongoose";

const fechasBloqueadasSchema = new Schema(
  {
    fecha: { type: Date },
    motivo: { type: String },
    activo: { type: Boolean },
  },
  {
    timestamps: true,
    strict: false,
    collection: "FechasBloqueadas",
  },
);

export default model("FechasBloqueadas", fechasBloqueadasSchema);
