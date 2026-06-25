import { Schema, model } from "mongoose";

const servicioSchema = new Schema(
  {
    NombreServicio: { type: String },
    TipoServicio: { type: String },
    Precio: { type: Number },
    equipo: [{ type: Schema.Types.ObjectId, ref: "Inventario" }],
    idFotos: [{ type: Schema.Types.ObjectId, ref: "Fotos" }],
  },
  { timestamps: true, strict: false }
);

export default model("Servicio", servicioSchema);
