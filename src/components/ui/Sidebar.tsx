"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/providers/LangProvider";

const navItems = [
  { href: "/",          labelKey: "dashboard" as const,  icon: "⊞" },
  { href: "/nasabah",   labelKey: "nasabah" as const,    icon: "👥" },
  { href: "/transaksi", labelKey: "setoran" as const,    icon: "♻️" },
  { href: "/harga",     labelKey: "harga" as const,      icon: "🏷️" },
  { href: "/penarikan", labelKey: "penarikan" as const,  icon: "💵" },
  { href: "/laporan",   labelKey: "laporan" as const,    icon: "📊" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLang();

  return (
    <aside style={{
      width: "220px", flexShrink: 0,
      background: "var(--surf)", borderRight: "1px solid var(--bdr)",
      height: "100vh", display: "flex", flexDirection: "column",
      transition: "background 0.3s",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 18px", borderBottom: "1px solid var(--bdr)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "12px",
            background: "var(--p)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "20px", flexShrink: 0,
          }}>♻</div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
              Bank Sampah
            </p>
            <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px" }}>
              Desa Kebonagung
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        <p style={{
          fontSize: "10px", fontWeight: 600, color: "var(--text3)",
          textTransform: "uppercase", letterSpacing: "0.8px",
          padding: "0 8px", marginBottom: "8px",
        }}>Menu Utama</p>

        {navItems.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 10px", borderRadius: "10px", marginBottom: "2px",
              fontSize: "13px", fontWeight: isActive ? 600 : 400,
              color: isActive ? "var(--p)" : "var(--text2)",
              background: isActive ? "var(--p5)" : "transparent",
              textDecoration: "none", transition: "all 0.2s",
            }}>
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {t[item.labelKey]}
              {isActive && (
                <span style={{
                  marginLeft: "auto", width: "6px", height: "6px",
                  borderRadius: "50%", background: "var(--p)",
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Tip box */}
      <div style={{ padding: "12px", borderTop: "1px solid var(--bdr)" }}>
        <div style={{ background: "var(--p5)", borderRadius: "10px", padding: "10px 12px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--p)" }}>
            💡 {t.panduan}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text2)", marginTop: "4px", lineHeight: 1.5 }}>
            {t.panduanText}
          </p>
        </div>
      </div>
    </aside>
  );
}