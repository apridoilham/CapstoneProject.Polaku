import React, { useState } from "react";
import axios from "axios";

export default function Register({ navigate }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    weight: "",
    height: "",
    gender: "Laki-laki", // Default value
    occupation: "",
    purpose: "lose weight",
    activityLevel: "moderate",
    likedFoods: "",
    dislikes: "",
    allergies: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/register",
        form,
      );
      localStorage.setItem("userId", res.data.user._id);
      window.location.reload(); // Otomatis masuk ke dashboard setelah register
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
      setIsLoading(false);
    }
  };

  const inp = (label, placeholder, key, type = "text") => (
    <div>
      <label className="text-xs text-slate-400 font-bold mb-2 block uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        className="input-field"
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 py-12">
      <div className="w-full max-w-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Buat Akun PolaKu 🚀
          </h1>
          <p className="text-slate-400">
            Lengkapi data fisik Anda agar AI bisa menghitung nutrisi dengan
            akurat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="col-span-1 md:col-span-2 border-b border-slate-800 pb-2">
            <h3 className="text-lg font-bold text-white">1. Akun & Keamanan</h3>
          </div>
          {inp("Nama Lengkap", "Masukkan nama", "name")}
          {inp("Email", "alamat@email.com", "email", "email")}
          {inp("Password", "Minimal 6 karakter", "password", "password")}
          {inp(
            "Pekerjaan",
            "Contoh: Mahasiswa, Karyawan",
            "occupation",
            "text",
          )}

          <div className="col-span-1 md:col-span-2 border-b border-slate-800 pb-2 mt-4">
            <h3 className="text-lg font-bold text-white">
              2. Metrik Tubuh (Wajib Akurat)
            </h3>
          </div>

          {/* FITUR BARU: DROPDOWN JENIS KELAMIN */}
          <div>
            <label className="text-xs text-slate-400 font-bold mb-2 block uppercase tracking-wider">
              Jenis Kelamin
            </label>
            <select
              className="input-field"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="Laki-laki">👨 Laki-laki</option>
              <option value="Perempuan">👩 Perempuan</option>
            </select>
          </div>
          {inp("Umur (Tahun)", "Contoh: 24", "age", "number")}
          {inp("Berat Badan (KG)", "Contoh: 70", "weight", "number")}
          {inp("Tinggi Badan (CM)", "Contoh: 175", "height", "number")}

          <div className="col-span-1 md:col-span-2 border-b border-slate-800 pb-2 mt-4">
            <h3 className="text-lg font-bold text-white">
              3. Gaya Hidup & Target
            </h3>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="text-xs text-slate-400 font-bold mb-3 block uppercase tracking-wider">
              Tujuan Utama Diet
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {["lose weight", "stability weight", "gain muscle"].map((val) => (
                <button
                  key={val}
                  onClick={() => setForm({ ...form, purpose: val })}
                  className={`p-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                    form.purpose === val
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 transform scale-[1.02]"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-700"
                  }`}
                >
                  <span className="text-xl">
                    {val === "lose weight"
                      ? "🔥"
                      : val === "stability weight"
                        ? "⚖️"
                        : "💪"}
                  </span>
                  {val === "lose weight"
                    ? "Turun BB"
                    : val === "stability weight"
                      ? "Stabil"
                      : "Naik Otot"}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="text-xs text-slate-400 font-bold mb-2 block uppercase tracking-wider">
              Level Aktivitas Harian (Menentukan Target Kalori)
            </label>
            <select
              className="input-field"
              value={form.activityLevel}
              onChange={(e) =>
                setForm({ ...form, activityLevel: e.target.value })
              }
            >
              <option value="sedentary">
                🛋️ Sedentary (Jarang olahraga / Kerja kantor)
              </option>
              <option value="light">
                🚶 Light (Olahraga ringan 1-3x/minggu)
              </option>
              <option value="moderate">
                🏃 Moderate (Olahraga sedang 3-5x/minggu)
              </option>
              <option value="active">
                💪 Active (Olahraga berat 6-7x/minggu)
              </option>
              <option value="very_active">
                🏋️ Very Active (Atlet / Kerja fisik berat)
              </option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-2 border-b border-slate-800 pb-2 mt-4">
            <h3 className="text-lg font-bold text-white">
              4. Preferensi Makanan (Opsional)
            </h3>
          </div>

          <div className="col-span-1 md:col-span-2">
            {inp(
              "Makanan Disukai (Pisahkan dengan koma)",
              "Contoh: Ayam, Telur, Sapi",
              "likedFoods",
            )}
          </div>
          {inp("Makanan Tidak Disukai", "Contoh: Pedas, Manis", "dislikes")}
          {inp("Alergi", "Contoh: Kacang, Seafood", "allergies")}
        </div>

        <button
          onClick={handleRegister}
          disabled={isLoading}
          className="btn-primary w-full text-lg py-4 mt-4"
        >
          {isLoading ? "Menyiapkan Akun..." : "🚀 Mulai Diet Cerdas"}
        </button>

        <p className="text-center mt-6 text-slate-500 text-sm">
          Sudah punya akun?{" "}
          <span
            onClick={() => navigate("login")}
            className="text-blue-500 cursor-pointer hover:underline font-bold"
          >
            Masuk di sini
          </span>
        </p>
      </div>
    </div>
  );
}
