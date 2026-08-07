"use client";
import { useState, useTransition } from "react";
import { tambahWarga } from "@/app/actions/warga";

export default function FormTambahWarga() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    console.log("FormData entries:");
    for (const [key, value] of fd.entries()) {
      console.log(key, value);
    }
    setError(null);
    startTransition(async () => {
      const result = await tambahWarga(fd);
      console.log("Result success:", result.success, "error:", result.error);
      if (!result.success) {
        setError(result.error ?? "Gagal");
        return;
      }
      setOpen(false);
    });
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
        + Tambah Warga
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
          onClick={(e) => e.target === e.currentTarget && !isPending && setOpen(false)}
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
              }}>Tambah Warga / KK</h2>
              <button onClick={() => setOpen(false)} disabled={isPending} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "20px", color: "var(--ink-soft)",
              }}>✕</button>
            </div>

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
              {[
                { name: "nama", label: "Nama Lengkap", placeholder: "mis. Sutrisno", required: true },
                { name: "no_rumah", label: "No. Rumah / RT", placeholder: "mis. RT 02 No. 14", required: false },
                { name: "no_hp", label: "No. WhatsApp", placeholder: "62812xxxxxxx", required: false },
              ].map((f) => (
                <div key={f.name}>
                  <label htmlFor={`field-${f.name}`} style={{
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "var(--ink-soft)",
                    display: "block",
                    marginBottom: "6px",
                  }}>
                    {f.label} {f.required && <span style={{ color: "var(--red)" }}>*</span>}
                  </label>
                  <input
                    id={`field-${f.name}`}
                    name={f.name}
                    placeholder={f.placeholder}
                    required={f.required}
                    className="w-full"
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
              ))}

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
                    background: "linear-gradient(135deg, #2E5540 0%, #1F3D2B 60%)",
                    cursor: isPending ? "wait" : "pointer",
                    fontWeight: 600, fontSize: "13.5px",
                    fontFamily: "'Public Sans', sans-serif",
                    color: "#F6F3EA",
                    opacity: isPending ? 0.7 : 1,
                  }}
                >
                  {isPending ? "Menyimpan..." : "Simpan Warga"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
