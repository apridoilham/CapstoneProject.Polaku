import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Recommendations({ navigate }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [userMenu, setUserMenu] = useState([null, null, null]);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    axios
      .get(`http://localhost:5001/api/recommendation/${userId}`)
      .then((res) => {
        setUserData(res.data.user);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          localStorage.clear();
          window.location.reload();
        }
      });

    const loadedMenu = localStorage.getItem("loadedMenu");
    if (loadedMenu) {
      try {
        setUserMenu(JSON.parse(loadedMenu));
        localStorage.removeItem("loadedMenu");
      } catch (e) {
        console.error(e);
      }
    }
  }, [userId]);

  const handleGenerateAI = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:5001/api/recommendation/generate/${userId}`,
        { mealType: "all", currentMeals: [] },
      );
      setAiRecommendations(res.data.recommendations || []);
    } catch (err) {
      alert("Gagal generate rekomendasi. Pastikan backend AI berjalan.");
    }
    setLoading(false);
  };

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData("foodItem", JSON.stringify(item));
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, slotIndex) => {
    e.preventDefault();
    const foodData = e.dataTransfer.getData("foodItem");
    if (foodData) {
      const food = JSON.parse(foodData);
      const newMenu = [...userMenu];
      newMenu[slotIndex] = food;
      setUserMenu(newMenu);
    }
  };

  const removeFood = (slotIndex) => {
    const newMenu = [...userMenu];
    newMenu[slotIndex] = null;
    setUserMenu(newMenu);
  };

  const handleSaveMenu = async () => {
    const filledMeals = userMenu.filter((m) => m !== null);
    if (filledMeals.length === 0)
      return alert("Pilih minimal 1 menu untuk disimpan!");

    const dateStr = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    try {
      await axios.post(
        `http://localhost:5001/api/recommendation/save-meal/${userId}`,
        {
          date: dateStr,
          totalCalories: totalCalories,
          meals: filledMeals,
        },
      );
      alert("Menu berhasil disimpan ke Riwayat!");
      navigate("history");
    } catch (err) {
      alert("Gagal menyimpan menu.");
    }
  };

  const totalCalories = userMenu.reduce(
    (acc, curr) => acc + (curr?.calories || 0),
    0,
  );
  const target = userData ? Math.round(userData.targetCalories) : 0;
  const isOverCalorie = totalCalories > target;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg mt-4">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-white">Rancang Menu AI ⚗️</h1>
          <p className="text-slate-400 text-sm mt-1">
            Tarik (Drag) pilihan dari AI ke slot menu harianmu.
          </p>
        </div>
        <button
          onClick={handleGenerateAI}
          disabled={loading}
          className="btn-primary w-full md:w-auto flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            "🤖 Generate Rekomendasi AI"
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* PANEL KIRI: POOL AI */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card p-5 bg-slate-800/30 border-slate-700/50 sticky top-4">
            <h3 className="text-base font-bold text-emerald-400 mb-1 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                ></path>
              </svg>
              Katalog AI
            </h3>
            <p className="text-xs text-slate-400 mb-4 pb-4 border-b border-slate-700/50">
              Pilihan terbaik berdasarkan {target} kcal.
            </p>

            <div className="h-[60vh] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {aiRecommendations.length === 0 && (
                <div className="text-center text-slate-500 py-10 flex flex-col items-center">
                  <span className="text-4xl mb-3 opacity-50">🍽️</span>
                  <p className="text-sm">
                    Katalog kosong. Klik Generate untuk memulai.
                  </p>
                </div>
              )}
              {aiRecommendations.map((food, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => handleDragStart(e, food)}
                  className="bg-slate-800 p-3 rounded-xl border border-slate-700 cursor-grab hover:border-blue-500 hover:shadow-lg transition-all flex items-center gap-3 active:cursor-grabbing group"
                >
                  <div className="w-12 h-12 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0">
                    {food.image ? (
                      <img
                        src={food.image}
                        className="w-full h-full object-cover"
                        alt={food.food}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        🍲
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-200 truncate group-hover:text-white transition-colors">
                      {food.food || food.name}
                    </h4>
                    <p className="text-xs text-emerald-400 font-bold">
                      {Math.round(food.calories)} kcal
                    </p>
                  </div>
                  <div className="text-slate-600 group-hover:text-blue-500 transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      ></path>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL KANAN: WORKSPACE */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center card p-5 bg-slate-800/30 border-slate-700/50">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-lg font-bold text-white mb-1">
                📅 Susunan Menu Harian
              </h3>
              <div className="text-sm bg-slate-900 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 border border-slate-700">
                <span className="text-slate-400">Total:</span>
                <span
                  className={`font-black ${isOverCalorie ? "text-red-400" : "text-emerald-400"}`}
                >
                  {Math.round(totalCalories)}
                </span>
                <span className="text-slate-500">/ {target} kcal</span>
              </div>
            </div>
            <button
              onClick={handleSaveMenu}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm w-full sm:w-auto"
            >
              💾 Simpan ke Riwayat
            </button>
          </div>

          <div className="space-y-4">
            {["Sarapan Pagi", "Makan Siang", "Makan Malam"].map((name, idx) => (
              <div
                key={idx}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
                className={`bg-slate-800/50 rounded-2xl border-2 border-dashed transition-all duration-300 ${
                  userMenu[idx]
                    ? "border-emerald-500/30 bg-emerald-900/5"
                    : "border-slate-700 hover:border-slate-500"
                }`}
              >
                <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {name}
                  </h4>
                  {userMenu[idx] && (
                    <button
                      onClick={() => removeFood(idx)}
                      className="text-[11px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider px-3 py-1 bg-red-500/10 rounded-lg transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <div className="p-6">
                  {userMenu[idx] ? (
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <div className="w-32 h-32 bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 border border-slate-700">
                        {userMenu[idx].image ? (
                          <img
                            src={userMenu[idx].image}
                            className="w-full h-full object-cover"
                            alt={userMenu[idx].food}
                          />
                        ) : (
                          <div className="text-4xl flex items-center justify-center h-full">
                            🍲
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h5 className="text-xl font-bold text-white mb-2">
                          {userMenu[idx].food || userMenu[idx].name}
                        </h5>
                        <p className="text-emerald-400 font-black text-2xl mb-4">
                          {Math.round(userMenu[idx].calories)}{" "}
                          <span className="text-sm font-medium text-emerald-400/70">
                            kcal
                          </span>
                        </p>
                        {/* KODE DI BAWAH INI YANG DIPERBAIKI (CSS CONFLICT) */}
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-xs font-bold text-slate-300">
                          <span className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
                            <span className="text-slate-500 mr-1">PROT</span>
                            {userMenu[idx].protein}g
                          </span>
                          <span className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
                            <span className="text-slate-500 mr-1">FAT</span>
                            {userMenu[idx].fat}g
                          </span>
                          <span className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
                            <span className="text-slate-500 mr-1">CARB</span>
                            {userMenu[idx].carbs}g
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-500">
                      <span className="text-3xl mb-3 opacity-40">📥</span>
                      <p className="text-sm font-medium">
                        Tarik makanan ke area ini
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
