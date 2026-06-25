import colaboradoresModel from "../../models/ColaboradoresModels.js";
import { v2 as cloudinary } from "cloudinary";
import bcryptjs from "bcryptjs";

const colaboradoresController = {};
const soloLetras = /^[A-Za-z\u00C0-\u017F\s]+$/;
const telefonoRegex = /^\d{3,4}-\d{4}$/;
const duiRegex = /^\d{8}-?\d$/;
const cuentaRegex = /^\d+$/;

const deleteUploadedImage = async (req) => {
  if (req.file?.filename) {
    await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
  }
};

colaboradoresController.getColaboradores = async (req, res) => {
  try {
    const colaboradores = await colaboradoresModel.find();
    return res.status(200).json(colaboradores);
  } catch (error) {
    console.log("Error al obtener colaboradores: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

colaboradoresController.deleteColaborador = async (req, res) => {
  try {
    const foundColaborador = await colaboradoresModel.findById(req.params.id);

    if (!foundColaborador) {
      return res.status(404).json({ message: "Colaborador no encontrado" });
    }

    if (foundColaborador.public_id) {
      await cloudinary.uploader.destroy(foundColaborador.public_id);
    }

    await colaboradoresModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Colaborador eliminado" });
  } catch (error) {
    console.log("Error al eliminar colaborador: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

colaboradoresController.updateColaborador = async (req, res) => {
  try {
    let {
      Nombre,
      Apellido,
      Telefono,
      Direccion,
      DUI,
      FechaNacimiento,
      Correo,
      NumeroCuenta,
      Contrasena,
      BancoAsociado,
      loginAttempts,
      timeOut,
    } = req.body;

    Nombre = Nombre?.trim();
    Apellido = Apellido?.trim();
    Telefono = Telefono?.trim();
    Direccion = Direccion?.trim();
    DUI = DUI?.trim();
    Correo = Correo?.trim();
    NumeroCuenta = NumeroCuenta?.trim();
    BancoAsociado = BancoAsociado?.trim();

    // validar nombre y apellido
    const erroresNombre = [];

    if (Nombre) {
      if (Nombre.length < 3 || Nombre.length > 50) {
        erroresNombre.push("Nombre debe tener entre 3 y 50 caracteres");
      }
      if (!soloLetras.test(Nombre)) {
        erroresNombre.push("Nombre no debe tener numeros ni caracteres especiales");
      }
    }

    if (Apellido) {
      if (Apellido.length < 3 || Apellido.length > 50) {
        erroresNombre.push("Apellido debe tener entre 3 y 50 caracteres");
      }
      if (!soloLetras.test(Apellido)) {
        erroresNombre.push("Apellido no debe tener numeros ni caracteres especiales");
      }
    }

    if (erroresNombre.length > 0) {
      await deleteUploadedImage(req);
      return res.status(400).json({ message: erroresNombre.join(", ") });
    }

    // validar correo
    const erroresCorreo = [];

    if (Correo && !Correo.includes("@")) {
      erroresCorreo.push("Correo debe contener @");
    }

    if (erroresCorreo.length > 0) {
      await deleteUploadedImage(req);
      return res.status(400).json({ message: erroresCorreo.join(", ") });
    }

    // validar telefono
    const erroresTelefono = [];

    if (Telefono) {
      if (Telefono.length !== 8 && Telefono.length !== 9) {
        erroresTelefono.push("Telefono debe tener 8 o 9 caracteres");
      }
      if (!telefonoRegex.test(Telefono)) {
        erroresTelefono.push("Telefono debe tener guion y solo numeros");
      }
    }

    if (erroresTelefono.length > 0) {
      await deleteUploadedImage(req);
      return res.status(400).json({ message: erroresTelefono.join(", ") });
    }

    // validar DUI
    const erroresDui = [];

    if (DUI) {
      if (DUI.length !== 9 && DUI.length !== 10) {
        erroresDui.push("DUI debe tener 9 o 10 caracteres");
      }
      if (!duiRegex.test(DUI)) {
        erroresDui.push("DUI debe tener guion opcional y solo numeros");
      }
    }

    if (erroresDui.length > 0) {
      await deleteUploadedImage(req);
      return res.status(400).json({ message: erroresDui.join(", ") });
    }

    // validar banco
    const erroresBanco = [];

    if (BancoAsociado && !soloLetras.test(BancoAsociado)) {
      erroresBanco.push("Banco no debe tener numeros ni caracteres especiales");
    }

    if (erroresBanco.length > 0) {
      await deleteUploadedImage(req);
      return res.status(400).json({ message: erroresBanco.join(", ") });
    }

    // validar numero de cuenta
    const erroresCuenta = [];

    if (NumeroCuenta && !cuentaRegex.test(NumeroCuenta)) {
      erroresCuenta.push("Numero de cuenta no debe tener letras ni caracteres especiales");
    }

    if (erroresCuenta.length > 0) {
      await deleteUploadedImage(req);
      return res.status(400).json({ message: erroresCuenta.join(", ") });
    }

    // validar fecha de nacimiento
    if (FechaNacimiento) {
      const erroresFecha = [];
      const fecha = new Date(FechaNacimiento);

      if (Number.isNaN(fecha.getTime()) || fecha > new Date()) {
        erroresFecha.push("Fecha de nacimiento invalida");
      } else {
        const hoy = new Date();
        let edad = hoy.getFullYear() - fecha.getFullYear();
        const cumpleEsteAnio = new Date(hoy.getFullYear(), fecha.getMonth(), fecha.getDate());

        if (hoy < cumpleEsteAnio) {
          edad -= 1;
        }
        if (edad < 18) {
          erroresFecha.push("Debe tener al menos 18 anos");
        }

        FechaNacimiento = fecha;
      }

      if (erroresFecha.length > 0) {
        await deleteUploadedImage(req);
        return res.status(400).json({ message: erroresFecha.join(", ") });
      }
    }

    // validacion de contrasena
    const erroresPassword = [];

    if (Contrasena) {
      if (Contrasena.length < 8) {
        erroresPassword.push("minimo 8 caracteres");
      }
      if (!/[A-Z]/.test(Contrasena)) {
        erroresPassword.push("una letra mayuscula");
      }
      if (!/\d/.test(Contrasena)) {
        erroresPassword.push("un numero");
      }
      if (!/[^a-zA-Z0-9]/.test(Contrasena)) {
        erroresPassword.push("un caracter especial (ej: @, #, $, %, _, etc.)");
      }
    }

    if (erroresPassword.length > 0) {
      await deleteUploadedImage(req);
      return res.status(400).json({
        message: `La contrasena es invalida. Debe contener: ${erroresPassword.join(", ")}.`,
      });
    }

    const foundColaborador = await colaboradoresModel.findById(req.params.id);

    if (!foundColaborador) {
      await deleteUploadedImage(req);
      return res.status(404).json({ message: "Colaborador no encontrado" });
    }

    const updatedData = {
      Nombre,
      Apellido,
      Telefono,
      Direccion,
      DUI,
      FechaNacimiento,
      Correo,
      NumeroCuenta,
      BancoAsociado,
      loginAttempts,
      timeOut,
    };

    if (Contrasena) {
      // encriptar contrasena
      updatedData.Contrasena = await bcryptjs.hash(Contrasena, 10);
    }

    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });

    if (req.file) {
      if (foundColaborador.public_id) {
        await cloudinary.uploader.destroy(foundColaborador.public_id);
      }

      updatedData.Foto = req.file.path;
      updatedData.public_id = req.file.filename;
    }

    const updatedColaborador = await colaboradoresModel.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true },
    );

    return res.status(200).json(updatedColaborador);
  } catch (error) {
    console.log("Error al actualizar colaborador: " + error);
    await deleteUploadedImage(req);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default colaboradoresController;
