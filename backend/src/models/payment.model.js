import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ["razorpay"], default: "razorpay" },
    orderId: { type: String, required: true, index: true, unique: true },
    paymentId: { type: String },
    signature: { type: String },
    method: { type: String },
    currency: { type: String, default: "INR" },
    amount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["created", "paid", "failed", "refunded"], default: "created" },
    refundedAmount: { type: Number, default: 0 },
    capturedAt: { type: Date },
    notes: { type: Map, of: String },
  },
  { timestamps: true } // <-- Yahin rakho; `_id: false` bilkul nahi
);

export const Payment = mongoose.model("Payment", paymentSchema);
