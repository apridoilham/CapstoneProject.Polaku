import React from "react";

export default function Landing({ navigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-8">
            <span>🤖</span>
            <span>AI-Powered Diet Recommendation</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Diet Sehat dengan{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Kecerdasan Buatan
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            PolaKu membantu Anda mencapai target kesehatan dengan rekomendasi
            menu makanan yang dipersonalisasi menggunakan Deep Learning.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("register")}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Mulai Sekarang - Gratis!
            </button>
            <button
              onClick={() => navigate("login")}
              className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all"
            >
              Sudah Punya Akun?
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          {[
            {
              icon: "🧠",
              title: "AI Recommendation",
              desc: "Deep Reinforcement Learning untuk menu yang presisi sesuai target kalori Anda",
            },
            {
              icon: "📊",
              title: "Progress Tracking",
              desc: "Pantau perkembangan berat badan dan pencapaian diet Anda setiap minggu",
            },
            {
              icon: "🍽️",
              title: "Personalized Menu",
              desc: "Rekomendasi makanan sesuai preferensi, alergi, dan tujuan diet Anda",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
