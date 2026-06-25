import express from "express";

import loginAdmins from "../../Controller/Admin/LoginAdminController.js";

const router = express.Router();

router.route("/").post(loginAdmins.login);

export default router;
