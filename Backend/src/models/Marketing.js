/*
Campos:
    nombre,
    descripcion
*/

import { Schema, model } from "mongoose";

const marketingSchema = new Schema(
  {
    nombre: { type: String },
    descripcion: { type: String },
  },
  {
    timestamps: true,
    strict: false,
    collection: "Marketing",
  },
);

export default model("Marketing", marketingSchema);
