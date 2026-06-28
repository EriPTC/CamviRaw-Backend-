/*
Campos:
    idCotizacion,
    checkList[{
        idEquipo,
        nombre,
        cantidad,
        marcado
    }],
    estado

    flujo del checkList:
    Cotizacion aceptada
    -> buscar idPaqueteServicios
    -> traer los servicios del paquete
    -> traer servicios extra de idServicio
    -> sacar el equipo de cada servicio
    -> crear el CheckList
    -> guardar el evento

    codigo a implementar para lograr lo que se busca con el checkList:
    const checklist = servicios.flatMap(servicio =>
      servicio.equipo.map(item => ({
        idEquipo: item.idEquipo,
        nombre: item.nombre,
        cantidad: item.cantidad,
        marcado: false
      }))
    );
*/

import { Schema, model } from "mongoose";

const eventosSchema = new Schema(
  {
    idCotizacion: { type: Schema.Types.ObjectId, ref: "Cotizaciones" },
    checkList: [
      {
        idEquipo: { type: Schema.Types.ObjectId, ref: "Inventario" },
        nombre: { type: String },
        cantidad: { type: Number },
        marcado: { type: Boolean },
      },
    ],
    estado: { type: String },
  },
  {
    timestamps: true,
    strict: false,
    collection: "Eventos",
  },
);

export default model("Eventos", eventosSchema);
