import { Schema, model } from "mongoose";

const inventarioSchema = new Schema(
  {
    Equipo: { type: String },
    Cantidad: { type: Number },
    Descripcion: { type: String },
    Estado: { type: String },
    idCompraMaterial: { type: Schema.Types.ObjectId, ref: "CompraMaterial" },
  },
  { timestamps: true, strict: false }
);

export default model("Inventario", inventarioSchema);
