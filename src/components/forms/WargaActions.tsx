"use client";
import { useState, useTransition } from "react";
import { Pencil, Trash2, X, Loader2, MessageCircle } from "lucide-react";
import { updateWarga, deleteWarga } from "@/app/actions/warga";
import { generateWAReminderLink, kirimNotifWA } from "@/lib/whatsapp";
import { getMingguKe, NOMINAL_STANDAR } from "@/lib/jimpitan";

type Warga = {
  id: string;
  nama: string;
  no_hp?: string | null;
  no_rumah?: string | null;
  status_aktif: boolean;
};

export default function WargaActions({
  warga,
  showWa = true,
}: {
  warga: Warga;
  showWa?: boolean;
}) {
  const [mode, setMode] = useState<"idle" | "edit" | "delete">("idle");
  const [form, setForm] = useState({
    nama: warga.nama,
    no_hp: warga.no_hp ?? "",
    no_rumah: warga.no_rumah ?? "",
    status_aktif: warga.status_aktif,
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleEdit = () => {
    setError("");
    startTransition(async () => {
      const res = await updateWarga(warga.id, form);
      if (res.error) return setError(res.error);
      setMode("idle");
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteWarga(warga.id);
      if (res.error) setError(res.error);
      else setMode("idle");
    });
  };

  const handleWA = () => {
    if (!warga.no_hp) {
      alert("Nomor WA warga belum terdaftar.");
      return;
    }
    const url = generateWAReminderLink({
      namaWarga: warga.nama,
      noHp: warga.no_hp,
      mingguKe: getMingguKe(),
      nominal: NOMINAL_STANDAR,
    });
    kirimNotifWA(url);
  };

  return (
    <>
      <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
        {showWa && (
          <button
            onClick={handleWA}
            title="Kirim WA Reminder"
            disabled={!warga.no_hp}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid var(--line)",
              background: warga.no_hp ? "rgba(31,61,43,0.06)" : "var(--surf3)",
              color: warga.no_hp ? "var(--green)" : "var(--text3)",
              cursor: warga.no_hp ? "pointer" : "not-allowed",
              opacity: warga.no_hp ? 1 : 0.5,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: "'Public Sans', sans-serif",
            }}
          >
            <MessageCircle size={13} />
          </button>
        )}
        <button
          onClick={() => {
            setForm({ nama: warga.nama, no_hp: warga.no_hp ?? "", no_rumah: warga.no_rumah ?? "", status_aktif: warga.status_aktif });
            setMode("edit");
          }}
          title="Edit"
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid var(--line)",
            background: "rgba(31,61,43,0.06)",
            color: "var(--green)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => setMode("delete")}
          title="Nonaktifkan"
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid rgba(161,61,61,0.2)",
            background: "rgba(161,61,61,0.04)",
            color: "var(--red)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {mode === "edit" && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(38,36,30,0.45)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 200, padding: "16px",
        }}
        onClick={(e) => e.target === e.currentTarget && setMode("idle")}
        >
          <div style={{
            width: "100%", maxWidth: "420px",
            background: "var(--paper-raised)",
            borderRadius: "14px", padding: "24px",
            boxShadow: "0 8px 32px rgba(38,36,30,0.15)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "16px", fontWeight: 600, color: "var(--green)", margin: 0 }}>Edit Warga</h2>
              <button onClick={() => setMode("idle")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Nama", key: "nama" as const },
                { label: "No. WhatsApp", key: "no_hp" as const },
                { label: "No. Rumah / RT", key: "no_rumah" as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--ink-soft)", display: "block", marginBottom: "6px" }}>{label}</label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: "8px",
                      border: "1px solid var(--line)", fontSize: "13.5px",
                      fontFamily: "'Public Sans', sans-serif", background: "#fff",
                    }}
                  />
                </div>
              ))}

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--ink-soft)", display: "block", marginBottom: "6px" }}>Status</label>
                <select
                  value={form.status_aktif ? "aktif" : "nonaktif"}
                  onChange={(e) => setForm((f) => ({ ...f, status_aktif: e.target.value === "aktif" }))}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: "8px",
                    border: "1px solid var(--line)", fontSize: "13.5px",
                    fontFamily: "'Public Sans', sans-serif", background: "#fff",
                  }}
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>

              {error && <p style={{ fontSize: "12px", color: "var(--red)" }}>{error}</p>}

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setMode("idle")} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "13px", fontFamily: "'Public Sans', sans-serif", color: "var(--ink)" }}>Batal</button>
                <button
                  onClick={handleEdit}
                  disabled={isPending}
                  style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "none", background: "var(--green)", color: "#F6F3EA", cursor: isPending ? "wait" : "pointer", fontWeight: 600, fontSize: "13px", fontFamily: "'Public Sans', sans-serif", opacity: isPending ? 0.7 : 1 }}
                >
                  {isPending ? <><Loader2 size={14} className="animate-spin" style={{ display: "inline" }} /> Menyimpan...</> : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === "delete" && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(38,36,30,0.45)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 200, padding: "16px",
        }}
        onClick={(e) => e.target === e.currentTarget && setMode("idle")}
        >
          <div style={{
            width: "100%", maxWidth: "360px",
            background: "var(--paper-raised)",
            borderRadius: "14px", padding: "24px",
            boxShadow: "0 8px 32px rgba(38,36,30,0.15)",
            textAlign: "center",
          }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "rgba(161,61,61,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", color: "var(--red)",
            }}>
              <Trash2 size={20} />
            </div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "15px", fontWeight: 600, color: "var(--ink)", margin: "0 0 8px" }}>
              Nonaktifkan {warga.nama}?
            </h2>
            <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "20px" }}>
              Data transaksi lama tetap aman. Warga bisa diaktifkan kembali kapan saja.
            </p>
            {error && <p style={{ fontSize: "12px", color: "var(--red)", marginBottom: "12px" }}>{error}</p>}
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setMode("idle")} style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "13px", fontFamily: "'Public Sans', sans-serif", color: "var(--ink)" }}>Batal</button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "none", background: "var(--red)", color: "#fff", cursor: isPending ? "wait" : "pointer", fontWeight: 600, fontSize: "13px", fontFamily: "'Public Sans', sans-serif", opacity: isPending ? 0.7 : 1 }}
              >
                {isPending ? "..." : "Nonaktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
