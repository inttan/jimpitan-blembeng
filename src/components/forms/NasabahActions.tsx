"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, X, Loader2 } from "lucide-react";
import { updateNasabah, deleteNasabah } from "@/app/actions/nasabah";

type Nasabah = {
  id: string;
  nama_lengkap: string;
  no_wa?: string;
  rt_rw?: string;
  status: string;
};

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 50, padding: "16px",
};

const modal: React.CSSProperties = {
  background: "var(--surf)", borderRadius: "var(--r)",
  border: "1px solid var(--bdr)", boxShadow: "var(--shd)",
  width: "100%", maxWidth: "420px", padding: "24px",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  border: "1px solid var(--bdr)", borderRadius: "8px",
  background: "var(--surf2)", color: "var(--text)",
  fontSize: "13px", boxSizing: "border-box",
};

const btnBase: React.CSSProperties = {
  padding: "9px 18px", borderRadius: "8px", fontSize: "13px",
  fontWeight: 600, cursor: "pointer", border: "none", display: "flex",
  alignItems: "center", gap: "6px",
};

export default function NasabahActions({ nasabah }: { nasabah: Nasabah }) {
  const [mode, setMode] = useState<"idle" | "edit" | "delete">("idle");
  const [form, setForm] = useState({
    nama_lengkap: nasabah.nama_lengkap,
    no_wa: nasabah.no_wa ?? "",
    rt_rw: nasabah.rt_rw ?? "",
    status: nasabah.status,
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleEdit = () => {
    setError("");
    startTransition(async () => {
      const res = await updateNasabah(nasabah.id, form);
      if (res.error) return setError(res.error);
      setMode("idle");
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteNasabah(nasabah.id);
      if (res.error) setError(res.error);
      else setMode("idle");
    });
  };

  return (
    <>
      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
        <button
          onClick={() => { setForm({ nama_lengkap: nasabah.nama_lengkap, no_wa: nasabah.no_wa ?? "", rt_rw: nasabah.rt_rw ?? "", status: nasabah.status }); setMode("edit"); }}
          title="Edit"
          style={{ ...btnBase, padding: "6px 10px", background: "var(--p5)", color: "var(--p)" }}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => setMode("delete")}
          title="Hapus"
          style={{ ...btnBase, padding: "6px 10px", background: "#fee2e2", color: "#ef4444" }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Edit Modal */}
      {mode === "edit" && (
        <div style={overlay} onClick={(e) => e.target === e.currentTarget && setMode("idle")}>
          <div style={modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>Edit Nasabah</h2>
              <button onClick={() => setMode("idle")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Nama Lengkap", key: "nama_lengkap", type: "text" },
                { label: "No. WhatsApp", key: "no_wa", type: "text" },
                { label: "RT/RW", key: "rt_rw", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)", display: "block", marginBottom: "6px" }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text2)", display: "block", marginBottom: "6px" }}>
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>

              {error && <p style={{ fontSize: "12px", color: "#ef4444" }}>{error}</p>}

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button onClick={() => setMode("idle")}
                  style={{ ...btnBase, flex: 1, background: "var(--surf3)", color: "var(--text2)", justifyContent: "center" }}>
                  Batal
                </button>
                <button onClick={handleEdit} disabled={isPending}
                  style={{ ...btnBase, flex: 1, background: "var(--p)", color: "#fff", justifyContent: "center", opacity: isPending ? 0.7 : 1 }}>
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {mode === "delete" && (
        <div style={overlay} onClick={(e) => e.target === e.currentTarget && setMode("idle")}>
          <div style={{ ...modal, maxWidth: "360px", textAlign: "center" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "#fee2e2", display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 16px", color: "#ef4444",
            }}>
              <Trash2 size={20} />
            </div>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
              Hapus Nasabah?
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text3)", marginBottom: "20px" }}>
              <strong style={{ color: "var(--text)" }}>{nasabah.nama_lengkap}</strong> akan dihapus permanen beserta seluruh data transaksinya.
            </p>
            {error && <p style={{ fontSize: "12px", color: "#ef4444", marginBottom: "12px" }}>{error}</p>}
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setMode("idle")}
                style={{ ...btnBase, flex: 1, background: "var(--surf3)", color: "var(--text2)", justifyContent: "center" }}>
                Batal
              </button>
              <button onClick={handleDelete} disabled={isPending}
                style={{ ...btnBase, flex: 1, background: "#ef4444", color: "#fff", justifyContent: "center", opacity: isPending ? 0.7 : 1 }}>
                {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}