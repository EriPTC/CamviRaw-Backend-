/*
Campos:
    Equipo,
    Cantidad,
    Descripcion,
    Estado,
    idClasificacion,
    idCompraMaterial,
    idAlquiler,
    tipoInventario
*/

import { Schema, model } from "mongoose";

const inventarioSchema = new Schema(
  {
    Equipo: { type: String },
    Cantidad: { type: Number },
    Descripcion: { type: String },
    Estado: { type: String },
    idClasificacion: { type: Schema.Types.ObjectId, ref: "Clasificacion" },
    idCompraMaterial: { type: Schema.Types.ObjectId, ref: "CompraMaterial" },
    idAlquiler: { type: Schema.Types.ObjectId, ref: "AlquilerEquipo" },
    tipoInventario: { type: String },
  },
  { timestamps: true, strict: false, collection: "Inventario" },
);

export default model("Inventario", inventarioSchema);
