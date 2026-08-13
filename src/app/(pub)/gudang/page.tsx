"use client";

import { useState } from "react";

/**
 * Data inventaris gudang perlengkapan dusun.
 * Field jumlah dan keterangan暂时 dihilangkan karena belum diverifikasi.
 * Struktur data预留field untuk masa depan.
 */
const inventaris = [
  { id: 1, nama: "Tratak / Tenda", kategori: "Tenda" },
  { id: 2, nama: "Meja Lipat", kategori: "Meja" },
  { id: 3, nama: "Kursi Plastik", kategori: "Kursi" },
  { id: 4, nama: "Panggung Acara", kategori: "Panggung" },
];

// Generate kategori list dynamically dari data (tanpa duplikat)
const generateKategori = () => {
  const kategoriSet = new Set(inventaris.map((item) => item.kategori));
  return ["Semua", ...Array.from(kategoriSet)];
};

const kategoriList = generateKategori();

export default function GudangPage() {
  const [selectedKategori, setSelectedKategori] = useState("Semua");

  const filteredInventaris = inventaris.filter((item) => {
    return selectedKategori === "Semua" || item.kategori === selectedKategori;
  });

  return (
    <div>
      {/* Hero */}
      <section
        className="py-16 md:py-24"
        style={{ background: "linear-gradient(180deg, var(--surf) 0%, var(--bg) 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}
          >
            Gudang <span style={{ color: "var(--brass)" }}>Perlengkapan</span>
          </h1>
          <p className="text-lg" style={{ color: "var(--text2)" }}>
            Daftar perlengkapan dusun yang bisa dipinjam warga untuk keperluan kegiatan
          </p>
        </div>
      </section>

      {/* Kategori Filter */}
      <section className="pb-8 -mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="p-4 rounded-2xl flex flex-wrap justify-center gap-2"
            style={{ background: "var(--surf)", border: "1px solid var(--bdr)" }}
          >
            {kategoriList.map((kat) => (
              <button
                key={kat}
                onClick={() => setSelectedKategori(kat)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: selectedKategori === kat ? "var(--brass)" : "transparent",
                  color: selectedKategori === kat ? "var(--paper)" : "var(--text2)",
                }}
              >
                {kat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Daftar Perlengkapan */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {filteredInventaris.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl flex items-center justify-between transition-all duration-200"
                style={{ background: "var(--surf)", border: "1px solid var(--bdr)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--brass-soft)" }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: "var(--brass)" }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                  </div>
                  <h3 className="font-medium" style={{ color: "var(--ink)" }}>
                    {item.nama}
                  </h3>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: "var(--acc2)", color: "var(--brass)" }}
                >
                  {item.kategori}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kontak Peminjaman */}
      <section className="py-12" style={{ background: "var(--surf2)" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="p-6 rounded-2xl text-center"
            style={{ background: "var(--surf)", border: "1px solid var(--bdr)" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--green)" }}
            >
              <svg
                className="w-8 h-8 text-[var(--paper)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}
            >
              Kontak Peminjaman
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--text2)" }}>
              Hubungi untuk cek ketersediaan dan proses peminjaman perlengkapan dusun.
            </p>
            <div className="space-y-2">
              <p className="font-medium" style={{ color: "var(--green)" }}>
                Rizki
              </p>
              <p className="text-sm" style={{ color: "var(--text2)" }}>
                Penanggung Jawab Gudang
              </p>
              <a
                href="https://wa.me/6281234567890?text=Hubungi%20mengenai%20peminjaman%20perlengkapan%20Dusun%20Blembeng"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-xl font-medium transition-all duration-200"
                style={{ background: "#25D366", color: "white" }}
              >
                Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
