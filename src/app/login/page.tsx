"use client";
import { useState, useTransition } from "react";
import { login } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await login(fd);
      if (result?.error) setError(result.error);
      if (result?.success) router.push("/jimpitan");
    });
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `
        radial-gradient(circle at 15% 20%, rgba(184,134,59,0.10), transparent 40%),
        radial-gradient(circle at 85% 80%, rgba(31,61,43,0.08), transparent 45%),
        var(--paper)
      `,
      padding: "24px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "380px",
        background: "var(--paper-raised)",
        border: "1px solid var(--line)",
        borderRadius: "14px",
        padding: "40px 32px",
        boxShadow: "0 1px 2px rgba(38,36,30,0.06), 0 4px 14px rgba(38,36,30,0.05)",
        textAlign: "center",
      }}>
        {/* Coin logo */}
        <div style={{
          width: "64px",
          height: "64px",
          margin: "0 auto 18px",
          borderRadius: "50%",
          background: "conic-gradient(from 220deg, var(--brass), #D8B26C, var(--brass))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 0 0 2px rgba(38,36,30,0.15), 0 3px 8px rgba(184,134,59,0.35)",
        }}>
          <span style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: "22px",
            color: "var(--green)",
          }}>Rp</span>
        </div>

        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "22px",
          fontWeight: 600,
          color: "var(--green)",
          margin: "0 0 4px",
        }}>Jimpitan Dusun Blembeng</h1>

        <p style={{
          fontFamily: "'Public Sans', sans-serif",
          fontSize: "13.5px",
          color: "var(--ink-soft)",
          margin: "0 0 28px",
        }}>Masuk sebagai pengurus untuk mengelola setoran &amp; kas kegiatan</p>

        {error && (
          <div style={{
            background: "rgba(161,61,61,0.08)",
            color: "var(--red)",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "16px",
            border: "1px solid rgba(161,61,61,0.2)",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "var(--ink-soft)",
              marginBottom: "6px",
              letterSpacing: "0.02em",
            }}>Nama pengguna</label>
            <input
              name="email"
              type="text"
              autoComplete="username"
              placeholder="kadus.blembeng"
              style={{
                width: "100%",
                padding: "11px 13px",
                borderRadius: "8px",
                border: "1px solid var(--line)",
                background: "#fff",
                fontSize: "14.5px",
                fontFamily: "'Public Sans', sans-serif",
                color: "var(--ink)",
                outline: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--brass)";
                e.target.style.boxShadow = "0 0 0 2px rgba(184,134,59,0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--line)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label style={{
              display: "block",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "var(--ink-soft)",
              marginBottom: "6px",
              letterSpacing: "0.02em",
            }}>Kata sandi</label>
            <div style={{ position: "relative" }}>
              <input
                name="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "11px 42px 11px 13px",
                  borderRadius: "8px",
                  border: "1px solid var(--line)",
                  background: "#fff",
                  fontSize: "14.5px",
                  fontFamily: "'Public Sans', sans-serif",
                  color: "var(--ink)",
                  outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--brass)";
                  e.target.style.boxShadow = "0 0 0 2px rgba(184,134,59,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--line)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--ink-soft)",
                  fontSize: "13px",
                  padding: "4px",
                }}
              >
                {showPw ? "Sembunyikan" : "Lihat"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #2E5540 0%, #1F3D2B 60%)",
              color: "#F6F3EA",
              fontWeight: 600,
              fontSize: "14.5px",
              cursor: isPending ? "wait" : "pointer",
              fontFamily: "'Public Sans', sans-serif",
              transition: "background 0.15s, transform 0.1s",
              boxShadow: "0 2px 8px rgba(31,61,43,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              opacity: isPending ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isPending) (e.target as HTMLElement).style.background = "linear-gradient(135deg, #3A6B50 0%, #2E5540 60%)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = "linear-gradient(135deg, #2E5540 0%, #1F3D2B 60%)";
            }}
          >
            {isPending ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <div style={{
          marginTop: "22px",
          fontSize: "12px",
          color: "var(--ink-soft)",
          fontFamily: "'Public Sans', sans-serif",
        }}>
          Lupa kata sandi? Hubungi pengurus karang taruna.
        </div>
      </div>
    </div>
  );
}
