import { Schema, model } from "mongoose";

const paquetesEventosSchema = new Schema(
  {
    Nombre: { type: String },
    Precio: { type: Number },
    Descripcion: { type: String },
    Tipo: { type: String },
    Estado: { type: String },
    idServicios: [{ type: Schema.Types.ObjectId, ref: "Servicio" }],
  },
  { timestamps: true, strict: false }
);

export default model("PaquetesEventos", paquetesEventosSchema);
