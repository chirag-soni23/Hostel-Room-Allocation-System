import mongoose from "mongoose";
import Joi from "joi";
import { Room } from "../models/room.model.js";
import { Hostel } from "../models/hostel.model.js";
import imagekit from "../utils/imageKit.js";

const isAdmin = (user) => user?.role === "admin";
const parseCSV = (v) =>
  Array.isArray(v)
    ? v
    : String(v || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
const normalizeArray = (arr = []) => arr.map((s) => String(s).trim()).filter(Boolean);

const uploadToImageKit = async (fileBuffer, fileNamePrefix = "room") => {
  const fileName = `${fileNamePrefix}_${Date.now()}.jpg`;
  const res = await imagekit.upload({
    file: fileBuffer.toString("base64"),
    fileName,
    folder: "rooms",
  });
  return { url: res.url, fileId: res.fileId };
};

/* --------------------------- Validators --------------------------- */
const createSchema = Joi.object({
  hostelId: Joi.string().hex().length(24).required(),
  number: Joi.string().required(),
  type: Joi.string().valid("single", "double", "triple").required(),
  genderPreference: Joi.string().valid("male", "female", "any").default("any"),
  monthlyRent: Joi.number().min(0).required(),
  capacity: Joi.number().integer().min(1).required(),
  location: Joi.string().required(),
  amenities: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  photos: Joi.alternatives().try(Joi.array().items(Joi.string().uri()), Joi.string().uri()).optional(),
  isActive: Joi.boolean().default(true),
});

const updateSchema = Joi.object({
  hostelId: Joi.string().hex().length(24),
  number: Joi.string(),
  type: Joi.string().valid("single", "double", "triple"),
  genderPreference: Joi.string().valid("male", "female", "any"),
  monthlyRent: Joi.number().min(0),
  capacity: Joi.number().integer().min(1),
  occupied: Joi.number().integer().min(0),
  location: Joi.string(),
  isActive: Joi.boolean(),
  amenities: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
  photos: Joi.array().items(Joi.string().uri()),
}).min(1);

// create room
export const createRoom = async (req, res) => {
  try {
    if (!isAdmin(req.user))
      return res.status(403).json({ success: false, message: "Only admin can create room" });

    const { value, error } = createSchema.validate(req.body, { abortEarly: false });
    if (error)
      return res.status(400).json({ success: false, message: "Validation failed", details: error.details });

    const hostel = await Hostel.findById(value.hostelId).select("_id name");
    if (!hostel) return res.status(404).json({ success: false, message: "Hostel not found" });

    const dup = await Room.findOne({ hostel: value.hostelId, number: value.number }).lean();
    if (dup) return res.status(409).json({ success: false, message: "Room number already exists in this hostel" });

    // photos
    let photoUrls = [];
    if (req.files?.length) {
      const uploads = await Promise.all(req.files.map((f) => uploadToImageKit(f.buffer, `${hostel.name}_${value.number}`)));
      photoUrls = uploads.map((u) => u.url);
    } else if (req.file?.buffer) {
      const { url } = await uploadToImageKit(req.file.buffer, `${hostel.name}_${value.number}`);
      photoUrls = [url];
    } else if (req.body?.photoBase64) {
      const base64 = Buffer.from(String(req.body.photoBase64).replace(/^data:image\/\w+;base64,/, ""), "base64");
      const { url } = await uploadToImageKit(base64, `${hostel.name}_${value.number}`);
      photoUrls = [url];
    } else if (value.photos) {
      photoUrls = Array.isArray(value.photos) ? value.photos : [value.photos];
    }

    const amenities = normalizeArray(parseCSV(value.amenities));

    const room = await Room.create({
      hostel: value.hostelId,
      number: value.number,
      type: value.type,
      genderPreference: value.genderPreference,
      monthlyRent: value.monthlyRent,
      capacity: value.capacity,
      location: value.location,
      amenities,
      photos: photoUrls,
      isActive: value.isActive,
    });

    await Hostel.findByIdAndUpdate(value.hostelId, { $addToSet: { rooms: room._id } });

    const doc = await Room.findById(room._id).populate("hostel", "name location").lean();

    res.status(201).json({ success: true, data: { ...doc, hostelId: doc.hostel?._id || null } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// list rooms
// list rooms with full-text style search (regex) including hostel name
export const listRooms = async (req, res) => {
  try {
    const {
      q,
      type,
      gender,
      hostelId,
      minRent,
      maxRent,
      available,
      page = 1,
      limit = 12,
      sort = "createdAt:desc",
    } = req.query;

    const esc = (s = "") => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const isValidId = (id) => mongoose.isValidObjectId(id);

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);

    const [sortField, sortOrder] = String(sort).split(":");
    const sortObj = { [sortField || "createdAt"]: sortOrder === "asc" ? 1 : -1 };

    // Base match (exact filters)
    const match = {};
    if (type) match.type = type;
    if (gender) match.genderPreference = gender;
    if (hostelId && isValidId(hostelId)) match.hostel = new mongoose.Types.ObjectId(hostelId);
    if (available !== undefined) {
      const val = String(available).toLowerCase();
      match.available = ["true", "1", "yes"].includes(val);
    }
    if (minRent || maxRent) {
      match.monthlyRent = {};
      if (minRent) match.monthlyRent.$gte = Number(minRent);
      if (maxRent) match.monthlyRent.$lte = Number(maxRent);
    }

    // Search match (broad regex)
    let searchOr = null;
    if (q && String(q).trim()) {
      const r = new RegExp(esc(q), "i");
      searchOr = [
        { number: r },
        { location: r },
        { type: r },
        { genderPreference: r },
        { amenities: r }, // matches any amenity string
        { "hostelDoc.name": r }, // via lookup
      ];
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "hostels",
          localField: "hostel",
          foreignField: "_id",
          as: "hostelDoc",
          pipeline: [{ $project: { name: 1, location: 1 } }],
        },
      },
      { $unwind: { path: "$hostelDoc", preserveNullAndEmptyArrays: true } },
    ];

    if (searchOr) pipeline.push({ $match: { $or: searchOr } });

    pipeline.push(
      { $sort: sortObj },
      {
        $facet: {
          items: [
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },
            {
              $project: {
                number: 1,
                type: 1,
                genderPreference: 1,
                monthlyRent: 1,
                amenities: 1,
                capacity: 1,
                occupied: 1,
                location: 1,
                photos: 1,
                isActive: 1,
                available: 1,
                createdAt: 1,
                updatedAt: 1,
                hostel: "$hostel",
                hostelDoc: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      }
    );

    const result = await Room.aggregate(pipeline);
    const items = (result[0]?.items || []).map((doc) => ({
      ...doc,
      hostel: doc.hostelDoc ? { _id: doc.hostel, name: doc.hostelDoc.name, location: doc.hostelDoc.location } : null,
      hostelId: doc.hostel || null,
    }));
    const total = result[0]?.total?.[0]?.count || 0;

    res.json({
      success: true,
      data: { items, total, page: pageNum, limit: limitNum },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// get rooms by id 
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("hostel", "name location").lean();
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    res.json({ success: true, data: { ...room, hostelId: room.hostel?._id || null } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// update room
export const updateRoom = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ success: false, message: "Only admin can update room" });

    const { value, error } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, message: "Validation failed", details: error.details });

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    // scalar fields
    ["number", "type", "genderPreference", "monthlyRent", "capacity", "occupied", "location", "isActive"].forEach(
      (k) => {
        if (value[k] !== undefined) room[k] = value[k];
      }
    );

    // change hostel if hostelId provided
    if (value.hostelId) room.hostel = value.hostelId;

    if (value.amenities !== undefined) room.amenities = normalizeArray(parseCSV(value.amenities));
    if (Array.isArray(value.photos)) room.photos = value.photos;

    // handle new uploads
    const newUrls = [];
    if (req.files?.length) {
      const uploads = await Promise.all(req.files.map((f) => uploadToImageKit(f.buffer, `room_${room.number}`)));
      newUrls.push(...uploads.map((u) => u.url));
    }
    if (req.file?.buffer) {
      const { url } = await uploadToImageKit(req.file.buffer, `room_${room.number}`);
      newUrls.push(url);
    }
    if (req.body?.photoBase64) {
      const base64 = Buffer.from(String(req.body.photoBase64).replace(/^data:image\/\w+;base64,/, ""), "base64");
      const { url } = await uploadToImageKit(base64, `room_${room.number}`);
      newUrls.push(url);
    }
    if (newUrls.length) room.photos = [...(room.photos || []), ...newUrls];

    await room.save();

    const doc = await Room.findById(room._id).populate("hostel", "name location").lean();

    res.json({ success: true, data: { ...doc, hostelId: doc.hostel?._id || null } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// delete room
export const deleteRoom = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ success: false, message: "Only admin can delete room" });

    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    res.json({ success: true, message: "Room deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// add room photos
export const addRoomPhotos = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ success: false, message: "Only admin can modify photos" });

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    let urls = Array.isArray(req.body.urls) ? req.body.urls.filter(Boolean) : [];

    if (req.files?.length) {
      const uploads = await Promise.all(req.files.map((f) => uploadToImageKit(f.buffer, `room_${room.number}`)));
      urls = urls.concat(uploads.map((u) => u.url));
    }
    if (req.file?.buffer) {
      const { url } = await uploadToImageKit(req.file.buffer, `room_${room.number}`);
      urls.push(url);
    }
    if (req.body?.photoBase64) {
      const base64 = Buffer.from(String(req.body.photoBase64).replace(/^data:image\/\w+;base64,/, ""), "base64");
      const { url } = await uploadToImageKit(base64, `room_${room.number}`);
      urls.push(url);
    }

    room.photos = [...(room.photos || []), ...urls];
    await room.save();

    res.json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// remove photo by url
export const removeRoomPhoto = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ success: false, message: "Only admin can modify photos" });

    const { url } = req.body || {};
    if (!url) return res.status(400).json({ success: false, message: "url is required" });

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    room.photos = (room.photos || []).filter((u) => u !== url);
    await room.save();

    res.json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
