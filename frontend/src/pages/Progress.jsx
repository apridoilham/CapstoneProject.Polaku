import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Progress({ navigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [weightInput, setWeightInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = localStorage.getItem("userId");

  const fetchData = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/recommendation/${userId}`)
      .then((res) => {
        setData(res.data);
        setWeightInput(res.data.user.weight);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          localStorage.clear();
          window.location.reload();
        }
      });
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!weightInput || weightInput <= 0)
      return alert("Masukkan berat yang valid!");

    setIsSubmitting(true);
    const dateStr = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/recommendation/checkin/${userId}`,
        {
          weight: parseFloat(weightInput),
          dateRecord: dateStr,
        },
      );
      alert("Progress berhasil diperbarui!");
      fetchData();
    } catch (err) {
      alert("Gagal mencatat progress.");
    }
    setIsSubmitting(false);
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center h-full items-center text-white">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const list = data.user.weeklyProgress || [];
  const week =
    Math.floor(
      (Date.now() - new Date(data.user.createdAt || Date.now())) /
        (1000 * 60 * 60 * 24 * 7),
    ) + 1;

  const hasCheckedInThisWeek = list.some(
    (item) => item.week === week && item.status !== "Tidak Input",
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Progress Mingguan</h2>
          <p className="text-slate-400 mt-1">
            Pantau fluktuasi berat badanmu menuju target.
          </p>
        </div>
        <span className="bg-blue-600/20 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-xl text-sm font-bold mt-4 md:mt-0">
          Saat ini: Minggu Ke-{week}
        </span>
      </div>

      <div className="card p-6 bg-gradient-to-r from-slate-900 to-slate-800 border-l-4 border-l-emerald-500">
        <h3 className="font-bold text-white mb-4">
          Timbang Berat Badan Hari Ini
        </h3>
        <form
          onSubmit={handleCheckIn}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="input-field pl-4 pr-12"
              placeholder="Contoh: 65.5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
              KG
            </span>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${hasCheckedInThisWeek ? "bg-blue-600 hover:bg-blue-500" : "bg-emerald-600 hover:bg-emerald-500"} text-white font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50`}
          >
            {isSubmitting
              ? "Menyimpan..."
              : hasCheckedInThisWeek
                ? "Update Data Minggu Ini"
                : "Catat Progress"}
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-5 font-bold">Minggu</th>
                <th className="p-5 font-bold">Tanggal</th>
                <th className="p-5 font-bold">Berat</th>
                <th className="p-5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {list.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-500">
                    Belum ada data progress yang dicatat.
                  </td>
                </tr>
              ) : (
                list
                  .slice()
                  .reverse()
                  .map((item, i) => {
                    let displayDate = item.dateRecord;
                    if (!displayDate && item.week === 1) {
                      displayDate = new Date(
                        data.user.createdAt,
                      ).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    }

                    return (
                      <tr
                        key={i}
                        className={`transition-colors group ${item.status === "Tidak Input" ? "bg-red-900/10" : "hover:bg-slate-800/40"}`}
                      >
                        <td className="p-5 font-black text-blue-400">
                          #{item.week}
                        </td>
                        <td
                          className={`p-5 font-medium ${item.status === "Tidak Input" ? "text-red-400 italic" : "text-slate-300"}`}
                        >
                          {displayDate || "-"}
                        </td>
                        <td className="p-5 font-black text-white text-lg">
                          {item.weightRecorded}{" "}
                          <span className="text-sm font-medium text-slate-500">
                            kg
                          </span>
                        </td>
                        <td className="p-5">
                          <span
                            className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${
                              item.status.includes("Lost")
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : item.status.includes("Gained")
                                  ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                  : item.status === "Tidak Input"
                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                    : "bg-slate-700/50 text-slate-300 border-slate-600"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
