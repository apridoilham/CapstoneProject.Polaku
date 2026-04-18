import React, { useState } from "react";
import axios from "axios";

export default function Login({ navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password },
      );
      localStorage.setItem("userId", data.user._id);
      window.location.reload();
    } catch (err) {
      alert("Login Gagal: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Masuk ke PolaKu
          </h1>
          <p className="text-slate-500">Atur diet cerdas Anda hari ini</p>
        </div>
        <div className="space-y-4">
          <input
            className="input-field"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary w-full mt-4"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </div>
        <p className="text-center mt-6 text-slate-500 text-sm">
          Belum punya akun?{" "}
          <span
            onClick={() => navigate("register")}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Daftar Sekarang
          </span>
        </p>
      </div>
    </div>
  );
}
