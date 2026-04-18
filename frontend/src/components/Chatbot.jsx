import React, { useState } from "react";
import axios from "axios";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      content: "Halo! Aku Polaku AI 🤖. Ada yang bisa dibantu soal diet?",
    },
  ]);
  const [inp, setInp] = useState("");
  const [load, setLoad] = useState(false);

  const send = async () => {
    if (!inp.trim()) return;
    const userMsg = { role: "user", content: inp };
    setMsgs((p) => [...p, userMsg]);
    setInp("");
    setLoad(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/recommendation/chat`,
        { message: inp, history: msgs.slice(-5) },
      );
      setMsgs((p) => [...p, { role: "assistant", content: data.reply }]);
    } catch {
      setMsgs((p) => [
        ...p,
        { role: "assistant", content: "Maaf, koneksi terganggu." },
      ]);
    }
    setLoad(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[450px]">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 flex justify-between text-white font-bold">
            <span>💬 Polaku AI</span>
            <button onClick={() => setOpen(false)} className="hover:opacity-70">
              ✕
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-sm ${m.role === "user" ? "bg-purple-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-700 rounded-bl-none"}`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {load && (
              <div className="text-gray-400 text-xs italic">
                AI sedang mengetik...
              </div>
            )}
          </div>
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              value={inp}
              onChange={(e) => setInp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="flex-1 bg-gray-100 p-2 rounded-xl outline-none text-sm"
              placeholder="Tanya sesuatu..."
            />
            <button
              onClick={send}
              disabled={load}
              className="bg-purple-600 text-white px-3 rounded-xl hover:bg-purple-700"
            >
              ➤
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-purple-500/40 hover:scale-110 transition-transform"
        >
          💬
        </button>
      )}
    </div>
  );
}
