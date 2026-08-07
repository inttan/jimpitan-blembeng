"use client";
import { useState, useTransition } from "react";
import { tarikKasKegiatan } from "@/app/actions/kas";
import { formatRupiah } from "@/lib/utils";

export default function FormTarikKas({ saldoKas = 0 }: { saldoKas?: number }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await tarikKasKegiatan({
        jumlah: parseFloat(fd.get("jumlah")?.toString() ?? "0"),
        keterangan: fd.get("keterangan")?.toString() ?? "",
        disetujui_oleh: fd.get("disetujui_oleh")?.toString() ?? "",
      });
      if (!result.success) {
        setError(result.error ?? "Gagal");
        return;
      }
      setSuccessData(result.data);
    });
  }

  function handleClose() {
    setOpen(false);
    setSuccessData(null);
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
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brass)"; (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "var(--brass)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "var(--ink)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; }}
      >
        + Tarik Kas Kegiatan
      </button>

      {open && (
        <div
          style={{
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
            maxWidth: "440px",
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
              }}>Tarik Kas Kegiatan Desa</h2>
              <button onClick={handleClose} disabled={isPending} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "20px", color: "var(--ink-soft)",
              }}>✕</button>
            </div>

            {/* Saldo info */}
            <div style={{
              background: "rgba(184,134,59,0.07)",
              border: "1px solid rgba(184,134,59,0.2)",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px",
              fontSize: "12.5px",
              color: "var(--ink-soft)",
              display: "flex",
              justifyContent: "space-between",
            }}>
              <span>Saldo kas tersedia</span>
              <strong style={{ color: "var(--green)", fontFamily: "'IBM Plex Mono', monospace" }}>
                {formatRupiah(saldoKas)}
              </strong>
            </div>

            {successData ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "50%",
                  background: "rgba(31,61,43,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 10px", fontSize: "24px",
                }}>✅</div>
                <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: "var(--green)", fontSize: "16px", margin: "0 0 4px" }}>
                  Pengeluaran Tercatat
                </p>
                <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: "0 0 4px" }}>
                  {formatRupiah(successData.jumlah)} · {successData.keterangan}
                </p>
                <p style={{ fontSize: "12px", color: "var(--ink-soft)", margin: "0 0 16px" }}>
                  Saldo kas sekarang: <strong style={{ color: "var(--green)" }}>{formatRupiah(successData.saldo_akhir)}</strong>
                </p>
                <button
                  onClick={handleClose}
                  style={{
                    width: "100%", padding: "10px", borderRadius: "8px",
                    border: "1px solid var(--line)", background: "#fff",
                    cursor: "pointer", fontWeight: 600, fontSize: "13.5px",
                    fontFamily: "'Public Sans', sans-serif",
                  }}
                >Tutup</button>
              </div>
            ) : (
              <>
                {error && (
                  <div style={{
                    background: "rgba(161,61,61,0.08)",
                    color: "var(--red)",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    marginBottom: "14px",
                    border: "1px solid rgba(161,61,61,0.2)",
                  }}>{error}</div>
                )}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{
                      fontSize: "12.5px", fontWeight: 600,
                      color: "var(--ink-soft)", display: "block", marginBottom: "6px",
                    }}>
                      Jumlah (Rp) <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <input
                      name="jumlah"
                      type="number"
                      min="1"
                      required
                      max={saldoKas || undefined}
                      placeholder="Contoh: 500000"
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: "8px",
                        border: "1px solid var(--line)", fontSize: "13.5px",
                        fontFamily: "'IBM Plex Mono', monospace", background: "#fff",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      fontSize: "12.5px", fontWeight: 600,
                      color: "var(--ink-soft)", display: "block", marginBottom: "6px",
                    }}>
                      Keterangan <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <textarea
                      name="keterangan"
                      required
                      rows={3}
                      placeholder="Wajib diisi — misal: Acara 17 Agustus, santunan kematian, dll."
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: "8px",
                        border: "1px solid var(--line)", fontSize: "13.5px",
                        fontFamily: "'Public Sans', sans-serif", background: "#fff",
                        resize: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      fontSize: "12.5px", fontWeight: 600,
                      color: "var(--ink-soft)", display: "block", marginBottom: "6px",
                    }}>
                      Disetujui oleh <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <input
                      name="disetujui_oleh"
                      required
                      placeholder="Nama kadus / pengurus"
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: "8px",
                        border: "1px solid var(--line)", fontSize: "13.5px",
                        fontFamily: "'Public Sans', sans-serif", background: "#fff",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      fontSize: "12.5px", fontWeight: 600,
                      color: "var(--ink-soft)", display: "block", marginBottom: "6px",
                    }}>Tanggal</label>
                    <input
                      name="tanggal"
                      type="date"
                      defaultValue={(() => {
                      const d = new Date();
                      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                    })()}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: "8px",
                        border: "1px solid var(--line)", fontSize: "13.5px",
                        fontFamily: "'Public Sans', sans-serif", background: "#fff",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isPending}
                      style={{
                        flex: 1, padding: "11px", borderRadius: "8px",
                        border: "1px solid var(--line)", background: "#fff",
                        cursor: "pointer", fontWeight: 600, fontSize: "13.5px",
                        fontFamily: "'Public Sans', sans-serif", color: "var(--ink)",
                      }}
                    >Batal</button>
                    <button
                      type="submit"
                      disabled={isPending}
                      style={{
                        flex: 1, padding: "11px", borderRadius: "8px",
                        border: "none",
                        background: "linear-gradient(135deg, #C9943E 0%, #B8863B 40%, #8A6428 100%)",
                        cursor: isPending ? "wait" : "pointer",
                        fontWeight: 600, fontSize: "13.5px",
                        fontFamily: "'Public Sans', sans-serif",
                        color: "#fff",
                        opacity: isPending ? 0.7 : 1,
                        boxShadow: "0 2px 6px rgba(138,100,40,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                      }}
                    >
                      {isPending ? "Menyimpan..." : "Catat Pengeluaran"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
