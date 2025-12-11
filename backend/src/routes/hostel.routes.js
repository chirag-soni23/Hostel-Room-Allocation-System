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

router.post("/", isAuth, upload.single("photo"), createHostel);

// Get all hostels (supports ?q=&city=&amenities=&page=&limit=)
router.get("/", getHostels);

router.get("/cities/list", getCities);

router.get("/:id", getHostelById);

router.patch("/:id", isAuth, upload.single("photo"), updateHostel);

router.delete("/:id", isAuth, deleteHostel);

export default router;
