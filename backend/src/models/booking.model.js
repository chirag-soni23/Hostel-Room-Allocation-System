import mongoose from "mongoose";
import Joi from "joi";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    checkInDate: { type: Date, required: true },
    durationMonths: { type: Number, enum: [1, 3, 6, 9, 12], required: true },

    monthlyRentSnapshot: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  { timestamps: true }
);

bookingSchema.pre("validate", function (next) {
  if (this.checkInDate && this.durationMonths) {
    const d = new Date(this.checkInDate);
    const out = new Date(d);
    out.setMonth(out.getMonth() + this.durationMonths);
    this.checkOutDate = out;
  }

  if (this.monthlyRentSnapshot && this.durationMonths) {
    this.totalAmount = this.monthlyRentSnapshot * this.durationMonths;
  }
  next();
});

bookingSchema.post("save", async function (doc, next) {
  try {
    const Room = mongoose.model("Room");
    const activeCount = await mongoose.model("Booking").countDocuments({
      room: doc.room,
      status: { $in: ["pending", "confirmed"] },
    });
    await Room.findByIdAndUpdate(doc.room, { occupied: activeCount });
    next();
  } catch (err) {
    next(err);
  }
});

bookingSchema.post("findOneAndUpdate", async function (_res, next) {
  try {
    const doc = await this.model.findOne(this.getQuery());
    if (!doc) return next();
    const Room = mongoose.model("Room");
    const activeCount = await mongoose.model("Booking").countDocuments({
      room: doc.room,
      status: { $in: ["pending", "confirmed"] },
    });
    await Room.findByIdAndUpdate(doc.room, { occupied: activeCount });
    next();
  } catch (err) {
    next(err);
  }
});

export const validateBooking = (data) => {
  const schema = Joi.object({
    roomId: Joi.string().hex().length(24).required(),
    hostelId: Joi.string().hex().length(24).required(),
    checkInDate: Joi.date().iso().required(),
    durationMonths: Joi.number().valid(1, 3, 6, 9, 12).required(),
  });
  return schema.validate(data, { abortEarly: false });
};

export const Booking = mongoose.model("Booking", bookingSchema);
