"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil" },
  { href: "/struktur", label: "Struktur" },
  { href: "/proker", label: "Program Kerja" },
  { href: "/kalender", label: "Kalender" },
  { href: "/gudang", label: "Gudang" },
];

function RicePlantIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12" />
      <path d="M12 12C12 12 8 8 8 5C8 5 10 3 12 3C14 3 16 5 16 5C16 8 12 12 12 12Z" />
      <path d="M12 8C12 8 6 10 5 13C5 13 7 14 10 12" />
      <path d="M12 8C12 8 18 10 19 13C19 13 17 14 14 12" />
      <path d="M9 15C7 17 6 19 6 21" />
      <path d="M15 15C17 17 18 19 18 21" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="16" x2="20" y2="16" />
    </svg>
  );
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Navbar */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "rgba(246, 243, 234, 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--bdr)",
        }}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Nama */}
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                style={{ background: "var(--green)" }}
              >
                <RicePlantIcon className="w-6 h-6 text-[var(--paper)]" />
              </div>
              <div>
                <span className="font-semibold text-lg" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>
                  Dusun Blembeng
                </span>
                <span className="hidden sm:block text-xs" style={{ color: "var(--text2)" }}>
                  Sistem Kas Kegiatan
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      color: isActive ? "var(--green)" : "var(--text2)",
                      background: isActive ? "var(--p6)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "var(--surf2)";
                        e.currentTarget.style.color = "var(--ink)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--text2)";
                      }
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ml-2"
                style={{
                  background: "var(--brass)",
                  color: "var(--paper)",
                }}
              >
                Login Admin
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: "var(--ink)" }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ${
              mobileMenuOpen ? "max-h-96 pb-4" : "max-h-0"
            }`}
          >
            <div className="flex flex-col gap-1 pt-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      color: isActive ? "var(--green)" : "var(--text2)",
                      background: isActive ? "var(--p6)" : "transparent",
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/login"
                className="px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mt-2"
                style={{
                  background: "var(--brass)",
                  color: "var(--paper)",
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login Admin
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer
        className="mt-16 py-8"
        style={{
          background: "var(--surf2)",
          borderTop: "1px solid var(--bdr)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Logo & Description */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--green)" }}
                >
                  <RicePlantIcon className="w-6 h-6 text-[var(--paper)]" />
                </div>
                <span
                  className="font-semibold text-lg"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}
                >
                  Dusun Blembeng
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>
                Sistem pengelolaan kas kegiatan dan jimpitan mingguan untuk kesejahteraan warga
                {" "}Dusun Blembeng, Desa Purwodadi, Kecamatan Tegalrejo.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--ink)" }}>
                Navigasi
              </h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors"
                      style={{ color: "var(--text2)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--green)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text2)";
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--ink)" }}>
                Kontak
              </h4>
              <div className="space-y-3 text-sm" style={{ color: "var(--text2)" }}>
                <p>Dusun Blembeng</p>
                <p>Desa Purwodadi, Kec. Tegalrejo</p>
                <p>Kabupaten Magelang, Jawa Tengah</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "var(--bdr)" }} />

          {/* Credits */}
          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: "var(--text3)" }}>
              Dikembangkan oleh{" "}
              <span style={{ color: "var(--brass)", fontWeight: 500 }}>Tim KKN UNIMMA 2026</span>{" "}
              bersama{" "}
              <span style={{ color: "var(--green)", fontWeight: 500 }}>Karang Taruna</span>{" "}
              Dusun Blembeng
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
