import { Schema, model } from "mongoose";

const clasificacionSchema = new Schema(
  {
    nombre: { type: String },
  },
  { timestamps: true, strict: false }
);

export default model("Clasificacion", clasificacionSchema);
