/*
Campos:
    Nombre,
    Apellido,
    Correo,
    Contrasena,
    FotoPerfil,
    public_id,
    loginAttempts,
    timeOut
*/

import { Schema, model } from "mongoose";

const adminSchema = new Schema(
  {
    Nombre: {type: String},
    Apellido: {type: String},
    Correo: {type: String},
    Contrasena: { type: String },
    FotoPerfil: {type: String},
    public_id: {type: String},
    loginAttempts: {type: Number},
    timeOut: {type: Date},
  },
  {
    timestamps: true,
    strict: false,
    collection: "Admin",
  },
);

export default model("Admin", adminSchema, );
