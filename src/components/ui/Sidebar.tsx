"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/providers/LangProvider";

const navItems = [
  { href: "/jimpitan",   labelKey: "dashboard" as const, icon: "◆" },
  { href: "/transaksi",  labelKey: "setoran"   as const, icon: "▤" },
  { href: "/warga",      labelKey: "warga"     as const, icon: "◍" },
  { href: "/kas",        labelKey: "kas"       as const, icon: "⬒" },
  { href: "/laporan",    labelKey: "laporan"   as const, icon: "▥" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLang();

  return (
    <aside style={{
      width: "220px",
      flexShrink: 0,
      background: "linear-gradient(180deg, #1F3D2B 0%, #142A1D 100%)",
      color: "#EDE7D6",
      padding: "22px 16px",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
    }}>
      {/* Brand */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "0 6px 22px",
        borderBottom: "1px solid rgba(237,231,214,0.12)",
        marginBottom: "18px",
      }}>
        {/* Coin logo dengan radial glow + shine */}
        <div style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #F0D98A 0%, #C9943E 30%, #8A6428 60%, #B8863B 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 12px rgba(184,134,59,0.5), 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
          flexShrink: 0,
          position: "relative",
        }}>
          {/* Shine highlight */}
          <div style={{
            position: "absolute",
            top: "4px",
            left: "6px",
            width: "10px",
            height: "6px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.45)",
            filter: "blur(2px)",
          }} />
          <span style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: "13px",
            color: "#1F3D2B",
            lineHeight: 1,
            position: "relative",
            zIndex: 1,
            textShadow: "0 0 4px rgba(255,255,255,0.3)",
          }}>Rp</span>
        </div>
        <div>
          <div style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "15px",
            fontWeight: 600,
            lineHeight: 1.1,
            color: "#EDE7D6",
          }}>Jimpitan</div>
          <div style={{ fontSize: "11px", color: "#9DAE9C" }}>Dusun Blembeng</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
        {navItems.map(({ href, labelKey, icon }) => {
          const isActive = href === "/jimpitan" ? pathname === "/jimpitan" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "13.5px",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#F6F3EA" : "#D9D3C0",
                background: isActive ? "#B8863B" : "transparent",
                textDecoration: "none",
                fontFamily: "'Public Sans', sans-serif",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(237,231,214,0.08)";
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#D9D3C0";
                }
              }}
            >
              <span style={{ width: "16px", textAlign: "center", opacity: isActive ? 1 : 0.85 }}>
                {icon}
              </span>
              {t[labelKey]}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        fontSize: "12px",
        color: "#9DAE9C",
        padding: "14px 6px 0",
        borderTop: "1px solid rgba(237,231,214,0.10)",
        marginTop: "12px",
        fontFamily: "'Public Sans', sans-serif",
        lineHeight: 1.5,
        wordBreak: "break-word",
      }}>
        Masuk sebagai<br />
        <b style={{ color: "#EDE7D6", fontWeight: 600, fontSize: "13px" }}>Kadus Blembeng</b>
      </div>
    </aside>
  );
}
