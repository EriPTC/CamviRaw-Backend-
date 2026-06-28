/*
Campos:
    imagen[{
        url,
        public_id,
        isFavorite,
        Tamano
    }],
    public_id,
    IdCliente,
    idEvento
*/

import { Schema, model } from "mongoose";

const albumSchema = new Schema(
  {
    imagen: [
      {
        url: { type: String },
        public_id: { type: String },
        isFavorite: { type: Boolean },
        Tamano: { type: String },
      },
    ],
    public_id: { type: String },
    IdCliente: { type: Schema.Types.ObjectId, ref: "Clientes" },
    idEvento: { type: Schema.Types.ObjectId, ref: "Eventos" },
  },
  {
    timestamps: true,
    strict: false,
    collection: "Albumes",
  },
);

export default model("Album", albumSchema);
