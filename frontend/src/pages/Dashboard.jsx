import React, { useState, useEffect } from "react";
import axios from "axios";
import Chatbot from "../components/Chatbot";

export default function Dashboard({ navigate }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/recommendation/${userId}`)
      .then((res) => {
        setData(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          localStorage.clear();
          window.location.reload();
        } else {
          setIsLoading(false);
        }
      });
  }, [userId]);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const heightInMeter = data.user.height / 100;
  const bmi = (data.user.weight / (heightInMeter * heightInMeter)).toFixed(1);
  let bmiStatus = "Normal";
  let bmiColor = "text-emerald-400";

  if (bmi < 18.5) {
    bmiStatus = "Underweight";
    bmiColor = "text-blue-400";
  } else if (bmi >= 25 && bmi < 30) {
    bmiStatus = "Overweight";
    bmiColor = "text-orange-400";
  } else if (bmi >= 30) {
    bmiStatus = "Obese";
    bmiColor = "text-red-500";
  }

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Chatbot />

      <div className="bg-slate-900/80 backdrop-blur-md p-6 sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Halo, {data.user.name.split(" ")[0]}! 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1">{today}</p>
          </div>
          <button
            onClick={() => navigate("recommendations")}
            className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 w-full md:w-auto"
          >
            ⚗️ Rancang Menu Hari Ini
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 border-t-4 border-t-blue-500 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-7xl opacity-5 group-hover:scale-110 transition-transform">
              🔥
            </div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              Target Kalori Harian
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tight">
                {Math.round(data.user.targetCalories)}
              </span>
              <span className="text-blue-400 font-bold mb-1">kcal</span>
            </div>
            <p className="text-sm text-slate-500 mt-3 font-medium">
              Goal:{" "}
              <span className="text-slate-300 capitalize">
                {data.user.purpose.replace("_", " ")}
              </span>
            </p>
          </div>

          <div
            className={`card p-6 border-t-4 border-t-${bmiColor.split("-")[1]}-500 relative overflow-hidden group`}
          >
            <div className="absolute -right-6 -top-6 text-7xl opacity-5 group-hover:scale-110 transition-transform">
              ⚖️
            </div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              Indeks Massa Tubuh (BMI)
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tight">
                {bmi}
              </span>
              <span className={`font-bold mb-1 ${bmiColor}`}>{bmiStatus}</span>
            </div>
            <p className="text-sm text-slate-500 mt-3 font-medium">
              Berat: {data.user.weight}kg | Tinggi: {data.user.height}cm
            </p>
          </div>

          <div className="card p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-none flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay"></div>
            <div className="text-4xl mb-3">📈</div>
            <h3 className="font-bold text-white mb-3 text-lg">
              Pantau Perkembangan
            </h3>
            <button
              onClick={() => navigate("progress")}
              className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors w-full z-10"
            >
              Catat Berat Badan
            </button>
          </div>
        </div>

        <div className="card p-8 bg-blue-900/10 border border-blue-500/20">
          <h2 className="text-xl font-bold text-blue-400 mb-5 flex items-center gap-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            Tips Diet Cerdas Polaku
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4 items-start">
              <div className="bg-slate-800 p-3 rounded-xl text-xl">🥗</div>
              <div>
                <h4 className="font-bold text-slate-200 mb-1">
                  Gunakan Ruang Kerja AI
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Masuk ke menu <b className="text-blue-400">Rekomendasi</b>{" "}
                  untuk meminta AI menyusunkan kandidat makanan terbaik
                  berdasarkan profil Anda hari ini.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-slate-800 p-3 rounded-xl text-xl">⚙️</div>
              <div>
                <h4 className="font-bold text-slate-200 mb-1">
                  Perbarui Preferensi
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Bosan dengan menu yang itu-itu saja? Perbarui Makanan Favorit
                  di menu <b className="text-blue-400">Profil</b> agar AI
                  memberikan opsi baru.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
