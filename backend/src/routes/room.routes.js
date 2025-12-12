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

router.get("/", listRooms);
router.get("/:id", getRoomById);

router.post(
  "/",
  upload.any(),
  isAuth,
  createRoom
);

router.patch(
  "/:id",
  upload.any(),
  isAuth,
  updateRoom
);

router.delete(
  "/:id",
  isAuth,
  deleteRoom
);

// Photos
router.post(
  "/:id/photos",
  isAuth,
  upload.any(),
  addRoomPhotos
);

router.delete(
  "/:id/photos",
  isAuth,
  removeRoomPhoto
);

export default router;
