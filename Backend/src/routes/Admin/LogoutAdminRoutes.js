import express from "express";

import logoutController from "../../Controller/Admin/LogoutAdminController.js";

const router = express.Router();

router.route("/").post(logoutController.logout);

export default router;
