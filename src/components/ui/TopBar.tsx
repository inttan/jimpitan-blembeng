"use client";
import { useTheme } from "next-themes";
import { useLang } from "@/components/providers/LangProvider";
import { useEffect, useState, useTransition } from "react";
import { Sun, Moon, User, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";

export default function TopBar() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  useEffect(() => setMounted(true), []);

  const date = new Date().toLocaleDateString(
    lang === "id" ? "id-ID" : "en-US",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <header style={{
      background: "var(--surf)",
      borderBottom: "1px solid var(--bdr)",
      padding: "0 24px", height: "54px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      transition: "background 0.25s",
      flexShrink: 0, gap: "12px",
    }}>
      <p style={{ fontSize: "13px", color: "var(--text3)", fontWeight: 500 }}>
        {date}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Lang toggle */}
        <div style={{
          display: "flex",
          background: "var(--surf2)",
          border: "1px solid var(--bdr)",
          borderRadius: "8px", overflow: "hidden", padding: "2px", gap: "2px",
        }}>
          {(["id", "en"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: "4px 10px",
              fontSize: "11px", fontWeight: 600,
              border: "none", cursor: "pointer",
              borderRadius: "6px",
              transition: "all 0.15s",
              background: lang === l ? "var(--p)" : "transparent",
              color: lang === l ? "#fff" : "var(--text3)",
            }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Dark mode */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{
              width: "32px", height: "32px", borderRadius: "8px",
              border: "1px solid var(--bdr)", background: "var(--surf2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.15s", color: "var(--text3)",
            }}>
            {theme === "dark"
              ? <Sun size={14} strokeWidth={2} />
              : <Moon size={14} strokeWidth={2} />}
          </button>
        )}

        {/* Admin badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: "7px",
          background: "var(--surf2)", borderRadius: "8px",
          padding: "5px 12px 5px 8px",
          border: "1px solid var(--bdr)",
        }}>
          <div style={{
            width: "24px", height: "24px", borderRadius: "6px",
            background: "var(--p)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <User size={13} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>
            Admin
          </span>
        </div>

        {/* Logout button */}
        <button
          onClick={() => startTransition(() => logout())}
          disabled={isPending}
          title="Keluar"
          style={{
            width: "32px", height: "32px", borderRadius: "8px",
            border: "1px solid var(--bdr)", background: "var(--surf2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: isPending ? "wait" : "pointer",
            transition: "all 0.15s", color: "var(--text3)",
            opacity: isPending ? 0.6 : 1,
          }}
        >
          <LogOut size={14} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
