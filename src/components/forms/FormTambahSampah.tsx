"use client";

import { useState, useTransition } from "react";
import { tambahSampahDenganHarga } from "@/app/actions/harga";

const KATEGORI = ["plastik", "kertas", "logam", "kaca", "organik", "elektronik", "lainnya"];
const SATUAN = ["kg", "pcs", "liter"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  border: "1px solid var(--bdr)", borderRadius: "8px",
  background: "var(--surf2)", color: "var(--text)",
  fontSize: "13px", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px", fontWeight: 600,
  color: "var(--text2)", display: "block", marginBottom: "6px",
};

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 50, padding: "16px",
};

const modal: React.CSSProperties = {
  background: "var(--surf)", borderRadius: "var(--r)",
  border: "1px solid var(--bdr)", boxShadow: "var(--shd)",
  width: "100%", maxWidth: "440px", padding: "24px",
};

export default function FormTambahSampah() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await tambahSampahDenganHarga(fd);
      if (!result.success) { setError(result.error ?? "Gagal"); return; }
      setOpen(false);
    });
  }

  return (
    <>
<button
  onClick={() => { setOpen(true); setError(null); }}
  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
>
  + Jenis Sampah Baru
</button>

      {open && (
        <div style={overlay} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div style={modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>
                Tambah Jenis Sampah
              </h2>
              <button onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: "18px" }}>
                ✕
              </button>
            </div>

            {error && (
              <div style={{
                marginBottom: "16px", padding: "10px 14px",
                background: "#fee2e2", borderRadius: "8px",
                fontSize: "12px", color: "#ef4444",
              }}>{error}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Nama Sampah <span style={{ color: "#ef4444" }}>*</span></label>
                <input name="nama_sampah" placeholder="Contoh: Botol PET, Kardus, Kaleng" required style={inputStyle} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Kategori <span style={{ color: "#ef4444" }}>*</span></label>
                  <select name="kategori" required style={inputStyle}>
                    <option value="">Pilih kategori</option>
                    {KATEGORI.map((k) => (
                      <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Satuan</label>
                  <select name="satuan" style={inputStyle}>
                    {SATUAN.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Harga per kg (Rp) <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  name="harga_per_kg" type="number" min="1" placeholder="2000"
                  required style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Catatan (opsional)</label>
                <input name="catatan" placeholder="Misal: harga naik karena permintaan tinggi" style={inputStyle} />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button type="button" onClick={() => setOpen(false)} style={{
                  flex: 1, padding: "9px", borderRadius: "8px", fontSize: "13px",
                  fontWeight: 600, cursor: "pointer",
                  border: "1px solid var(--bdr)", background: "var(--surf3)", color: "var(--text2)",
                }}>
                  Batal
                </button>
                <button type="submit" disabled={isPending} style={{
                  flex: 1, padding: "9px", borderRadius: "8px", fontSize: "13px",
                  fontWeight: 600, cursor: "pointer", border: "none",
                  background: "var(--p)", color: "#fff", opacity: isPending ? 0.7 : 1,
                }}>
                  {isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}