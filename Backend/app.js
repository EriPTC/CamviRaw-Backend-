import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import limiter from "./src/middlewares/Limiter.js";



//Importamos las rutas
import AdminRoutes from "./src/routes/Admin/AdminRoutes.js";
import LoginAdminRoutes from "./src/routes/Admin/LoginAdminRoutes.js";
import LogoutRoutes from "./src/routes/Admin/LogoutAdminRoutes.js";
import RecoveryPasswordRoutes from "./src/routes/Admin/RecoveryPasswordRoutes.js";
import RegisterAdminRoutes from "./src/routes/Admin/RegisterAdminRoutes.js";
import ClientesRoutes from "./src/routes/Client/ClientesRoutes.js";
import LoginClientesRoutes from "./src/routes/Client/LoginClientesRoutes.js";
import LogoutClientesRoutes from "./src/routes/Client/LogoutClientesRoutes.js";
import RecoveryPasswordClientesRoutes from "./src/routes/Client/RecoveryPasswordRoutes.js";
import RegisterClientesRoutes from "./src/routes/Client/RegisterClientesRoutes.js";
import ColaboradoresRoutes from "./src/routes/Employees/ColaboradoresRoutes.js";
import LoginColaboradoresRoutes from "./src/routes/Employees/LoginColaboradoresRoutes.js";
import LogoutColaboradoresRoutes from "./src/routes/Employees/LogoutColaboradoresRoutes.js";
import RecoveryPasswordColaboradoresRoutes from "./src/routes/Employees/RecoveryPasswordRoutes.js";
import RegisterColaboradoresRoutes from "./src/routes/Employees/RegisterColaboradoresRoutes.js";
import AlbumRoutes from "./src/routes/album.js";
import AlquilerEquipoRoutes from "./src/routes/alquilerEquipo.js";
import ClasificacionRoutes from "./src/routes/clasificacion.js";
import CombustibleRoutes from "./src/routes/combustible.js";
import CompraMaterialRoutes from "./src/routes/compraMaterial.js";
import CotizacionesRoutes from "./src/routes/cotizaciones.js";
import EntregaPersonalizadaRoutes from "./src/routes/entregaPersonalizada.js";
import EventosRoutes from "./src/routes/eventos.js";
import FechasBloqueadasRoutes from "./src/routes/fechasBloqueadas.js";
import GastosRoutes from "./src/routes/gastos.js";
import InventarioRoutes from "./src/routes/inventario.js";
import MarcasRoutes from "./src/routes/marcas.js";
import MarketingRoutes from "./src/routes/marketing.js";
import PaquetesEventosRoutes from "./src/routes/paquetesEventos.js";
import PortafolioRoutes from "./src/routes/portafolio.js";
import ProveedoresRoutes from "./src/routes/proveedores.js";
import ResenasRoutes from "./src/routes/resenas.js";
import ServicioRoutes from "./src/routes/servicio.js";
import TipoEventoRoutes from "./src/routes/tipoEvento.js";
import TipoServicioRoutes from "./src/routes/tipoServicio.js";
import VehiculosRoutes from "./src/routes/vehiculos.js";



//Ejecutar express
const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],

  credentials: true,
}));

app.use(cookieParser())

app.use(limiter);

app.use(express.json());

//Creamos los endPoints

//Admin
app.use("/api/admin", limiter, AdminRoutes);
app.use("/api/loginAdmin", limiter, LoginAdminRoutes);
app.use("/api/logout", limiter, LogoutRoutes);
app.use("/api/recoveryPassword", limiter, RecoveryPasswordRoutes);
app.use("/api/registerAdmin", limiter, RegisterAdminRoutes);

//Clientes
app.use("/api/clientes", limiter, ClientesRoutes);
app.use("/api/loginClientes", limiter, LoginClientesRoutes);
app.use("/api/logoutClientes", limiter, LogoutClientesRoutes);
app.use("/api/recoveryPasswordClientes", limiter, RecoveryPasswordClientesRoutes);
app.use("/api/registerClientes", limiter, RegisterClientesRoutes);

//Colaboradores
app.use("/api/colaboradores", limiter, ColaboradoresRoutes);
app.use("/api/loginColaboradores", limiter, LoginColaboradoresRoutes);
app.use("/api/logoutColaboradores", limiter, LogoutColaboradoresRoutes);
app.use("/api/recoveryPasswordColaboradores", limiter, RecoveryPasswordColaboradoresRoutes);
app.use("/api/registerColaboradores", limiter, RegisterColaboradoresRoutes);

//CRUDS
app.use("/api/album", limiter, AlbumRoutes);
app.use("/api/alquilerEquipo", limiter, AlquilerEquipoRoutes);
app.use("/api/clasificacion", limiter, ClasificacionRoutes);
app.use("/api/combustible", limiter, CombustibleRoutes);
app.use("/api/compraMaterial", limiter, CompraMaterialRoutes);
app.use("/api/cotizaciones", limiter, CotizacionesRoutes);
app.use("/api/entregaPersonalizada", limiter, EntregaPersonalizadaRoutes);
app.use("/api/eventos", limiter, EventosRoutes);
app.use("/api/fechasBloqueadas", limiter, FechasBloqueadasRoutes);
app.use("/api/gastos", limiter, GastosRoutes);
app.use("/api/inventario", limiter, InventarioRoutes);
app.use("/api/marcas", limiter, MarcasRoutes);
app.use("/api/marketing", limiter, MarketingRoutes);
app.use("/api/paquetesEventos", limiter, PaquetesEventosRoutes);
app.use("/api/portafolio", limiter, PortafolioRoutes);
app.use("/api/proveedores", limiter, ProveedoresRoutes);
app.use("/api/resenas", limiter, ResenasRoutes);
app.use("/api/servicio", limiter, ServicioRoutes);
app.use("/api/tipoEvento", limiter, TipoEventoRoutes);
app.use("/api/tipoServicio", limiter, TipoServicioRoutes);
app.use("/api/vehiculos", limiter, VehiculosRoutes);

export default app;
