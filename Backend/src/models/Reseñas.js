/*
Campos:
    comentario,
    idAlbum
*/

import { Schema, model } from "mongoose";

const resenasSchema = new Schema(
  {
    comentario: { type: String },
    idAlbum: { type: Schema.Types.ObjectId, ref: "Album" },
  },
  {
    timestamps: true,
    strict: false,
    collection: "Resenas",
  },
);

export default model("Resenas", resenasSchema);
