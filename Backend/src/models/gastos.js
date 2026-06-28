/*
Campos:
    descripcion,
    tipo,
    valor,
    fechaRegistro,
    idClasificacion
*/

import { Schema, model } from "mongoose";

const gastosSchema = new Schema(
  {
    descripcion: { type: String },
    tipo: { type: String },
    valor: { type: Number },
    fechaRegistro: { type: String },
    idClasificacion: { type: Schema.Types.ObjectId, ref: "Clasificacion" },
    idCompraMaterial: { type: Schema.Types.ObjectId, ref: "CompraMaterial" },

  },
  { timestamps: true, strict: false, collection: "Gastos" }
);

export default model("Gastos", gastosSchema);
