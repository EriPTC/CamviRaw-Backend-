import { Schema, model } from "mongoose";

const gastosSchema = new Schema(
  {
    descripcion: { type: String },
    tipo: { type: String },
    valor: { type: Number },
    fechaRegistro: { type: String },
    idClasificacion: { type: Schema.Types.ObjectId, ref: "Clasificacion" },
  },
  { timestamps: true, strict: false }
);

export default model("Gastos", gastosSchema);
