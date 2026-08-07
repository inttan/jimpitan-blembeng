"use client";
import { useState, useTransition } from "react";
import { formatRupiah } from "@/lib/utils";

export default function FormTarikUpah() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const jumlah = parseFloat(formData.get("jumlah") as string) || 0;
    const keterangan = formData.get("keterangan") as string;

    if (jumlah <= 0) {
      setError("Jumlah harus diisi.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/tarik-upah", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jumlah, keterangan }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Gagal");
          return;
        }
        setSuccess(true);
      } catch {
        setError("Terjadi kesalahan");
      }
    });
  }

  function handleClose() {
    setOpen(false);
    setSuccess(false);
    setError(null);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "9px 15px",
          borderRadius: "8px",
          border: "1px solid var(--line)",
          background: "#fff",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--ink)",
          cursor: "pointer",
          fontFamily: "'Public Sans', sans-serif",
        }}
      >
        + Tarik Upah
      </button>

      {open && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "rgba(38,36,30,0.45)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
        onClick={(e) => e.target === e.currentTarget && !isPending && handleClose()}
        >
          <div style={{
            width: "100%",
            maxWidth: "400px",
            background: "var(--paper-raised)",
            borderRadius: "14px",
            padding: "28px",
            boxShadow: "0 8px 32px rgba(38,36,30,0.15)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "17px",
                fontWeight: 600,
                color: "var(--green)",
                margin: 0,
              }}>Tarik Upah Penarik</h2>
              <button onClick={handleClose} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "20px", color: "var(--ink-soft)",
              }}>✕</button>
            </div>

            {success ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>✅</div>
                <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: "var(--green)" }}>
                  Upah berhasil ditarik
                </p>
                <button onClick={handleClose} style={{
                  marginTop: "16px", padding: "10px 20px",
                  borderRadius: "8px", border: "1px solid var(--line)",
                  background: "#fff", cursor: "pointer", fontFamily: "'Public Sans', sans-serif",
                }}>Tutup</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {error && (
                  <div style={{
                    background: "rgba(161,61,61,0.08)",
                    color: "var(--red)",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    border: "1px solid rgba(161,61,61,0.2)",
                  }}>{error}</div>
                )}

                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--ink-soft)", display: "block", marginBottom: "6px" }}>
                    Jumlah (Rp) *
                  </label>
                  <input
                    name="jumlah"
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    placeholder="Contoh: 50000"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--line)",
                      fontSize: "13.5px",
                      fontFamily: "'IBM Plex Mono', monospace",
                      background: "#fff",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--ink-soft)", display: "block", marginBottom: "6px" }}>
                    Keterangan
                  </label>
                  <input
                    name="keterangan"
                    type="text"
                    placeholder="Contoh: Upah penarik minggu ini"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--line)",
                      fontSize: "13.5px",
                      fontFamily: "'Public Sans', sans-serif",
                      background: "#fff",
                    }}
                  />
                </div>

                <div style={{ fontSize: "11px", color: "var(--ink-soft)", textAlign: "center" }}>
                  Tanggal: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <button
                    type="button"
                    onClick={handleClose}
                    style={{
                      flex: 1,
                      padding: "11px",
                      borderRadius: "8px",
                      border: "1px solid var(--line)",
                      background: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "13.5px",
                      fontFamily: "'Public Sans', sans-serif",
                      color: "var(--ink)",
                    }}
                  >Batal</button>
                  <button
                    type="submit"
                    disabled={isPending}
                    style={{
                      flex: 1,
                      padding: "11px",
                      borderRadius: "8px",
                      border: "none",
                      background: "var(--brass)",
                      cursor: isPending ? "wait" : "pointer",
                      fontWeight: 600,
                      fontSize: "13.5px",
                      fontFamily: "'Public Sans', sans-serif",
                      color: "#fff",
                      opacity: isPending ? 0.7 : 1,
                    }}
                  >
                    {isPending ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
