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


export default app;
