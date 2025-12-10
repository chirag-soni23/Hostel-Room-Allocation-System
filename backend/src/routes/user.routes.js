import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { changePassword, getProfile, login, logout, register, updateProfile } from "../controllers/user.controller.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuth, logout);
router.get("/me", isAuth, getProfile);
router.patch("/update",isAuth,updateProfile);
router.patch("/update-password",isAuth,changePassword);
router.post("/logout",isAuth,logout)
export default router;