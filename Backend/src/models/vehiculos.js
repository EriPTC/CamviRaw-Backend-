/*
Campos:
    ConsumoGalon,
    tipo,
    nombre,
    Alquiler,
    idProveedor,
    idCombustible
*/

import { Schema, model } from "mongoose";

const vehiculosSchema = new Schema(
  {
    ConsumoGalon: { type: Number },
    tipo: { type: String },
    nombre: { type: String },
    Alquiler: { type: Number },
    idProveedor: { type: Schema.Types.ObjectId, ref: "Proveedores" },
    idCombustible: { type: Schema.Types.ObjectId, ref: "Combustible" },
  },
  { timestamps: true, strict: false, collection: "Vehiculos" }
);

export default model("Vehiculos", vehiculosSchema);
