import { Router } from "express";
import { sendContactMessage } from "../controllers/contact.controller.js";

const router = Router();
/**
 * @swagger
 * /api/contact:
 *   post:
 *     tags: [Contact]
 *     summary: Send contact message
 *     description: Send message via contact form (email will be sent)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: Chirag Soni
 *               email:
 *                 type: string
 *                 example: chirag@gmail.com
 *               phone:
 *                 type: string
 *                 example: +911234567890
 *               subject:
 *                 type: string
 *                 example: Hostel Inquiry
 *               message:
 *                 type: string
 *                 example: I want to know more about your hostel.
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/", sendContactMessage);

export default router;
