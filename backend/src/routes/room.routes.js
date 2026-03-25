import { Router } from "express";
import multer from "multer";

import {
  createRoom,
  listRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  addRoomPhotos,
  removeRoomPhoto,
} from "../controllers/room.controller.js";
import {isAuth} from "../middlewares/isAuth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/room:
 *   get:
 *     tags: [Room]
 *     summary: Get all rooms
 *     description: Get rooms with filters and pagination
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [single, double, triple]
 *       - in: query
 *         name: minRent
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxRent
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Rooms fetched successfully
 */
router.get("/", listRooms);

/**
 * @swagger
 * /api/room/{id}:
 *   get:
 *     tags: [Room]
 *     summary: Get room by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room data
 *       404:
 *         description: Room not found
 */
router.get("/:id", getRoomById);

/**
 * @swagger
 * /api/room:
 *   post:
 *     tags: [Room]
 *     summary: Create room (Admin only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - hostelId
 *               - number
 *               - type
 *               - monthlyRent
 *               - capacity
 *               - location
 *             properties:
 *               hostelId:
 *                 type: string
 *               number:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [single, double, triple]
 *               genderPreference:
 *                 type: string
 *                 enum: [male, female, any]
 *               monthlyRent:
 *                 type: number
 *               capacity:
 *                 type: number
 *               location:
 *                 type: string
 *               amenities:
 *                 type: string
 *                 example: wifi,ac,tv
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Room created
 *       403:
 *         description: Only admin allowed
 */
router.post(
  "/",
  upload.any(),
  isAuth,
  createRoom
);

/**
 * @swagger
 * /api/room/{id}:
 *   patch:
 *     tags: [Room]
 *     summary: Update room (Admin only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               number:
 *                 type: string
 *               type:
 *                 type: string
 *               monthlyRent:
 *                 type: number
 *               capacity:
 *                 type: number
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Room updated
 */
router.patch(
  "/:id",
  upload.any(),
  isAuth,
  updateRoom
);

/**
 * @swagger
 * /api/room/{id}:
 *   delete:
 *     tags: [Room]
 *     summary: Delete room (Admin only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Room deleted
 */
router.delete(
  "/:id",
  isAuth,
  deleteRoom
);

/**
 * @swagger
 * /api/room/{id}/photos:
 *   post:
 *     tags: [Room]
 *     summary: Add photos to room
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Photos added
 */
router.post(
  "/:id/photos",
  isAuth,
  upload.any(),
  addRoomPhotos
);

/**
 * @swagger
 * /api/room/{id}/photos:
 *   delete:
 *     tags: [Room]
 *     summary: Remove photo from room
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Photo removed
 */
router.delete(
  "/:id/photos",
  isAuth,
  removeRoomPhoto
);

export default router;
