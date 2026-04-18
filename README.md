# 🥗 PolaKu: Smart Diet AI Assistant

> **Capstone Project: Personalized Diet Recommendation System using Deep Reinforcement Learning (DQN) & LLM.**

PolaKu adalah aplikasi manajemen diet cerdas yang menggabungkan kekuatan **Deep Reinforcement Learning** untuk rekomendasi nutrisi presisi dan **Large Language Model (LLM)** sebagai asisten interaktif. Aplikasi ini membantu pengguna mencapai target berat badan melalui perencanaan menu harian yang adaptif dan pelacakan progress mingguan.

---

## 🚀 Fitur Utama

- **🤖 AI Diet Planner**: Rekomendasi 25 menu terbaik dari +900 dataset makanan menggunakan model **Deep Q-Network (DQN)**.
- **⚖️ Hybrid Calorie Scaling**: Algoritma hibrida yang menyesuaikan porsi makanan secara matematis untuk mencapai MAE (Mean Absolute Error) < 0.02 kkal.
- **💬 Chatbot Nutritionist**: Asisten AI berbasis **Llama 3.3 (Groq)** untuk konsultasi gizi real-time.
- **📉 Progress Tracker**: Monitoring berat badan mingguan dengan logika otomatis pendeteksi "Minggu Terlewat".
- **🛠️ Interactive Workspace**: Fitur _Drag-and-Drop_ untuk menyusun menu harian (Sarapan, Siang, Malam).

---

## 🛠️ Tech Stack

### Front-End

- **React.js (Vite)**: UI Library modern dan cepat.
- **Tailwind CSS**: Desain antarmuka responsif dan _dark-theme_.
- **Axios**: Komunikasi data dengan server API.

### Back-End (Microservices)

- **Node.js & Express**: Server utama pengelola User, Database, dan Riwayat.
- **FastAPI (Python)**: Server khusus _Inference AI_ untuk memproses model TensorFlow secara cepat.
- **MongoDB Atlas**: Database NoSQL untuk penyimpanan data user yang fleksibel.

### AI & Data Science

- **TensorFlow / Keras**: Library utama pembangunan arsitektur DQN.
- **TensorBoard**: Visualisasi proses training dan metrik performa model.
- **Deep Reinforcement Learning**: Algoritma pembelajaran berbasis _Reward & Penalty_.

---

## 🧠 Arsitektur AI

PolaKu menggunakan pendekatan **Hybrid Architecture**:

1.  **DQN Model**: Bertugas mengeksplorasi ribuan kombinasi makanan untuk menemukan 3 menu dengan profil makronutrisi (Protein, Lemak, Karbohidrat) yang paling sesuai dengan profil biologis pengguna.
2.  **Heuristic Scaling**: Menggunakan perhitungan matematis untuk menyesuaikan gramasi makanan sehingga total kalori yang dihasilkan memiliki tingkat akurasi tinggi (MAE 0.0006).
3.  **Custom Components**: Mengimplementasikan _Custom Normalization Layer_ dan _Custom Loss Function (Huber Loss)_ untuk stabilitas training.

---

## ⚙️ Cara Menjalankan Proyek

### 1. Prasyarat

- Node.js v18+
- Python 3.10+
- MongoDB Atlas Account
- Groq Cloud API Key

### 2. Jalankan AI Server (Python)

```bash
cd backend/ai
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

### 3. Jalankan Backend (Node.js)

```bash
cd backend
npm install
npm run dev
```

### 4. Jalankan Frontend (React)

```bash
cd backend
npm install
npm run dev
```
