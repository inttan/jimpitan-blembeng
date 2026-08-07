"use client";
import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";

type Mode = "mingguan" | "bulanan" | "tahunan";

export default function ButtonDownloadLaporan() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("mingguan");
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [minggu, setMinggu] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    // Pakai local date string agar konsisten dengan getMingguKe() JS
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dayStr = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dayStr}`;
  });
  const [bulan, setBulan] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [tahun, setTahun] = useState(() => String(new Date().getFullYear()));

  async function handleDownload() {
    setLoading(true);
    try {
      let qs = `mode=${mode}`;
      if (mode === "mingguan") qs += `&minggu=${minggu}`;
      if (mode === "bulanan") qs += `&bulan=${bulan}`;
      if (mode === "tahunan") qs += `&tahun=${tahun}`;

      const res = await fetch(`/api/laporan/pdf?${qs}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const label = mode === "mingguan" ? minggu : mode === "bulanan" ? bulan : tahun;
      a.download = `Laporan_Jimpitan_Blembeng_${mode}_${label}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.message || "Gagal download laporan PDF. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRiwayat() {
    setLoadingRiwayat(true);
    try {
      const res = await fetch("/api/laporan/pdf?mode=riwayat");
      if (!res.ok) throw new Error("Gagal");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_Riwayat_Perubahan_${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal export riwayat. Coba lagi.");
    } finally {
      setLoadingRiwayat(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Periode selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div>
          <label style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--ink-soft)",
            display: "block",
            marginBottom: "5px",
          }}>Periode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              border: "1px solid var(--line)",
              background: "#fff",
              fontFamily: "'Public Sans', sans-serif",
              color: "var(--ink)",
              cursor: "pointer",
            }}
          >
            <option value="mingguan">Minggu</option>
            <option value="bulanan">Bulan</option>
            <option value="tahunan">Tahun</option>
          </select>
        </div>

        <div>
          <label style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--ink-soft)",
            display: "block",
            marginBottom: "5px",
          }}>&nbsp;</label>
          {mode === "mingguan" && (
            <input
              type="date"
              value={minggu}
              onChange={(e) => setMinggu(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                border: "1px solid var(--line)",
                background: "#fff",
                fontFamily: "'Public Sans', sans-serif",
                color: "var(--ink)",
              }}
            />
          )}
          {mode === "bulanan" && (
            <input
              type="month"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                border: "1px solid var(--line)",
                background: "#fff",
                fontFamily: "'Public Sans', sans-serif",
                color: "var(--ink)",
              }}
            />
          )}
          {mode === "tahunan" && (
            <input
              type="number"
              min="2020"
              max="2100"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                border: "1px solid var(--line)",
                background: "#fff",
                fontFamily: "'IBM Plex Mono', monospace",
                color: "var(--ink)",
              }}
            />
          )}
        </div>
      </div>

      {/* Download laporan */}
      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "11px 18px",
          borderRadius: "8px",
          border: "none",
          background: "linear-gradient(135deg, #C9943E 0%, #B8863B 40%, #8A6428 100%)",
          color: "#fff",
          fontWeight: 600,
          fontSize: "13.5px",
          cursor: loading ? "wait" : "pointer",
          fontFamily: "'Public Sans', sans-serif",
          opacity: loading ? 0.7 : 1,
          boxShadow: "0 2px 6px rgba(138,100,40,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
          transition: "background 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #D4A84E 0%, #C9943E 40%, #8A6428 100%)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(138,100,40,0.45), inset 0 1px 0 rgba(255,255,255,0.25)"; }}}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #C9943E 0%, #B8863B 40%, #8A6428 100%)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 6px rgba(138,100,40,0.35), inset 0 1px 0 rgba(255,255,255,0.2)"; }}
      >
        {loading ? (
          <><Loader2 size={15} className="animate-spin" /> Membuat PDF...</>
        ) : (
          <><FileDown size={15} /> Unduh Laporan (PDF)</>
        )}
      </button>

      {/* Export riwayat */}
      <button
        onClick={handleRiwayat}
        disabled={loadingRiwayat}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "10px 18px",
          borderRadius: "8px",
          border: "1px solid var(--line)",
          background: "var(--paper-raised)",
          color: "var(--ink)",
          fontWeight: 600,
          fontSize: "13px",
          cursor: loadingRiwayat ? "wait" : "pointer",
          fontFamily: "'Public Sans', sans-serif",
          opacity: loadingRiwayat ? 0.7 : 1,
          transition: "all 0.15s",
        }}
      >
        {loadingRiwayat ? (
          <><Loader2 size={15} className="animate-spin" /> Membuat...</>
        ) : (
          <><FileDown size={15} /> Export Riwayat Perubahan (PDF)</>
        )}
      </button>
    </div>
  );
}
