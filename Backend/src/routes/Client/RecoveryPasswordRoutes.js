import express from "express";
import recoveryPasswordController from "../../Controller/Client/RecoveryPasswordController.js";

const router = express.Router();

router.route("/").post(recoveryPasswordController.recoverPassword);
router.route("/verifyCode").post(recoveryPasswordController.verifyCode);
router.route("/resendCode").post(recoveryPasswordController.resendCode);
router.route("/newPassword").post(recoveryPasswordController.newPassword);

export default router;
