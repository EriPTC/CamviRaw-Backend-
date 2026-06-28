/*
Campos:
    idAlbum,
    idCliente,
    fechaEntrega,
    HoraEntrega,
    precio,
    Direccion[{
        latitud,
        longitud
    }],
    estado
*/

import { Schema, model } from "mongoose";

const entregaPersonalizadaSchema = new Schema(
  {
    idAlbum: { type: Schema.Types.ObjectId, ref: "Album" },
    idCliente: { type: Schema.Types.ObjectId, ref: "Clientes" },
    fechaEntrega: { type: Date },
    HoraEntrega: { type: String },
    precio: { type: Number },
    Direccion: [
      {
        latitud: { type: Number },
        longitud: { type: Number },
      },
    ],
    estado: { type: String },
  },
  {
    timestamps: true,
    strict: false,
    collection: "EntregaPersonalizada",
  },
);

export default model("EntregaPersonalizada", entregaPersonalizadaSchema);
