import express from "express";
import axios from "axios";
import User from "../models/User.js";
import { getChatbotResponse } from "../services/groqService.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/generate/:userId", async (req, res) => {
  try {
    const { weight, height, purpose, likedFoods, dislikes, allergies } =
      req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (weight) user.weight = weight;
    if (height) user.height = height;
    if (purpose) user.purpose = purpose;

    let bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age;
    bmr += user.gender === "Laki-laki" ? 5 : -161;
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    let target = bmr * (activityFactors[user.activityLevel] || 1.55);
    if (user.purpose.includes("lose")) target -= 500;
    if (user.purpose.includes("gain")) target += 300;
    user.targetCalories = Math.round(target);

    if (likedFoods !== undefined)
      user.likedFoods = likedFoods
        ? likedFoods.split(",").map((s) => s.trim())
        : [];
    if (dislikes !== undefined)
      user.dislikes = dislikes ? dislikes.split(",").map((s) => s.trim()) : [];
    if (allergies !== undefined)
      user.allergies = allergies
        ? allergies.split(",").map((s) => s.trim())
        : [];

    await user.save();

    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    const aiPayload = {
      age: user.age,
      weight: user.weight,
      height: user.height,
      purpose: user.purpose,
      target_calories: user.targetCalories,
      liked_foods: user.likedFoods.join(","),
      disliked_foods: user.dislikes.join(","),
      allergies: user.allergies.join(","),
    };

    const aiResponse = await axios.post(`${fastApiUrl}/predict`, aiPayload);
    res.json({ user, recommendations: aiResponse.data });
  } catch (err) {
    console.error("❌ FastAPI Error:", err.message);
    res
      .status(500)
      .json({
        error:
          "Gagal menghubungi mesin AI (FastAPI). Pastikan server Python menyala.",
      });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    const reply = await getChatbotResponse(message, history);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIKA PROGRESS UPDATE & TERLEWAT
router.post("/checkin/:userId", async (req, res) => {
  try {
    const { weight, dateRecord } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Hitung minggu ke berapa secara real-time berdasarkan tanggal pembuatan akun
    const startDate = new Date(user.createdAt || Date.now());
    const now = new Date();
    const diffTime = Math.abs(now - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const currentWeek = Math.floor(diffDays / 7) + 1;

    if (!user.weeklyProgress) user.weeklyProgress = [];
    const existingWeekIndex = user.weeklyProgress.findIndex(
      (p) => p.week === currentWeek,
    );

    if (existingWeekIndex !== -1) {
      // Jika minggu ini sudah diinput, maka UPDATE (Edit) datanya
      user.weeklyProgress[existingWeekIndex].weightRecorded = weight;
      user.weeklyProgress[existingWeekIndex].dateRecord = dateRecord;
      if (existingWeekIndex > 0) {
        const lastWeight =
          user.weeklyProgress[existingWeekIndex - 1].weightRecorded;
        let status = "Stable";
        if (weight < lastWeight) status = "Lost Weight";
        if (weight > lastWeight) status = "Gained Weight";
        user.weeklyProgress[existingWeekIndex].status = status;
      }
    } else {
      let lastEntry = user.weeklyProgress[user.weeklyProgress.length - 1];
      let lastWeek = lastEntry ? lastEntry.week : 0;
      let lastWeight = lastEntry ? lastEntry.weightRecorded : user.weight;

      // Jika user skip/bolos mengisi progress di minggu-minggu sebelumnya
      if (currentWeek > lastWeek + 1 && lastWeek !== 0) {
        for (let w = lastWeek + 1; w < currentWeek; w++) {
          user.weeklyProgress.push({
            week: w,
            weightRecorded: lastWeight,
            status: "Tidak Input",
            dateRecord: "Terlewat",
          });
        }
      }

      // Input baru untuk minggu ini
      let status = "Stable";
      if (weight < lastWeight) status = "Lost Weight";
      if (weight > lastWeight) status = "Gained Weight";
      if (lastWeek === 0) status = "Started";

      user.weeklyProgress.push({
        week: currentWeek,
        weightRecorded: weight,
        status: status,
        dateRecord: dateRecord,
      });
    }

    user.weight = weight;
    // Mengupdate ulang Target Kalori (TDEE) jika berat badan berubah
    let bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age;
    bmr += user.gender === "Laki-laki" ? 5 : -161;
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    let target = bmr * (activityFactors[user.activityLevel] || 1.55);
    if (user.purpose.includes("lose")) target -= 500;
    if (user.purpose.includes("gain")) target += 300;
    user.targetCalories = Math.round(target);

    await user.save();
    res.json(user.weeklyProgress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/save-meal/:userId", async (req, res) => {
  try {
    const { date, totalCalories, meals } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingIndex = user.savedMeals.findIndex((m) => m.date === date);
    if (existingIndex !== -1) {
      user.savedMeals[existingIndex].meals = meals;
      user.savedMeals[existingIndex].totalCalories = totalCalories;
    } else {
      user.savedMeals.push({ date, totalCalories, meals });
    }
    await user.save();
    res.json(user.savedMeals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete-meal/:userId/:date", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.savedMeals = user.savedMeals.filter((m) => m.date !== req.params.date);
    await user.save();
    res.json(user.savedMeals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
