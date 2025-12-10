import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    number: { type: String, required: true },
    type: {
      type: String,
      enum: ["single", "double", "triple"],
      required: true,
    },
    genderPreference: {
      type: String,
      enum: ["male", "female", "any"],
      default: "any",
    },
    monthlyRent: { type: Number, required: true },
    capacity: { type: Number, required: true }, 
    location: { type: String, required: true }, 
    photos: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

roomSchema.virtual("availableSpots").get(function () {
  return Math.max(this.capacity - this.occupied, 0);
});

roomSchema.virtual("isAvailable").get(function () {
  return this.availableSpots > 0 && this.isActive;
});

roomSchema.virtual("displayLocation").get(function () {
  return this.location || this.hostel?.location || "N/A";
});

// for pagination
roomSchema.pre(/^find/, function (next) {
  const limit = 6;
  const page = parseInt(this.getOptions()?.page || 1); 
  const skip = (page - 1) * limit;
  this.limit(limit).skip(skip).sort({ createdAt: -1 });
  next();
});

export const Room = mongoose.model("Room", roomSchema);
