/*
Campos:
    nombre
*/

import { Schema, model } from "mongoose";

const clasificacionSchema = new Schema(
  {
    nombre: { type: String },
  },
  { timestamps: true, strict: false, collection: "Clasificacion", }
);

export default model("Clasificacion", clasificacionSchema);
