/*
Campos:
    Nombre,
    Apellido,
    Telefono,
    Correo,
    Contrasena,
    FechaNacimiento,
    FotoPerfil,
    public_id,
    isVerified,
    loginAttempts,
    timeOut
*/

import { Schema, model } from "mongoose";

const ClienteSchema = new Schema(
  {
    Nombre: {type: String},
    Apellido: {type: String},
    Correo: {type: String},
    Contrasena: {type: String},
    Telefono: {type: String},
    FechaNacimiento: {type: Date},
    FotoPerfil: {type: String},
    public_id: {type: String},
    isVerified: {type: Boolean},
    loginAttempts: {type: Number},
    timeOut: {type: Date},
  },
  {
    timestamps: true,
    strict: false,
    collection: "Clientes",
  },
);

export default model("Clientes", ClienteSchema, );
