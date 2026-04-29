"use client";
import { useTheme } from "next-themes";
import { useLang } from "@/components/providers/LangProvider";
import { useEffect, useState } from "react";

export default function TopBar() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const date = new Date().toLocaleDateString(
    lang === "id" ? "id-ID" : "en-US",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <header style={{
      background: "var(--surf)", borderBottom: "1px solid var(--bdr)",
      padding: "0 20px", height: "56px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      transition: "background 0.3s", flexShrink: 0, gap: "12px",
    }}>
      <p style={{ fontSize: "12px", color: "var(--text3)", fontWeight: 500 }}>
        {date}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Language toggle */}
        <div style={{
          display: "flex", border: "1px solid var(--bdr)",
          borderRadius: "20px", overflow: "hidden", background: "var(--surf2)",
        }}>
          {(["id", "en"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: "5px 12px", fontSize: "11px", fontWeight: 600,
              border: "none", cursor: "pointer", transition: "all 0.2s",
              background: lang === l ? "var(--p)" : "transparent",
              color: lang === l ? "#fff" : "var(--text3)",
            }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Dark mode */}
        {mounted && (
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{
              width: "32px", height: "32px", borderRadius: "50%",
              border: "1px solid var(--bdr)", background: "var(--surf2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: "15px", transition: "all 0.2s",
            }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        )}

        {/* Admin */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "var(--surf2)", borderRadius: "20px",
          padding: "5px 12px 5px 6px", border: "1px solid var(--bdr)",
        }}>
          <div style={{
            width: "24px", height: "24px", borderRadius: "50%",
            background: "var(--p)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", fontWeight: 700,
          }}>A</div>
          <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}