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

/**
 * @swagger
 * /api/booking:
 *   post:
 *     tags: [Booking]
 *     summary: Create booking
 *     description: Book a room
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - hostelId
 *               - checkInDate
 *               - durationMonths
 *             properties:
 *               roomId:
 *                 type: string
 *               hostelId:
 *                 type: string
 *               checkInDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-04-01
 *               durationMonths:
 *                 type: number
 *                 enum: [1, 3, 6, 9, 12]
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Room full
 */
router.post("/", isAuth, createBooking);
/**
 * @swagger
 * /api/booking/me:
 *   get:
 *     tags: [Booking]
 *     summary: Get my bookings
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get("/me", isAuth, getMyBookings);
/**
 * @swagger
 * /api/booking/{id}:
 *   get:
 *     tags: [Booking]
 *     summary: Get booking by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Booking details
 *       404:
 *         description: Not found
 */
router.get("/:id", isAuth, getBookingById);
/**
 * @swagger
 * /api/booking/{id}/cancel:
 *   patch:
 *     tags: [Booking]
 *     summary: Cancel booking
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Booking cancelled
 *       400:
 *         description: Cannot cancel
 */
router.patch("/:id/cancel", isAuth, cancelMyBooking);

/**
 * @swagger
 * /api/booking:
 *   get:
 *     tags: [Booking]
 *     summary: Get all bookings (Admin)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *       - in: query
 *         name: hostelId
 *       - in: query
 *         name: roomId
 *       - in: query
 *         name: status
 *       - in: query
 *         name: q
 *     responses:
 *       200:
 *         description: All bookings
 *       403:
 *         description: Forbidden
 */
router.get("/", isAuth, listBookings);
/**
 * @swagger
 * /api/booking/{id}/status:
 *   patch:
 *     tags: [Booking]
 *     summary: Update booking status (Admin)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/:id/status", isAuth, updateBookingStatus);
/**
 * @swagger
 * /api/booking/{id}:
 *   delete:
 *     tags: [Booking]
 *     summary: Delete booking (Admin)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Booking deleted
 */
router.delete("/:id", isAuth, deleteBooking);

export default router;
