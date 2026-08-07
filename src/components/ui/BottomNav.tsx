"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/providers/LangProvider";

const navItems = [
  { href: "/jimpitan",  labelKey: "dashboard" as const },
  { href: "/transaksi", labelKey: "setoran"   as const },
  { href: "/warga",     labelKey: "warga"     as const },
  { href: "/kas",       labelKey: "kas"        as const },
  { href: "/laporan",   labelKey: "laporan"   as const },
];

// Coin logo untuk mobile nav
function CoinLogo({ size = 20 }: { size?: number }) {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      background: "radial-gradient(circle at 35% 30%, #F0D98A 0%, #C9943E 30%, #8A6428 60%, #B8863B 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 8px rgba(184,134,59,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: "'Fraunces', serif",
        fontWeight: 700,
        fontSize: `${size * 0.4}px`,
        color: "#1F3D2B",
        lineHeight: 1,
      }}>Rp</span>
    </div>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "linear-gradient(180deg, #1F3D2B 0%, #142A1D 100%)",
      borderTop: "1px solid rgba(237,231,214,0.15)",
      display: "flex",
      zIndex: 50,
      paddingBottom: "env(safe-area-inset-bottom)",
      height: "64px",
    }}>
      {/* Brand logo di kiri */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        borderRight: "1px solid rgba(237,231,214,0.10)",
      }}>
        <CoinLogo size={28} />
      </div>

      {/* Nav items */}
      <div style={{
        display: "flex",
        flex: 1,
        justifyContent: "space-around",
      }}>
        {navItems.map(({ href, labelKey }) => {
          const isActive = href === "/jimpitan" ? pathname === "/jimpitan" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                padding: "8px 4px",
                textDecoration: "none",
                color: isActive ? "#F6F3EA" : "#D9D3C0",
                fontSize: "9px",
                fontWeight: isActive ? 700 : 500,
                transition: "color 0.15s",
                fontFamily: "'Public Sans', sans-serif",
                background: isActive ? "rgba(184,134,59,0.15)" : "transparent",
              }}
            >
              <span style={{ fontSize: "16px", lineHeight: 1 }}>{isActive ? "●" : "○"}</span>
              <span>{t[labelKey]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
