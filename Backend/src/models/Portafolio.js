/*
Campos:
    nombre,
    imagenes[{}],
    idTipoEvento
*/

import { Schema, model } from "mongoose";

const portafolioSchema = new Schema(
  {
    nombre: { type: String },
    imagenes: [
      {
        imagen: { type: String },
        public_id: { type: String },
      },
    ],
    idTipoEvento: { type: Schema.Types.ObjectId, ref: "TipoEvento" },
  },
  {
    timestamps: true,
    strict: false,
    collection: "Portafolio",
  },
);

export default model("Portafolio", portafolioSchema);
