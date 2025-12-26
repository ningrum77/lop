
import { GoogleGenAI, Type } from "@google/genai";
import { Expense } from "../types";

// FIX: Switched from Vite-specific import.meta.env to standard process.env for API key access.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseScheduleText = async (inputText: string, currentMonthYear: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Konteks waktu: Bulan/Tahun saat ini adalah ${currentMonthYear}.
      
      Tugas: Ubah kalimat input menjadi data jadwal terstruktur.
      Input: "${inputText}"
      
      Aturan Ekstraksi:
      1. Tanggal: Jika hanya disebut angka (misal: "tanggal 10"), asumsikan bulan dan tahun sesuai konteks. Format: YYYY-MM-DD.
      2. Nama Petugas: Identifikasi semua nama orang/pegawai meskipun hanya ditulis nama depan, nama belakang, atau inisial. Ekstrak nama persis seperti yang ditulis di input.
      3. Aktivitas: Cari kata kunci seperti Posyandu (PY), Pusling (P), Fogging (F), Imunisasi (I), Dinas Luar (D).
      4. Lokasi: Identifikasi nama desa, gedung, atau tempat.
      
      Kembalikan dalam format JSON Array. Contoh:
      [{ "date": "2026-05-10", "staffNames": ["Ani", "Budi"], "activity": "Posyandu", "location": "Desa Sidakaton" }]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              staffNames: { type: Type.ARRAY, items: { type: Type.STRING } },
              activity: { type: Type.STRING },
              location: { type: Type.STRING }
            },
            required: ["date", "staffNames", "activity", "location"]
          }
        }
      }
    });
    
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Error:", error);
    return null;
  }
};

export const generateReportContent = async (section: string, currentText: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: ${context}. 
      Tugas: Kembangkan atau buat teks profesional untuk bagian "${section}" dari sebuah laporan kegiatan puskesmas.
      Teks saat ini: "${currentText}"
      
      Aturan:
      1. Berikan teks yang formal, informatif, dan sesuai standar laporan kesehatan Indonesia.
      2. Jika teks saat ini kosong, buatkan draf awal yang relevan dengan konteks kegiatan.
      3. Jangan gunakan markdown yang berlebihan, fokus pada narasi paragraf.`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Generate Error:", error);
    return null;
  }
};

export const summarizeExpenses = async (expenses: Expense[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tugas: Berikan ringkasan eksekutif mengenai penggunaan anggaran berdasarkan daftar pengeluaran berikut. Jelaskan alokasi dana utama dan apakah penggunaan dana terlihat efisien atau ada catatan khusus.
      Daftar Pengeluaran: ${JSON.stringify(expenses)}`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Summary Error:", error);
    return null;
  }
};
