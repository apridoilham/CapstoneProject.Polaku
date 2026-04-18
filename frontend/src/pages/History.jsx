import React, { useState, useEffect } from "react";
import axios from "axios";

export default function History({ navigate }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/recommendation/${userId}`)
      .then((res) => {
        setHistory(res.data.user.savedMeals || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          localStorage.clear();
          window.location.reload();
        }
      });
  }, [userId]);

  const handleLoad = (meals) => {
    localStorage.setItem("loadedMenu", JSON.stringify(meals));
    navigate("recommendations");
  };

  const handleDelete = async (date) => {
    if (!window.confirm("Hapus menu ini?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/recommendation/delete-meal/${userId}/${date}`,
      );
      setHistory(history.filter((h) => h.date !== date));
    } catch (err) {
      alert("Gagal menghapus data");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center h-full items-center text-white">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="mt-4 mb-8">
        <h2 className="text-3xl font-bold text-white">Riwayat Menu</h2>
        <p className="text-slate-400 mt-1">
          Daftar menu sehat yang pernah Anda buat dan simpan.
        </p>
      </div>

      <div className="space-y-4">
        {history.length === 0 && (
          <div className="card p-12 text-center text-slate-500 border-dashed border-2 bg-transparent">
            <span className="text-5xl opacity-50 block mb-4">📓</span>
            Belum ada riwayat tersimpan. Susun dan simpan menu dari halaman
            Rekomendasi!
          </div>
        )}
        {history
          .slice()
          .reverse()
          .map((h, i) => (
            <div
              key={i}
              className="card p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-blue-500/30 transition-all"
            >
              <div>
                <p className="font-bold text-white text-lg flex items-center gap-2">
                  <span className="text-blue-500">📅</span> {h.date}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {h.meals.length} Menu •{" "}
                  <span className="text-emerald-400 font-bold">
                    {Math.round(h.totalCalories)} Kcal
                  </span>
                </p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {h.meals.map((meal, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-800 text-xs px-3 py-1.5 rounded-lg text-slate-300 font-medium"
                    >
                      {meal.name || meal.food}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(h.date)}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
                >
                  Hapus
                </button>
                <button
                  onClick={() => handleLoad(h.meals)}
                  className="bg-blue-600/20 border border-blue-500/30 text-blue-400 px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-all"
                >
                  Load Menu
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
