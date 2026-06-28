/*
Campos:
    nombreMaterial,
    idClasificacion,
    fechaCompra,
    idProveedor,
    precioTotal,
    Cantidad,
    Descripcion
*/

import { Schema, model } from "mongoose";

const compraMaterialSchema = new Schema(
  {
    nombreMaterial: { type: String },
    idClasificacion: { type: Schema.Types.ObjectId, ref: "Clasificacion" },
    fechaCompra: { type: String },
    idProveedor: [{ type: Schema.Types.ObjectId, ref: "Proveedores" }],
    precioTotal: { type: Number },
    Cantidad: { type: Number },
    Descripcion: { type: String },
  },
  { timestamps: true, strict: false, collection: "CompraMaterial" },
);

export default model("CompraMaterial", compraMaterialSchema);
