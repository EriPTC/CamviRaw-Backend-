/*
Campos:
    nombreServicio,
    idTipoServicio,
    precio,
    fotos[{Cantidad, medidas}]
*/

import { Schema, model } from "mongoose";

const servicioSchema = new Schema(
  {
    nombreServicio: { type: String },
    idTipoServicio: { type: Schema.Types.ObjectId, ref: "TipoServicio" },
    precio: { type: Number },
    fotos: [
      {
        Cantidad: { type: Number },
        medidas: { type: String },
      },
    ],
  },
  {
    timestamps: true,
    strict: false,
    collection: "Servicio",
  },
);

export default model("Servicio", servicioSchema);
