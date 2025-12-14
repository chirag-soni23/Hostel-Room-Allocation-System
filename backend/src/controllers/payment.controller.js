import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { Payment } from "../models/payment.model.js";
import { Booking } from "../models/booking.model.js";
import { Room } from "../models/room.model.js";
import dotenv from "dotenv";
dotenv.config();

/* ---------------- Razorpay ---------------- */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const isAdmin = (user) => user?.role === "admin";
const toPaise = (a) => Math.round(Number(a || 0) * 100);
const shortReceipt = (id) =>
  `bk_${String(id).slice(-8)}_${Date.now().toString().slice(-6)}`;
const inr = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

/* ---------------- Mailer ---------------- */
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
  family: 4,
  tls: { ciphers: "TLSv1.2" },
});

const FROM_NAME = process.env.MAIL_FROM_NAME || "Hostel Booking";
const FROM_EMAIL = process.env.MAIL_FROM_EMAIL || "no-reply@example.com";

const buildReceiptHtml = ({ user, booking, payment }) => {
  const checkIn = new Date(booking.checkInDate);
  const lines = [
    { label: "Hostel", value: booking.hostel?.name || "-" },
    { label: "Location", value: booking.hostel?.location || "-" },
    {
      label: "Room",
      value: `${booking.room?.number || ""} (${booking.room?.type || "-"})`,
    },
    { label: "Check-in", value: checkIn.toDateString() },
    { label: "Duration", value: `${booking.durationMonths} month(s)` },
    { label: "Monthly Rent", value: inr(booking.monthlyRentSnapshot) },
    { label: "Total", value: inr(booking.totalAmount) },
    { label: "Payment ID", value: payment.paymentId || "-" },
    { label: "Order ID", value: payment.orderId || "-" },
    { label: "Status", value: payment.status || "-" },
    {
      label: "Paid At",
      value: new Date(payment.capturedAt || payment.updatedAt).toLocaleString(
        "en-IN"
      ),
    },
  ];

  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="background:#111827;color:#fff;padding:16px 20px">
      <h2 style="margin:0;font-weight:700">Payment Receipt</h2>
      <div style="opacity:.8;font-size:13px">Thank you, ${user.firstName} ${
    user.lastName
  }</div>
    </div>
    <div style="padding:20px">
      <p style="margin:0 0 12px 0">Hi ${user.firstName},</p>
      <p style="margin:0 0 16px 0">We’ve received your payment for the booking. Here are the details:</p>
      <table style="width:100%;border-collapse:collapse">
        <tbody>
          ${lines
            .map(
              (l) => `
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#6b7280">${
                l.label
              }</td>
              <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;color:#111827;font-weight:${
                /Total/.test(l.label) ? "700" : "500"
              }">${l.value}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>

      <div style="margin-top:18px;padding:12px;border:1px dashed #e5e7eb;border-radius:8px;color:#374151;font-size:13px">
        Booking ID: <strong>${booking._id}</strong>
      </div>

      <p style="margin:18px 0 0 0;font-size:12px;color:#6b7280">
        This is an automated receipt for your records.
      </p>
    </div>
    <div style="background:#f9fafb;color:#6b7280;font-size:12px;padding:12px 20px;text-align:center">
      © ${new Date().getFullYear()} ${FROM_NAME}
    </div>
  </div>
  `;
};

const buildAdminHtml = ({ user, booking, payment }) => {
  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="background:#1f2937;color:#fff;padding:16px 20px">
      <h2 style="margin:0;font-weight:700">New Booking Paid</h2>
    </div>
    <div style="padding:20px">
      <p style="margin:0 0 10px 0">
        <strong>${user.firstName} ${
    user.lastName
  }</strong> booked the room and the payment was completed.
      </p>
      <ul style="padding-left:16px;line-height:1.6;color:#111827">
        <li>Student: ${user.firstName} ${user.lastName} (${user.email})</li>
        <li>Hostel: ${booking.hostel?.name} — ${booking.hostel?.location}</li>
        <li>Room: ${booking.room?.number} (${booking.room?.type})</li>
        <li>Check-in: ${new Date(booking.checkInDate).toDateString()}</li>
        <li>Duration: ${booking.durationMonths} months</li>
        <li>Total: ${inr(booking.totalAmount)}</li>
        <li>Payment: ${payment.paymentId || "-"} for order ${
    payment.orderId
  }</li>
        <li>Status: ${payment.status}</li>
      </ul>
      <div style="margin-top:10px;font-size:12px;color:#6b7280">
        Booking ID: ${booking._id}
      </div>
    </div>
  </div>
  `;
};

const sendReceiptEmail = async ({ to, user, booking, payment }) => {
  const html = buildReceiptHtml({ user, booking, payment });
  await mailer.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    bcc: FROM_EMAIL,
    subject: `Payment Receipt • ${booking.hostel?.name || "Hostel"} • ${inr(
      booking.totalAmount
    )}`,
    html,
  });
};

const sendAdminEmail = async ({ user, booking, payment }) => {
  const html = buildAdminHtml({ user, booking, payment });
  await mailer.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: FROM_EMAIL,
    subject: `New Booking Paid • ${user.firstName} ${user.lastName} • ${inr(
      booking.totalAmount
    )}`,
    html,
  });
};

// create payment order
export const createPaymentOrder = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res
        .status(500)
        .json({ success: false, message: "Razorpay keys not configured" });
    }
    const { bookingId } = req.body;
    if (!bookingId || !mongoose.isValidObjectId(bookingId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid bookingId is required" });
    }

    const booking = await Booking.findById(bookingId)
      .populate("room", "monthlyRent capacity occupied isActive")
      .populate("hostel", "name");

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (!isAdmin(req.user) && String(booking.user) !== String(req.user?.id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Booking is not pending" });
    }

    const totalAmount = Number(booking.totalAmount);
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking amount" });
    }

    const amountPaise = toPaise(totalAmount);
    if (!Number.isInteger(amountPaise) || amountPaise < 100) {
      return res.status(400).json({
        success: false,
        message: "Amount must be ≥ ₹1 and integer paise",
      });
    }

    let order;
    try {
      order = await razorpay.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: shortReceipt(booking._id),
        notes: { bookingId: booking._id.toString(), userId: req.user.id },
      });
    } catch (e) {
      const msg =
        e?.error?.description ||
        e?.message ||
        "Failed to create Razorpay order";
      return res.status(502).json({ success: false, message: msg });
    }

    const payment = await Payment.create({
      provider: "razorpay",
      orderId: order.id,
      amount: totalAmount,
      currency: "INR",
      status: "created",
      notes: order.notes,
    });

    booking.payment = payment._id;
    await booking.save();

    return res.status(201).json({
      success: true,
      data: {
        key: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        bookingId: booking._id,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// verfiy payment
export const verifyPayment = async (req, res) => {
  try {
    const razorpay_order_id = String(req.body.razorpay_order_id || "").trim();
    const razorpay_payment_id = String(
      req.body.razorpay_payment_id || ""
    ).trim();
    const razorpay_signature = String(req.body.razorpay_signature || "").trim();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment details" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "paid",
        capturedAt: new Date(),
      },
      { new: true }
    );
    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found" });

    let booking = await Booking.findOneAndUpdate(
      { payment: payment._id },
      { status: "confirmed" },
      { new: true }
    );

    if (!booking) {
      const bookingIdFromNotes =
        payment?.notes?.get?.("bookingId") || payment?.notes?.bookingId || null;

      if (bookingIdFromNotes && mongoose.isValidObjectId(bookingIdFromNotes)) {
        booking = await Booking.findByIdAndUpdate(
          bookingIdFromNotes,
          { status: "confirmed", payment: payment._id },
          { new: true }
        );
      }
    }
    if (!booking)
      return res.status(404).json({
        success: false,
        message: "Related booking not found to confirm",
      });

    const activeCount = await Booking.countDocuments({
      room: booking.room,
      status: { $in: ["pending", "confirmed"] },
    });

    const roomDoc = await Room.findById(booking.room).select(
      "capacity isActive"
    );
    if (roomDoc) {
      const available = Boolean(
        roomDoc.isActive && (roomDoc.capacity ?? 0) > activeCount
      );
      await Room.findByIdAndUpdate(booking.room, {
        occupied: activeCount,
        available,
      });
    } else {
      await Room.findByIdAndUpdate(booking.room, { occupied: activeCount });
    }

    const hydrated = await Booking.findById(booking._id)
      .populate("user", "firstName lastName email")
      .populate(
        "room",
        "number type genderPreference monthlyRent capacity occupied available"
      )
      .populate("hostel", "name location")
      .lean();

    try {
      if (hydrated?.user?.email) {
        await sendReceiptEmail({
          to: hydrated.user.email, // user gets receipt
          user: hydrated.user,
          booking: hydrated,
          payment,
        });
      }
      // Always notify admin/from mailbox
      await sendAdminEmail({
        user: hydrated.user,
        booking: hydrated,
        payment,
      });
    } catch (e) {
      console.error("Email send error:", e?.message);
    }

    return res.json({ success: true, data: { payment, booking: hydrated } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// get my payments
export const getMyPayments = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("payment")
      .populate("hostel", "name location")
      .populate("room", "number type")
      .sort({ createdAt: -1 })
      .lean();

    const list = bookings
      .filter((b) => b.payment)
      .map((b) => ({
        bookingId: b._id,
        hostel: b.hostel,
        room: b.room,
        status: b.payment.status,
        amount: b.payment.amount,
        paymentId: b.payment.paymentId,
        orderId: b.payment.orderId,
        createdAt: b.payment.createdAt,
      }));

    return res.json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// list payments
export const listPayments = async (req, res) => {
  try {
    if (!isAdmin(req.user))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return res.json({ success: true, data: payments });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------------- Dev helper ---------------- */
export const generateSignatureDev = async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res
        .status(403)
        .json({ success: false, message: "Not allowed in production" });
    }

    let { razorpay_order_id, razorpay_payment_id } = req.body;
    if (!razorpay_order_id) {
      return res
        .status(400)
        .json({ success: false, message: "razorpay_order_id is required" });
    }

    if (!razorpay_payment_id) {
      const randomStr = Math.random().toString(36).substring(2, 10);
      razorpay_payment_id = `pay_${randomStr}`;
    }

    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    return res.json({
      success: true,
      data: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature: signature,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
