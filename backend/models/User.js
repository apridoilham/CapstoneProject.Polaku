import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    gender: { type: String, enum: ["Laki-laki", "Perempuan"], required: true },
    occupation: { type: String, required: true },
    purpose: { type: String, required: true },

    // --- BARU: Level Aktivitas untuk TDEE ---
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      default: "moderate",
    },

    targetCalories: { type: Number },
    likedFoods: { type: [String], default: [] },
    dislikes: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    weeklyProgress: [
      {
        week: Number,
        weightRecorded: Number,
        status: String,
        dateRecord: String,
      },
    ],
    savedMeals: [{ date: String, totalCalories: Number, meals: Array }],
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
