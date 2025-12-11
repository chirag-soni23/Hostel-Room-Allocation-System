import { Hostel } from "../models/hostel.model.js";
import imagekit from "../utils/imageKit.js";

const isAdmin = (user) => user?.role === "admin";

const uploadToImageKit = async (fileBuffer, fileNamePrefix = "hostel") => {
  const fileName = `${fileNamePrefix}_${Date.now()}.jpg`;
  const res = await imagekit.upload({
    file: fileBuffer.toString("base64"),
    fileName,
    folder: "hostels",
  });
  return { url: res.url, fileId: res.fileId };
};

const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseCSV = (v) =>
  Array.isArray(v)
    ? v
    : String(v || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

export const createHostel = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res
        .status(403)
        .json({ success: false, message: "Only admin can create hostel" });
    }

    const { name, location, amenities = [], rules = [] } = req.body;

    let photoUrl;
    if (req.file?.buffer) {
      const { url } = await uploadToImageKit(
        req.file.buffer,
        name?.trim() || "hostel"
      );
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
      amenities: parseCSV(amenities),
      rules: parseCSV(rules),
      ...(photoUrl ? { photo: photoUrl } : {}),
    });

    res.status(201).json({ success: true, data: hostel });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ---- Get all (with search, city filter, amenities, pagination) ----
   Examples:
   - GET /hostel?q=sunshine
   - GET /hostel?city=Delhi or /hostel?city=Delhi,Mumbai
   - GET /hostel?amenities=wifi,mess
   - GET /hostel?page=2&limit=9
*/
export const getHostels = async (req, res) => {
  try {
    const {
      q = "",
      city, 
      amenities,
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);

    const query = {};

    if (q && String(q).trim()) {
      const safe = escapeRegex(String(q).trim());
      query.$or = [
        { name: { $regex: safe, $options: "i" } },
        { location: { $regex: safe, $options: "i" } },
      ];
    }

    const cities = parseCSV(city);
    if (cities.length) {
      query.location = { $in: cities };
    }

    const amenityList = parseCSV(amenities);
    if (amenityList.length) {
      query.amenities = { $all: amenityList };
    }

    const [items, total] = await Promise.all([
      Hostel.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Hostel.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { items, total, page: pageNum, limit: limitNum },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* -------------- Get by id -------------- */
export const getHostelById = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel)
      return res
        .status(404)
        .json({ success: false, message: "Hostel not found" });
    res.json({ success: true, data: hostel });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateHostel = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res
        .status(403)
        .json({ success: false, message: "Only admin can update hostel" });
    }

    const { name, location, amenities, rules } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (location !== undefined) update.location = location;
    if (amenities !== undefined) update.amenities = parseCSV(amenities);
    if (rules !== undefined) update.rules = parseCSV(rules);

    if (req.file?.buffer) {
      const { url } = await uploadToImageKit(
        req.file.buffer,
        name?.trim() || "hostel"
      );
      update.photo = url;
    } else if (req.body?.photoBase64) {
      const base64 = Buffer.from(
        req.body.photoBase64.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      const { url } = await uploadToImageKit(base64, name?.trim() || "hostel");
      update.photo = url;
    }

    const hostel = await Hostel.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!hostel)
      return res
        .status(404)
        .json({ success: false, message: "Hostel not found" });

    res.json({ success: true, data: hostel });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* -------------- Delete -------------- */
export const deleteHostel = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res
        .status(403)
        .json({ success: false, message: "Only admin can delete hostel" });
    }

    const hostel = await Hostel.findByIdAndDelete(req.params.id);

    if (!hostel)
      return res
        .status(404)
        .json({ success: false, message: "Hostel not found" });

    res.json({ success: true, message: "Hostel deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getCities = async (_req, res) => {
  try {
    const cities = await Hostel.distinct("location");
    res.json({
      success: true,
      data: cities.filter(Boolean).sort((a, b) => a.localeCompare(b)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
