/*
Campos:
    Nombre,
    Apellido,
    Foto,
    public_id,
    Telefono,
    Direccion,
    DUI,
    FechaNacimiento,
    Correo,
    Numero de cuenta,
    Contrasena,
    BancoAsociado,
    isVerified,
    loginAttempts,
    timeOut
*/

import { Schema, model } from "mongoose";

const ColaboradoreSchema = new Schema(
  {
    Nombre: {type: String},
    Apellido: {type: String},
    Foto: {type: String},
    public_id: {type: String},
    Telefono: {type: String},
    Direccion: {type: String},
    DUI: {type: String},
    FechaNacimiento: {type: Date},
    Correo: {type: String},
    Contrasena: {type: String},
    NumeroCuenta: {type: String},
    BancoAsociado: {type: String},
    isVerified: {type: Boolean},
    loginAttempts: {type: Number},
    timeOut: {type: Date},
  },
  {
    timestamps: true,
    strict: false,
    collection: "Colaboradores",
  },
);

export default model("Colaboradores", ColaboradoreSchema);
