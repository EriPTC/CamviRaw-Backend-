import { Schema, model } from "mongoose";

const combustibleSchema = new Schema(
  {
    Nombre: { type: String },
    precio: { type: Number },
  },
  { timestamps: true, strict: false }
);

export default model("Combustible", combustibleSchema);
