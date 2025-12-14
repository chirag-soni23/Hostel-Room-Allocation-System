import { Router } from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelMyBooking,
  updateBookingStatus,
  listBookings,
  deleteBooking,
} from "../controllers/booking.controller.js";

const router = Router();

router.post("/", isAuth, createBooking);
router.get("/me", isAuth, getMyBookings);
router.get("/:id", isAuth, getBookingById);
router.patch("/:id/cancel", isAuth, cancelMyBooking);

router.get("/", isAuth, listBookings);
router.patch("/:id/status", isAuth, updateBookingStatus);
router.delete("/:id", isAuth, deleteBooking);

export default router;
