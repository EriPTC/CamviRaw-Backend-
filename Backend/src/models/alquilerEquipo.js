import { Schema, model } from "mongoose";

const alquilerEquipoSchema = new Schema(
  {
    Nombre: { type: String },
    Precio: { type: Number },
    Descripcion: { type: String },
    idProveedor: { type: Schema.Types.ObjectId, ref: "Proveedores" },
  },
  { timestamps: true, strict: false }
);

export default model("AlquilerEquipo", alquilerEquipoSchema);
