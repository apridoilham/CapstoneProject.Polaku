import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const getChatbotResponse = async (message, history = []) => {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah Polaku AI, asisten diet ramah & ahli gizi. Jawab singkat, padat, gunakan bahasa Indonesia santai, dan fokus pada kesehatan & target kalori user.",
        },
        ...history.slice(-6),
        { role: "user", content: message },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    });
    return (
      response.choices[0]?.message?.content ||
      "Maaf, aku sedang berpikir. Coba lagi ya!"
    );
  } catch (err) {
    return "Koneksi ke AI terganggu. Silakan coba beberapa saat lagi.";
  }
};
