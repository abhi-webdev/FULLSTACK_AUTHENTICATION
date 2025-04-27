import express from "express"

import { isAuthenticated, login, logout, register, sendVerifyOtp, verifyEmail, sendResetOtp, resetPassword, googleLogin } from "../controllers/auth.controller.js"
import userAuth from "../middlewares/auth.middleware.js"




const router = express.Router() 

router.post("/register", register)
router.post("/login", login)
router.post("/google-login", googleLogin)
router.post("/logout", logout)
router.post("/send-verify-otp", userAuth, sendVerifyOtp)
router.post("/verify-account", userAuth, verifyEmail)
router.get("/is-auth", isAuthenticated)
router.post("/send-reset-otp", sendResetOtp)
router.post("/reset-password", resetPassword)






export {router}