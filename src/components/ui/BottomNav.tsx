"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/providers/LangProvider";
import { LayoutDashboard, Users, Recycle, BarChart2, Banknote } from "lucide-react";

const navItems = [
  { href: "/",          labelKey: "dashboard" as const, Icon: LayoutDashboard },
  { href: "/nasabah",   labelKey: "nasabah"   as const, Icon: Users           },
  { href: "/transaksi", labelKey: "setoran"   as const, Icon: Recycle         },
  { href: "/laporan",   labelKey: "laporan"   as const, Icon: BarChart2       },
  { href: "/penarikan", labelKey: "penarikan" as const, Icon: Banknote        },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLang();

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "var(--surf)",
      borderTop: "1px solid var(--bdr)",
      display: "flex", zIndex: 50,
      transition: "background 0.25s",
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {navItems.map(({ href, labelKey, Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", gap: "4px",
            padding: "10px 0 8px", textDecoration: "none",
          }}>
            <div style={{
              width: "36px", height: "32px", borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: isActive ? "var(--p5)" : "transparent",
              transition: "all 0.15s",
              color: isActive ? "var(--p)" : "var(--text3)",
            }}>
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span style={{
              fontSize: "10px",
              fontWeight: isActive ? 700 : 500,
              color: isActive ? "var(--p)" : "var(--text3)",
            }}>
              {t[labelKey]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}