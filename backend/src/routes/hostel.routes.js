import { Router } from "express";
import multer from "multer";
import {
  createHostel,
  getHostels,
  getHostelById,
  updateHostel,
  deleteHostel,
  getCities,
} from "../controllers/hostel.controller.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/hostel:
 *   post:
 *     tags: [Hostel]
 *     summary: Create hostel (Admin only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sunshine Hostel
 *               location:
 *                 type: string
 *                 example: Delhi
 *               amenities:
 *                 type: string
 *                 example: wifi,mess,ac
 *               rules:
 *                 type: string
 *                 example: no smoking,no alcohol
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Hostel created successfully
 *       403:
 *         description: Only admin allowed
 */
router.post("/", isAuth, upload.single("photo"), createHostel);
/**
 * @swagger
 * /api/hostel:
 *   get:
 *     tags: [Hostel]
 *     summary: Get all hostels
 *     description: Search and filter hostels
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by name or location
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City filter (comma separated)
 *       - in: query
 *         name: amenities
 *         schema:
 *           type: string
 *         description: Amenities filter (comma separated)
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
 *         description: Hostels fetched successfully
 */
router.get("/", getHostels);

/**
 * @swagger
 * /api/hostel/cities/list:
 *   get:
 *     tags: [Hostel]
 *     summary: Get all available cities
 *     responses:
 *       200:
 *         description: List of cities
 */
router.get("/cities/list", getCities);

/**
 * @swagger
 * /api/hostel/{id}:
 *   get:
 *     tags: [Hostel]
 *     summary: Get hostel by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hostel data
 *       404:
 *         description: Hostel not found
 */
router.get("/:id", getHostelById);

/**
 * @swagger
 * /api/hostel/{id}:
 *   patch:
 *     tags: [Hostel]
 *     summary: Update hostel (Admin only)
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
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               amenities:
 *                 type: string
 *               rules:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Hostel updated
 *       403:
 *         description: Only admin allowed
 */
router.patch("/:id", isAuth, upload.single("photo"), updateHostel);

/**
 * @swagger
 * /api/hostel/{id}:
 *   delete:
 *     tags: [Hostel]
 *     summary: Delete hostel (Admin only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Hostel deleted
 *       403:
 *         description: Only admin allowed
 */
router.delete("/:id", isAuth, deleteHostel);

export default router;
