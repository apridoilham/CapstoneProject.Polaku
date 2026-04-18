import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// Konfigurasi CORS Sapu Jagat (Menerima semua akses masuk)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

// Middleware parsing JSON
app.use(express.json());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes Utama API
app.use("/api/auth", authRoutes);
app.use("/api/recommendation", recommendationRoutes);

// Route Default (Pesan selamat datang saat link Render dibuka)
app.get("/", (req, res) => {
  res.send("🚀 Dapur Backend Smart Diet Aktif dan Siap Menerima Pesanan!");
});

// Port & Server Start
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
