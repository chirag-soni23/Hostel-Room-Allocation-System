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

router.post("/order", isAuth, createPaymentOrder);
router.post("/verify", isAuth, verifyPayment);
router.post("/signature", isAuth, generateSignatureDev);
router.get("/me", isAuth, getMyPayments);
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
