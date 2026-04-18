import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "apridosecret2026";

const calculateTDEE = (user) => {
  let bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age;
  bmr += user.gender === "Laki-laki" ? 5 : -161;
  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const tdee = bmr * (activityFactors[user.activityLevel] || 1.55);
  let target = tdee;
  if (user.purpose.includes("lose")) target -= 500;
  if (user.purpose.includes("gain")) target += 300;
  return Math.round(target);
};

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      weight,
      height,
      gender,
      occupation,
      purpose,
      activityLevel,
      likedFoods,
      dislikes,
      allergies,
    } = req.body;

    // FITUR BARU: Tangkap tanggal hari ini saat Register untuk Minggu #1
    const todayDate = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const user = new User({
      name,
      email,
      password,
      age,
      weight,
      height,
      gender,
      occupation: occupation || "Tidak disetel",
      purpose,
      activityLevel: activityLevel || "moderate",
      likedFoods: likedFoods ? likedFoods.split(",").map((s) => s.trim()) : [],
      dislikes: dislikes ? dislikes.split(",").map((s) => s.trim()) : [],
      allergies: allergies ? allergies.split(",").map((s) => s.trim()) : [],
      weeklyProgress: [
        {
          week: 1,
          weightRecorded: weight,
          status: "Started",
          dateRecord: todayDate,
        },
      ], // <-- Perbaikan di sini
    });

    user.targetCalories = calculateTDEE(user);
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Password salah" });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/profile/:id", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      weight,
      height,
      gender,
      occupation,
      purpose,
      activityLevel,
      likedFoods,
      dislikes,
      allergies,
    } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    user.name = name || user.name;
    user.email = email || user.email;
    if (password && password.trim() !== "") user.password = password;
    user.age = age || user.age;
    user.weight = weight || user.weight;
    user.height = height || user.height;
    user.gender = gender || user.gender;
    user.occupation = occupation || user.occupation;
    user.purpose = purpose || user.purpose;
    user.activityLevel = activityLevel || user.activityLevel;

    user.targetCalories = calculateTDEE(user);

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
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
