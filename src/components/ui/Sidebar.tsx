"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/providers/LangProvider";
import {
  LayoutDashboard, Users, Recycle,
  Tag, Banknote, BarChart2, Lightbulb,
} from "lucide-react";

const navItems = [
  { href: "/",          labelKey: "dashboard" as const, Icon: LayoutDashboard },
  { href: "/nasabah",   labelKey: "nasabah"   as const, Icon: Users           },
  { href: "/transaksi", labelKey: "setoran"   as const, Icon: Recycle         },
  { href: "/harga",     labelKey: "harga"     as const, Icon: Tag             },
  { href: "/penarikan", labelKey: "penarikan" as const, Icon: Banknote        },
  { href: "/laporan",   labelKey: "laporan"   as const, Icon: BarChart2       },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLang();

  return (
    <aside style={{
      width: "224px", flexShrink: 0,
      background: "var(--surf)",
      borderRight: "1px solid var(--bdr)",
      height: "100vh", display: "flex", flexDirection: "column",
      transition: "background 0.25s",
    }}>
      {/* Logo */}
      <div style={{
        padding: "20px 18px 18px",
        borderBottom: "1px solid var(--bdr)",
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: "var(--p)", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Recycle size={18} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.2px" }}>
            Bank Sampah
          </p>
          <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "1px" }}>
            Desa Kebonagung
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
        <p style={{
          fontSize: "10px", fontWeight: 600, color: "var(--text3)",
          textTransform: "uppercase", letterSpacing: "0.8px",
          padding: "8px 8px 6px", marginBottom: "2px",
        }}>Menu Utama</p>

        {navItems.map(({ href, labelKey, Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: "9px",
              padding: "8px 10px", borderRadius: "8px", marginBottom: "1px",
              fontSize: "13px", fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--p)" : "var(--text3)",
              background: isActive ? "var(--p5)" : "transparent",
              textDecoration: "none", transition: "all 0.15s",
            }}>
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {t[labelKey]}
              {isActive && (
                <div style={{
                  marginLeft: "auto", width: "5px", height: "5px",
                  borderRadius: "50%", background: "var(--p)",
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Tip */}
      <div style={{ padding: "12px", borderTop: "1px solid var(--bdr)" }}>
        <div style={{
          background: "var(--p6)", borderRadius: "8px",
          padding: "10px 12px", border: "1px solid var(--bdr)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
            <Lightbulb size={13} color="var(--p)" strokeWidth={2.5} />
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--p)" }}>{t.panduan}</p>
          </div>
          <p style={{ fontSize: "11px", color: "var(--text3)", lineHeight: 1.5 }}>
            {t.panduanText}
          </p>
        </div>
      </div>
    </aside>
  );
}