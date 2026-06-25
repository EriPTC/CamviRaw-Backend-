const logoutColaboradoresController = {};

logoutColaboradoresController.logout = async (req, res) => {
    try {
        res.clearCookie("authColaboradorCookie");

        return res.status(200).json({ message: "Sesion de colaborador cerrada" });
    } catch (error) {
        console.log("Error en logout de colaborador: " + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default logoutColaboradoresController;
