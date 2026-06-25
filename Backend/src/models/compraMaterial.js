import { Schema, model } from "mongoose";

const compraMaterialSchema = new Schema(
  {
    nombreMaterial: { type: String },
    categoria: { type: String },
    fechaCompra: { type: String },
    idProveedor: [{ type: Schema.Types.ObjectId, ref: "Proveedores" }],
    precioTotal: { type: Number },
  },
  { timestamps: true, strict: false }
);

export default model("CompraMaterial", compraMaterialSchema);
