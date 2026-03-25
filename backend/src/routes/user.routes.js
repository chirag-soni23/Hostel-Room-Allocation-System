import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  changePassword,
  getProfile,
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     tags: [User]
 *     summary: Register new user
 *     description: Create new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Chirag
 *               lastName:
 *                 type: string
 *                 example: Soni
 *               email:
 *                 type: string
 *                 example: chirag@gmail.com
 *               phone:
 *                 type: string
 *                 example: +911234567890
 *               password:
 *                 type: string
 *                 example: 123456
 *               confirmPassword:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/register", register);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     tags: [User]
 *     summary: Login user
 *     description: User login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: chirag@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", login);

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     tags: [User]
 *     summary: Get user profile
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", isAuth, getProfile);

/**
 * @swagger
 * /api/user/update:
 *   patch:
 *     tags: [User]
 *     summary: Update profile
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Chirag
 *               lastName:
 *                 type: string
 *                 example: Soni
 *               email:
 *                 type: string
 *                 example: chirag@gmail.com
 *               phone:
 *                 type: string
 *                 example: +911234567890
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/update", isAuth, updateProfile);

/**
 * @swagger
 * /api/user/update-password:
 *   patch:
 *     tags: [User]
 *     summary: Change password
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: 123456
 *               newPassword:
 *                 type: string
 *                 example: new123456
 *               confirmNewPassword:
 *                 type: string
 *                 example: new123456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/update-password", isAuth, changePassword);

/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     tags: [User]
 *     summary: Logout user
 *     description: Logout user and clear auth cookie
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", isAuth, logout);

export default router;
