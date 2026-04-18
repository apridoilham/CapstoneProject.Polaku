import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Profile({ navigate }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/recommendation/${userId}`)
      .then((res) => {
        const u = res.data.user;
        setForm({
          ...u,
          allergies: u.allergies?.join(", ") || "",
          likedFoods: u.likedFoods?.join(", ") || "",
          dislikes: u.dislikes?.join(", ") || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          localStorage.clear();
          window.location.reload();
        }
      });
  }, [userId]);

  const handleSave = async () => {
    setLoading(true);

    const {
      password,
      _id,
      createdAt,
      updatedAt,
      __v,
      weeklyProgress,
      savedMeals,
      ...cleanPayload
    } = form;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/profile/${userId}`,
        cleanPayload,
      );

      alert(
        "Profil berhasil diperbarui! Target kalori akan otomatis disesuaikan.",
      );
      window.location.reload();
    } catch (err) {
      alert(
        "Gagal menyimpan profil: " + (err.response?.data?.error || err.message),
      );
    }
    setLoading(false);
  };

  if (loading || !form)
    return (
      <div className="flex justify-center h-full items-center text-white">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );

  const inp = (p, k, type = "text") => (
    <input
      type={type}
      className="input-field"
      value={form[k]}
      onChange={(e) => setForm({ ...form, [k]: e.target.value })}
      placeholder={p}
    />
  );

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="mt-4 mb-8">
        <h2 className="text-3xl font-bold text-white">Profil & Preferensi</h2>
        <p className="text-slate-400 mt-1">
          Data Anda menentukan akurasi rekomendasi AI.
        </p>
      </div>

      <div className="card p-8 space-y-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {form.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-xl">{form.name}</h3>
              <p className="text-slate-400 text-sm">{form.email}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl font-bold transition-colors"
          >
            Simpan Perubahan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="text-xs text-slate-500 font-bold uppercase block mb-2">
              Nama Lengkap
            </label>
            {inp("Nama Lengkap", "name")}
          </div>

          <div>
            <label className="text-xs text-slate-500 font-bold uppercase block mb-2">
              Umur
            </label>
            {inp("Umur", "age", "number")}
          </div>
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase block mb-2">
              Gender
            </label>
            <select
              className="input-field"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option>Laki-laki</option>
              <option>Perempuan</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-bold uppercase block mb-2">
              Berat Badan (kg)
            </label>
            {inp("Berat Badan", "weight", "number")}
          </div>
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase block mb-2">
              Tinggi Badan (cm)
            </label>
            {inp("Tinggi Badan", "height", "number")}
          </div>

          <div className="col-span-1 md:col-span-2 border-t border-slate-800 pt-6 mt-2">
            <h4 className="font-bold text-white mb-4">
              🎯 Target & Gaya Hidup
            </h4>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-bold uppercase block mb-2">
              Pekerjaan
            </label>
            {inp("Pekerjaan", "occupation")}
          </div>
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase block mb-2">
              Tujuan Diet
            </label>
            <select
              className="input-field"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            >
              <option value="lose weight">🔥 Fat Loss (Turun Berat)</option>
              <option value="gain muscle">💪 Muscle Gain (Naik Otot)</option>
              <option value="stability weight">⚖️ Maintenance (Stabil)</option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="text-xs text-slate-500 font-bold uppercase block mb-2">
              Level Aktivitas (Menentukan Target Kalori)
            </label>
            <select
              className="input-field"
              value={form.activityLevel || "moderate"}
              onChange={(e) =>
                setForm({ ...form, activityLevel: e.target.value })
              }
            >
              <option value="sedentary">🛋️ Sedentary (Jarang olahraga)</option>
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
                🏋️ Very Active (Atlet / Pekerja fisik)
              </option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-2 border-t border-slate-800 pt-6 mt-2">
            <h4 className="font-bold text-white mb-4">🍽️ Preferensi Nutrisi</h4>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="text-xs text-slate-500 font-bold uppercase block mb-2">
              Makanan Favorit (Pisahkan Koma)
            </label>
            {inp("Contoh: Ayam, Telur, Pisang", "likedFoods")}
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="text-xs text-slate-500 font-bold uppercase block mb-2">
              Pantangan / Tidak Suka (Pisahkan Koma)
            </label>
            {inp("Contoh: Pedas, Jeroan, Manis", "dislikes")}
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="text-xs text-slate-500 font-bold uppercase block mb-2">
              Alergi (Pisahkan Koma)
            </label>
            {inp("Contoh: Seafood, Kacang", "allergies")}
          </div>
        </div>
      </div>
    </div>
  );
}
