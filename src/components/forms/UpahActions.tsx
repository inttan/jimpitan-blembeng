"use client";
import { useState, useTransition } from "react";
import { tandaiUpahDibayar } from "@/app/actions/upah";
import { CheckCircle, Loader2 } from "lucide-react";

export default function UpahActions({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(status === "sudah_dibayar");
  const [error, setError] = useState("");

  if (done || status === "sudah_dibayar") {
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--green)",
        background: "rgba(31,61,43,0.06)",
        padding: "4px 10px",
        borderRadius: "20px",
        fontFamily: "'Public Sans', sans-serif",
      }}>
        <CheckCircle size={12} /> Sudah Ditarik
      </span>
    );
  }

  return (
    <div>
      <button
        disabled={isPending}
        onClick={() => {
          setError("");
          startTransition(async () => {
            const res = await tandaiUpahDibayar(id);
            if (!res.success) {
              setError(res.error ?? "Gagal");
              return;
            }
            setDone(true);
          });
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 12px",
          borderRadius: "8px",
          border: "none",
          background: "linear-gradient(135deg, #C9943E 0%, #B8863B 40%, #8A6428 100%)",
          color: "#fff",
          fontSize: "12px",
          fontWeight: 600,
          cursor: isPending ? "wait" : "pointer",
          fontFamily: "'Public Sans', sans-serif",
          opacity: isPending ? 0.7 : 1,
          transition: "background 0.15s",
          boxShadow: "0 1px 4px rgba(138,100,40,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
        onMouseEnter={(e) => { if (!isPending) (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #D4A84E 0%, #C9943E 40%, #8A6428 100%)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #C9943E 0%, #B8863B 40%, #8A6428 100%)"; }}
      >
        {isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
        Tandai Ditarik
      </button>
      {error && (
        <p style={{ fontSize: "11px", color: "var(--red)", marginTop: "4px" }}>{error}</p>
      )}
    </div>
  );
}
