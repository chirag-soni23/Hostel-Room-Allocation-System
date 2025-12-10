import mongoose from "mongoose";
import Joi from "joi";

const paymentSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ["razorpay"], default: "razorpay" },
    orderId: { type: String },
    paymentId: { type: String },
    signature: { type: String },
    status: {
      type: String,
      enum: ["created", "authorized", "captured", "failed", "refunded"],
      default: "created",
    },
    method: { type: String },
    currency: { type: String, default: "INR" },
    amount: { type: Number, min: 0 },
    capturedAt: { type: Date },
    notes: { type: Map, of: String },
  },
  { _id: false, timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },

    checkInDate: { type: Date, required: true },
    durationMonths: { type: Number, enum: [1, 3, 6, 9, 12], required: true },

    monthlyRentSnapshot: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },

    payment: paymentSchema,
  },
  { timestamps: true }
);

bookingSchema.index(
  { user: 1, room: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "confirmed"] } },
  }
);

bookingSchema.pre("validate", function (next) {
  if (this.isModified("checkInDate") || this.isModified("durationMonths")) {
    if (this.checkInDate && this.durationMonths) {
      const d = new Date(this.checkInDate);
      const out = new Date(d);
      out.setMonth(out.getMonth() + this.durationMonths);
      this.checkOutDate = out;
    }
  }
  if (
    this.isModified("monthlyRentSnapshot") ||
    this.isModified("durationMonths")
  ) {
    if (typeof this.monthlyRentSnapshot === "number" && this.durationMonths) {
      this.totalAmount = this.monthlyRentSnapshot * this.durationMonths;
    }
  }
  next();
});

bookingSchema.post("save", async function (doc, next) {
  try {
    const Room = mongoose.model("Room");
    const active = await mongoose.model("Booking").countDocuments({
      room: doc.room,
      status: { $in: ["pending", "confirmed"] },
    });
    await Room.findByIdAndUpdate(doc.room, { occupiedCount: active });
    next();
  } catch (e) {
    next(e);
  }
});

bookingSchema.post("findOneAndUpdate", async function (_res, next) {
  try {
    const doc = await this.model.findOne(this.getQuery());
    if (!doc) return next();
    const Room = mongoose.model("Room");
    const active = await mongoose.model("Booking").countDocuments({
      room: doc.room,
      status: { $in: ["pending", "confirmed"] },
    });
    await Room.findByIdAndUpdate(doc.room, { occupiedCount: active });
    next();
  } catch (e) {
    next(e);
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
