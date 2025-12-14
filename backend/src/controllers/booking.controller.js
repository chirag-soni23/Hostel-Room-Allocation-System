import mongoose from "mongoose";
import Joi from "joi";
import { Booking, validateBooking } from "../models/booking.model.js";
import { Room } from "../models/room.model.js";
import { Hostel } from "../models/hostel.model.js";

const isAdmin = (user) => user?.role === "admin";

// create booking
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { error, value } = validateBooking(req.body, { abortEarly: false });
    if (error) {
      return res
        .status(400)
        .json({ success: false, errors: error.details.map((d) => d.message) });
    }

    const { roomId, hostelId, checkInDate, durationMonths } = value;

    let createdId = null;

    await session.withTransaction(async () => {
      const [room, hostel] = await Promise.all([
        Room.findById(roomId).session(session),
        Hostel.findById(hostelId).session(session),
      ]);

      if (!room) throw new Error("ROOM_NOT_FOUND");
      if (!hostel) throw new Error("HOSTEL_NOT_FOUND");
      if (String(room.hostel) !== String(hostel._id))
        throw new Error("ROOM_HOSTEL_MISMATCH");
      if (!room.isActive) throw new Error("ROOM_INACTIVE");

      // past date guard
      const checkIn = new Date(checkInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkIn < today) throw new Error("CHECKIN_IN_PAST");

      // availability check (inside txn)
      const activeCount = await Booking.countDocuments({
        room: room._id,
        status: { $in: ["pending", "confirmed"] },
      }).session(session);

      if (activeCount >= (room.capacity ?? 0)) throw new Error("ROOM_FULL");

      const monthlyRentSnapshot = room.monthlyRent;

      const docs = await Booking.create(
        [
          {
            user: req.user?.id,
            hostel: hostel._id,
            room: room._id,
            checkInDate,
            durationMonths,
            monthlyRentSnapshot,
            status: "pending",
          },
        ],
        { session }
      );

      createdId = docs[0]._id;
    });

    // fetch populated after commit (no session)
    const doc = await Booking.findById(createdId)
      .populate("user", "firstName lastName email")
      .populate("hostel", "name location")
      .populate("room", "number type genderPreference monthlyRent")
      .lean();

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    // map custom errors to http responses
    const map = {
      ROOM_NOT_FOUND: [404, "Room not found"],
      HOSTEL_NOT_FOUND: [404, "Hostel not found"],
      ROOM_HOSTEL_MISMATCH: [400, "Room does not belong to this hostel"],
      ROOM_INACTIVE: [400, "Room is inactive"],
      CHECKIN_IN_PAST: [400, "checkInDate cannot be in the past"],
      ROOM_FULL: [409, "Room is full"],
    };
    const [code, message] = map[err?.message] ?? [500, err.message];
    return res.status(code).json({ success: false, message });
  } finally {
    session.endSession();
  }
};

// get my bookings
export const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 12, sort = "createdAt:desc" } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const [sortField, sortOrder] = String(sort).split(":");
    const sortObj = {
      [sortField || "createdAt"]: sortOrder === "asc" ? 1 : -1,
    };

    const filter = { user: req.user?.id };
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      Booking.find(filter)
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("hostel", "name location")
        .populate("room", "number type genderPreference monthlyRent")
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: { items, total, page: pageNum, limit: limitNum },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// get booking by id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("hostel", "name location")
      .populate("room", "number type genderPreference monthlyRent")
      .lean();

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    if (
      !isAdmin(req.user) &&
      String(booking.user?._id) !== String(req.user?.id)
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.json({ success: true, data: booking });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// cancel my booking
export const cancelMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user?.id,
    });
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    if (!["pending", "confirmed"].includes(booking.status)) {
      return res
        .status(400)
        .json({ success: false, message: "Booking cannot be cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();
    const doc = await Booking.findById(booking._id)
      .populate("hostel", "name location")
      .populate("room", "number type")
      .lean();

    return res.json({ success: true, data: doc });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const statusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "confirmed", "cancelled", "completed")
    .required(),
});

// update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    if (!isAdmin(req.user))
      return res
        .status(403)
        .json({ success: false, message: "Only admin can update status" });

    const { error, value } = statusSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ success: false, errors: error.details.map((d) => d.message) });

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: value.status },
      { new: true, runValidators: true }
    )
      .populate("user", "firstName lastName email")
      .populate("hostel", "name location")
      .populate("room", "number type genderPreference monthlyRent");

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    return res.json({ success: true, data: booking });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// list booking
export const listBookings = async (req, res) => {
  try {
    if (!isAdmin(req.user))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const {
      userId,
      hostelId,
      roomId,
      status,
      q,
      page = 1,
      limit = 12,
      sort = "createdAt:desc",
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const [sortField, sortOrder] = String(sort).split(":");
    const sortObj = {
      [sortField || "createdAt"]: sortOrder === "asc" ? 1 : -1,
    };

    const esc = (s = "") => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const filter = {};
    if (userId && mongoose.isValidObjectId(userId))
      filter.user = new mongoose.Types.ObjectId(userId);
    if (hostelId && mongoose.isValidObjectId(hostelId))
      filter.hostel = new mongoose.Types.ObjectId(hostelId);
    if (roomId && mongoose.isValidObjectId(roomId))
      filter.room = new mongoose.Types.ObjectId(roomId);
    if (status) filter.status = status;

    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDoc",
          pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }],
        },
      },
      {
        $lookup: {
          from: "hostels",
          localField: "hostel",
          foreignField: "_id",
          as: "hostelDoc",
          pipeline: [{ $project: { name: 1, location: 1 } }],
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "room",
          foreignField: "_id",
          as: "roomDoc",
          pipeline: [{ $project: { number: 1, type: 1 } }],
        },
      },
      { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$hostelDoc", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$roomDoc", preserveNullAndEmptyArrays: true } },
    ];

    if (q && String(q).trim()) {
      const r = new RegExp(esc(q), "i");
      pipeline.push({
        $match: {
          $or: [
            { "userDoc.firstName": r },
            { "userDoc.lastName": r },
            { "userDoc.email": r },
            { "hostelDoc.name": r },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: sortObj },
      {
        $facet: {
          items: [
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },
            {
              $project: {
                _id: 1,
                user: 1,
                hostel: 1,
                room: 1,
                checkInDate: 1,
                durationMonths: 1,
                monthlyRentSnapshot: 1,
                totalAmount: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                userDoc: 1,
                hostelDoc: 1,
                roomDoc: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      }
    );

    const result = await Booking.aggregate(pipeline);
    const items = (result[0]?.items || []).map((b) => ({
      ...b,
      user: b.userDoc ? { _id: b.user, ...b.userDoc } : b.user,
      hostel: b.hostelDoc ? { _id: b.hostel, ...b.hostelDoc } : b.hostel,
      room: b.roomDoc ? { _id: b.room, ...b.roomDoc } : b.room,
    }));
    const total = result[0]?.total?.[0]?.count || 0;

    return res.json({
      success: true,
      data: { items, total, page: pageNum, limit: limitNum },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// delete booking
export const deleteBooking = async (req, res) => {
  try {
    if (!isAdmin(req.user))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    const activeCount = await Booking.countDocuments({
      room: booking.room,
      status: { $in: ["pending", "confirmed"] },
    });
    await Room.findByIdAndUpdate(booking.room, { occupied: activeCount });

    return res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
