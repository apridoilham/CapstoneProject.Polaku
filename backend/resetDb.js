import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

// Load konfigurasi dari .env
dotenv.config();

const resetDatabase = async () => {
  try {
    console.log("⏳ Sedang menyambungkan ke MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Terhubung ke Database!");

    // ==========================================
    // PROSES MIGRATE: FRESH (Hapus Semua Koleksi)
    // ==========================================
    console.log("🧹 Sedang membersihkan data lama...");

    // Menghapus semua data dari collection 'users'
    await User.deleteMany({});

    console.log(
      "✨ DATABASE FRESH! Semua data berhasil direset ke kondisi awal.",
    );

    // Tutup koneksi agar terminal tidak nge-hang
    mongoose.connection.close();
    console.log("🔌 Koneksi diputus. Selesai.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Gagal mereset database:", error);
    process.exit(1);
  }
};

// Jalankan fungsinya
resetDatabase();
