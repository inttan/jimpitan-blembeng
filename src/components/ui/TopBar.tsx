"use client";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLang } from "@/components/providers/LangProvider";
import { useTransition } from "react";
import { Sun, Moon, LogOut, Home } from "lucide-react";
import { logout } from "@/app/actions/auth";

export default function TopBar() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();
  const [isPending, startTransition] = useTransition();

  const date = new Date().toLocaleDateString(
    lang === "id" ? "id-ID" : "en-US",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <header style={{
      background: "var(--paper-raised)",
      borderBottom: "1px solid var(--line)",
      padding: "0 24px",
      height: "54px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
      gap: "12px",
      boxShadow: "0 1px 3px rgba(38,36,30,0.06), 0 4px 12px rgba(38,36,30,0.05)",
      position: "relative",
      zIndex: 10,
    }}>
      <p style={{ fontSize: "13px", color: "var(--ink-soft)", fontWeight: 500 }}>
        {date}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Lang toggle */}
        <div style={{
          display: "flex",
          background: "var(--surf2)",
          border: "1px solid var(--line)",
          borderRadius: "8px",
          overflow: "hidden",
          padding: "2px",
          gap: "2px",
        }}>
          {(["id", "en"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              borderRadius: "6px",
              transition: "all 0.15s",
              background: lang === l ? "var(--green)" : "transparent",
              color: lang === l ? "#F6F3EA" : "var(--ink-soft)",
              fontFamily: "'Public Sans', sans-serif",
            }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            border: "1px solid var(--line)",
            background: "var(--surf2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s",
            color: "var(--ink-soft)",
          }}
        >
          {theme === "dark"
            ? <Sun size={14} strokeWidth={2} />
            : <Moon size={14} strokeWidth={2} />}
        </button>

        {/* Kembali ke Website */}
        <Link
          href="/"
          title="Website"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            border: "1px solid var(--line)",
            background: "var(--surf2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s",
            color: "var(--green)",
            textDecoration: "none",
          }}
        >
          <Home size={14} strokeWidth={2} />
        </Link>

        {/* Logout */}
        <button
          onClick={() => startTransition(() => logout())}
          title="Keluar"
          disabled={isPending}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            border: "1px solid var(--line)",
            background: "var(--surf2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isPending ? "wait" : "pointer",
            transition: "all 0.15s",
            color: isPending ? "var(--brass)" : "var(--ink-soft)",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          <LogOut size={14} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
