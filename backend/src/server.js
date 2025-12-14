import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import hostelRoutes from "./routes/hostel.routes.js";
import roomRoutes from "./routes/room.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { connectDb } from "./database/db.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// routes
app.use("/api/user", userRoutes);
app.use("/api/hostel", hostelRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/payment", paymentRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
  connectDb();
});
