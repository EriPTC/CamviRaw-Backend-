/*
Campos:
    NombreCotizacion,
    idServicio,
    idPaqueteServicios,
    idCliente,
    idVehiculo,
    idAlquiler,
    idAdmin,
    idColaboradores,
    precio,
    horaEvento,
    ubicacion[{
        latitud,
        longitud
    }],
    fechaEvento,
    PDF,
    estado
*/

import { Schema, model } from "mongoose";

const cotizacionesSchema = new Schema(
  {
    NombreCotizacion: { type: String },
    idServicio: [{ type: Schema.Types.ObjectId, ref: "Servicio" }],
    idPaqueteServicios: { type: Schema.Types.ObjectId, ref: "PaquetesEventos" },
    idCliente: { type: Schema.Types.ObjectId, ref: "Clientes" },
    idVehiculo: { type: Schema.Types.ObjectId, ref: "Vehiculos" },
    idAlquiler: { type: Schema.Types.ObjectId, ref: "AlquilerEquipo" },
    idAdmin: { type: Schema.Types.ObjectId, ref: "Admin" },
    idColaboradores: [{ type: Schema.Types.ObjectId, ref: "Colaboradores" }],
    precio: { type: Number },
    horaEvento: { type: String },
    ubicacion: [
      {
        latitud: { type: Number },
        longitud: { type: Number },
      },
    ],
    fechaEvento: { type: Date },
    PDF: { type: String },
    estado: { type: String },
  },
  {
    timestamps: true,
    strict: false,
    collection: "Cotizaciones",
  },
);

export default model("Cotizaciones", cotizacionesSchema);
