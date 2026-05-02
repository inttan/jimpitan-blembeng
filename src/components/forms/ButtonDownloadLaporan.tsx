"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";

export default function ButtonDownloadLaporan() {
  const [loading, setLoading] = useState(false);
  const [bulan, setBulan] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/laporan/word?bulan=${bulan}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_BankSampah_${bulan}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal download laporan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <input
        type="month"
        value={bulan}
        onChange={(e) => setBulan(e.target.value)}
        style={{
          padding: "8px 12px", borderRadius: "9px", fontSize: "13px",
          border: "1px solid var(--bdr)", background: "var(--surf2)",
          color: "var(--text)", outline: "none", cursor: "pointer",
        }}
      />
      <button
        onClick={handleDownload}
        disabled={loading}
        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60"
        style={{ display: "flex", alignItems: "center", gap: "6px" }}
      >
        {loading
          ? <><Loader2 size={15} className="animate-spin" /> Membuat...</>
          : <><FileDown size={15} /> Unduh Word</>
        }
      </button>
    </div>
  );
}