"use client";
import { useState, useTransition } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await login(fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f7f4" }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "360px", background: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <h1 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "4px" }}>Bank Sampah Desa Kebonagung</h1>
        <p style={{ fontSize: "13px", color: "#666", marginBottom: "24px" }}>Masuk sebagai pengelola</p>

        {error && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Email</label>
        <input name="email" type="email" required
          style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "14px", boxSizing: "border-box" }} />

        <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Password</label>
        <input name="password" type="password" required
          style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "20px", boxSizing: "border-box" }} />

        <button type="submit" disabled={isPending}
          style={{ width: "100%", padding: "11px", borderRadius: "8px", border: "none", background: "#166534", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer", opacity: isPending ? 0.7 : 1 }}>
          {isPending ? "Masuk..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
