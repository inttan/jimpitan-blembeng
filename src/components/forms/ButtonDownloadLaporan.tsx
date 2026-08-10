"use client";
import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";

type Mode = "tanggal" | "bulanan" | "tahunan";

export default function ButtonDownloadLaporan() {
  const [mode, setMode] = useState<Mode>("tanggal");
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [loadingLaporan, setLoadingLaporan] = useState(false);

  // Tanggal range
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  // Bulanan
  const [bulan, setBulan] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Tahunan
  const [tahun, setTahun] = useState(() => String(new Date().getFullYear()));

  function buildQs() {
    if (mode === "tanggal") {
      return `dari=${dari || ""}&sampai=${sampai || ""}`;
    } else if (mode === "bulanan") {
      return `bulan=${bulan}`;
    } else {
      return `tahun=${tahun}`;
    }
  }

  function getFileName(prefix: string) {
    if (mode === "tanggal") {
      const range = dari && sampai ? `${dari}_sd_${sampai}` : dari ? `dari_${dari}` : sampai ? `smp_${sampai}` : "semua";
      return `${prefix}_${range}.pdf`;
    } else if (mode === "bulanan") {
      return `${prefix}_${bulan}.pdf`;
    } else {
      return `${prefix}_${tahun}.pdf`;
    }
  }

  async function handleRiwayat() {
    setLoadingRiwayat(true);
    try {
      const qs = `type=riwayat&${buildQs()}`;
      const res = await fetch(`/api/laporan/pdf?${qs}`);
      if (!res.ok) throw new Error("Gagal");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getFileName("Riwayat");
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal export riwayat. Coba lagi.");
    } finally {
      setLoadingRiwayat(false);
    }
  }

  async function handleLaporan() {
    setLoadingLaporan(true);
    try {
      const qs = `type=laporan&${buildQs()}`;
      const res = await fetch(`/api/laporan/pdf?${qs}`);
      if (!res.ok) throw new Error("Gagal");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getFileName("Laporan");
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal export laporan. Coba lagi.");
    } finally {
      setLoadingLaporan(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* ── Filter Periode ─────────────────────────────── */}
      <div style={{
        padding: "14px",
        borderRadius: "10px",
        border: "1px solid var(--line)",
        background: "var(--paper)",
      }}>
        <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)", margin: "0 0 12px" }}>
          📅 Pilih Periode
        </h3>

        {/* Mode selector */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          {[
            { val: "tanggal", label: "Tanggal" },
            { val: "bulanan", label: "Bulanan" },
            { val: "tahunan", label: "Tahunan" },
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => setMode(opt.val as Mode)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid",
                borderColor: mode === opt.val ? "var(--green)" : "var(--line)",
                background: mode === opt.val ? "var(--green)" : "var(--paper-raised)",
                color: mode === opt.val ? "#fff" : "var(--ink)",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Tanggal Range */}
        {mode === "tanggal" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "var(--ink-soft)", display: "block", marginBottom: "4px" }}>Dari</label>
              <input
                type="date"
                value={dari}
                onChange={(e) => setDari(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  border: "1px solid var(--line)",
                  background: "#fff",
                  fontFamily: "'Public Sans', sans-serif",
                  color: "var(--ink)",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "var(--ink-soft)", display: "block", marginBottom: "4px" }}>Sampai</label>
              <input
                type="date"
                value={sampai}
                onChange={(e) => setSampai(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  border: "1px solid var(--line)",
                  background: "#fff",
                  fontFamily: "'Public Sans', sans-serif",
                  color: "var(--ink)",
                }}
              />
            </div>
          </div>
        )}

        {/* Bulanan */}
        {mode === "bulanan" && (
          <div>
            <label style={{ fontSize: "11px", color: "var(--ink-soft)", display: "block", marginBottom: "4px" }}>Bulan</label>
            <input
              type="month"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                fontSize: "13px",
                border: "1px solid var(--line)",
                background: "#fff",
                fontFamily: "'Public Sans', sans-serif",
                color: "var(--ink)",
              }}
            />
          </div>
        )}

        {/* Tahunan */}
        {mode === "tahunan" && (
          <div>
            <label style={{ fontSize: "11px", color: "var(--ink-soft)", display: "block", marginBottom: "4px" }}>Tahun</label>
            <input
              type="number"
              min="2020"
              max="2100"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                fontSize: "14px",
                border: "1px solid var(--line)",
                background: "#fff",
                fontFamily: "'IBM Plex Mono', monospace",
                color: "var(--ink)",
              }}
            />
          </div>
        )}
      </div>

      {/* ── Tombol Export ─────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <button
          onClick={handleRiwayat}
          disabled={loadingRiwayat}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            padding: "14px 12px",
            borderRadius: "10px",
            border: "1px solid var(--line)",
            background: "var(--ink)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "12px",
            cursor: loadingRiwayat ? "wait" : "pointer",
            fontFamily: "'Public Sans', sans-serif",
            opacity: loadingRiwayat ? 0.7 : 1,
            transition: "all 0.15s",
          }}
        >
          {loadingRiwayat ? (
            <><Loader2 size={16} className="animate-spin" /><span>Membuat...</span></>
          ) : (
            <><FileDown size={16} /><span>Export Riwayat</span></>
          )}
        </button>

        <button
          onClick={handleLaporan}
          disabled={loadingLaporan}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            padding: "14px 12px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(135deg, #C9943E 0%, #B8863B 40%, #8A6428 100%)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "12px",
            cursor: loadingLaporan ? "wait" : "pointer",
            fontFamily: "'Public Sans', sans-serif",
            opacity: loadingLaporan ? 0.7 : 1,
            boxShadow: "0 2px 6px rgba(138,100,40,0.35)",
            transition: "all 0.15s",
          }}
        >
          {loadingLaporan ? (
            <><Loader2 size={16} className="animate-spin" /><span>Membuat...</span></>
          ) : (
            <><FileDown size={16} /><span>Export Laporan</span></>
          )}
        </button>
      </div>

      <p style={{ fontSize: "10.5px", color: "var(--ink-soft)", margin: 0, textAlign: "center", lineHeight: 1.4 }}>
        <strong>Riwayat</strong> = semua aktivitas (setoran, kas, edit warga)<br/>
        <strong>Laporan</strong> = setoran & kas keluar aja
      </p>

    </div>
  );
}
