"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/providers/LangProvider";

const navItems = [
  { href: "/",          labelKey: "dashboard" as const,  icon: "⊞" },
  { href: "/nasabah",   labelKey: "nasabah" as const,    icon: "👥" },
  { href: "/transaksi", labelKey: "setoran" as const,    icon: "♻️" },
  { href: "/laporan",   labelKey: "laporan" as const,    icon: "📊" },
  { href: "/penarikan", labelKey: "penarikan" as const,  icon: "💵" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "var(--surf)", borderTop: "1px solid var(--bdr)",
      display: "flex", zIndex: 50, transition: "background 0.3s",
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {navItems.map((item) => {
        const isActive = item.href === "/"
          ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", gap: "3px",
            padding: "10px 0", textDecoration: "none",
          }}>
            <div style={{
              width: "36px", height: "32px", borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px",
              background: isActive ? "var(--p5)" : "transparent",
              transition: "all 0.2s",
            }}>{item.icon}</div>
            <span style={{
              fontSize: "9px",
              fontWeight: isActive ? 700 : 500,
              color: isActive ? "var(--p)" : "var(--text3)",
            }}>{t[item.labelKey]}</span>
          </Link>
        );
      })}
    </nav>
  );
}