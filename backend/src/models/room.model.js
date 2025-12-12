import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
      index: true,
    },
    number: { type: String, required: true },
    type: { type: String, enum: ["single", "double", "triple"], required: true },
    genderPreference: {
      type: String,
      enum: ["male", "female", "any"],
      default: "any",
    },
    monthlyRent: { type: Number, required: true, min: 0 },
    amenities: [{ type: String }],
    capacity: { type: Number, required: true, min: 1 },
    occupied: { type: Number, default: 0, min: 0 },
    location: { type: String, required: true },
    photos: [{ type: String }],
    isActive: { type: Boolean, default: true },
    available: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

roomSchema.pre("save", function () {
  const cap = this.capacity ?? 0;
  const occ = this.occupied ?? 0;
  this.available = this.isActive && cap > occ;

});

roomSchema.virtual("availableSpots").get(function () {
  return Math.max((this.capacity ?? 0) - (this.occupied ?? 0), 0);
});

roomSchema.virtual("availabilityStatus").get(function () {
  if (!this.isActive) return "inactive";
  return this.availableSpots > 0 ? "available" : "full";
});

export const Room = mongoose.model("Room", roomSchema);
