import { Router } from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  createPaymentOrder,
  getMyPayments,
  listPayments,
  verifyPayment,
  generateSignatureDev,
} from "../controllers/payment.controller.js";

const router = Router();

/**
 * @swagger
 * /api/payment/order:
 *   post:
 *     tags: [Payment]
 *     summary: Create Razorpay order
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId:
 *                 type: string
 *                 example: 64f123abc123abc123abc123
 *     responses:
 *       201:
 *         description: Payment order created
 *       400:
 *         description: Invalid data
 */
router.post("/order", isAuth, createPaymentOrder);
/**
 * @swagger
 * /api/payment/verify:
 *   post:
 *     tags: [Payment]
 *     summary: Verify Razorpay payment
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid signature
 */
router.post("/verify", isAuth, verifyPayment);
/**
 * @swagger
 * /api/payment/signature:
 *   post:
 *     tags: [Payment]
 *     summary: Generate signature (Dev only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signature generated
 */
router.post("/signature", isAuth, generateSignatureDev);
/**
 * @swagger
 * /api/payment/me:
 *   get:
 *     tags: [Payment]
 *     summary: Get my payments
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user payments
 */
router.get("/me", isAuth, getMyPayments);

/**
 * @swagger
 * /api/payment:
 *   get:
 *     tags: [Payment]
 *     summary: Get all payments (Admin only)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: All payments list
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  isAuth,
  (req, res, next) => {
    if (req.user?.role === "admin") return next();
    return res.status(403).json({ success: false, message: "Forbidden" });
  },
  listPayments
);

export default router;
