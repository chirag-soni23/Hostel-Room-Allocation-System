import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    photo: { type: String },
    location: { type: String, required: true },
    amenities: [{ type: String }],
    rules: [{ type: String }],
    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    ],
  },
  { timestamps: true }
); 

export const Hostel = mongoose.model("Hostel", hostelSchema);
