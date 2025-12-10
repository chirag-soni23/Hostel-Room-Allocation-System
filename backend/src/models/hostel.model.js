import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    photo:{type:String},
    location: { type: String, required: true },
    amenities: [{ type: String }],
    rules: [{ type: String }]
  },
  { timestamps: true }
);

export const Hostel = mongoose.model("Hostel", hostelSchema);
