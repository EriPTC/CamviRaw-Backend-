/*
Campos:
    Nombre,
    Precio,
    Descripcion,
    idTipoEvento,
    Estado,
    idServicios
*/

import { Schema, model } from "mongoose";

const paquetesEventosSchema = new Schema(
  {
    Nombre: { type: String },
    Precio: { type: Number },
    Descripcion: { type: String },
    idTipoEvento: { type: Schema.Types.ObjectId, ref: "TipoEvento" },
    Estado: { type: String },
    idServicios: [{ type: Schema.Types.ObjectId, ref: "Servicio" }],
  },
  { timestamps: true, strict: false, collection: "PaquetesEventos" },
);

export default model("PaquetesEventos", paquetesEventosSchema);
