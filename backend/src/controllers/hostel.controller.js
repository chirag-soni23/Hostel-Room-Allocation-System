import { Hostel } from "../models/hostel.model.js";
import  imagekit  from "../utils/imageKit.js";

const isAdmin = (user) => user?.role === "admin";


// Helpers
const uploadToImageKit = async (fileBuffer, fileNamePrefix = "hostel") => {
  const fileName = `${fileNamePrefix}_${Date.now()}.jpg`;
  const res = await imagekit.upload({
    file: fileBuffer.toString("base64"),
    fileName,
    folder: "hostels",
  });
  return { url: res.url, fileId: res.fileId };
};

// Create
export const createHostel = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ success: false, message: "Only admin can create hostel" });
    }

    const { name, location, amenities = [], rules = [] } = req.body;

    let photoUrl = undefined;
    if (req.file?.buffer) {
      const { url } = await uploadToImageKit(req.file.buffer, name?.trim() || "hostel");
      photoUrl = url;
    } else if (req.body?.photoBase64) {
      const base64 = Buffer.from(
        req.body.photoBase64.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      const { url } = await uploadToImageKit(base64, name?.trim() || "hostel");
      photoUrl = url;
    }

    const hostel = await Hostel.create({
      name,
      location,
      amenities: Array.isArray(amenities)
        ? amenities
        : String(amenities).split(",").map(s => s.trim()).filter(Boolean),

      rules: Array.isArray(rules)
        ? rules
        : String(rules).split(",").map(s => s.trim()).filter(Boolean),

      ...(photoUrl ? { photo: photoUrl } : {}),
    });

    res.status(201).json({ success: true, data: hostel });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


// Get all
export const getHostels = async (_req, res) => {
  try {
    const hostels = await Hostel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: hostels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get by id
export const getHostelById = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ success: false, message: "Hostel not found" });
    res.json({ success: true, data: hostel });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update 
export const updateHostel = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ success: false, message: "Only admin can update hostel" });
    }

    const { name, location, amenities, rules } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (location !== undefined) update.location = location;

    if (amenities !== undefined)
      update.amenities = Array.isArray(amenities)
        ? amenities
        : String(amenities).split(",").map(s => s.trim()).filter(Boolean);

    if (rules !== undefined)
      update.rules = Array.isArray(rules)
        ? rules
        : String(rules).split(",").map(s => s.trim()).filter(Boolean);

    // Image Update
    if (req.file?.buffer) {
      const { url } = await uploadToImageKit(req.file.buffer, name?.trim() || "hostel");
      update.photo = url;
    } else if (req.body?.photoBase64) {
      const base64 = Buffer.from(
        req.body.photoBase64.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      const { url } = await uploadToImageKit(base64, name?.trim() || "hostel");
      update.photo = url;
    }

    const hostel = await Hostel.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!hostel) {
      return res.status(404).json({ success: false, message: "Hostel not found" });
    }

    res.json({ success: true, data: hostel });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


// Delete
export const deleteHostel = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ success: false, message: "Only admin can delete hostel" });
    }

    const hostel = await Hostel.findByIdAndDelete(req.params.id);

    if (!hostel) {
      return res.status(404).json({ success: false, message: "Hostel not found" });
    }

    res.json({ success: true, message: "Hostel deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

