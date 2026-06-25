const logoutClientesController = {};

logoutClientesController.logout = async (req, res) => {
    try {
        res.clearCookie("authClienteCookie");

        return res.status(200).json({ message: "Sesion de cliente cerrada" });
    } catch (error) {
        console.log("Error en logout de cliente: " + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default logoutClientesController;
