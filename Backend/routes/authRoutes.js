import express from "express";
import { forgetpasswordotp, isUserLoggedIn, login, logout, register, resetPassword, verify_otp_for_resetpassword, verifyOtp } from "../controllers/authController.js";
import { userAuth } from "../middleware/userAuth.js";
const router = express.Router();



router.post('/register', register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/send-otp-forgget-password", userAuth, forgetpasswordotp);
router.post("/verify-otp-resetpassword", userAuth, verify_otp_for_resetpassword);
router.post("/password-reset" , userAuth, resetPassword);
router.post("/logout",userAuth, logout);
router.get('/is-auth', userAuth, isUserLoggedIn)







export default router;