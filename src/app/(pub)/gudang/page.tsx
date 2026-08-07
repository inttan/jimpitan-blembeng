"use client";

import { useState } from "react";

const inventaris = [
  { id: 1, nama: "Tratak / Tenda Terpal", kategori: "Tenda", jumlah: 3, keterangan: "Tenda ukuran 4x6 meter" },
  { id: 2, nama: "Meja Lipat Plastik", kategori: "Meja", jumlah: 10, keterangan: "Meja plastik lipat kapasitas 8 orang" },
  { id: 3, nama: "Kursi Plastik", kategori: "Kursi", jumlah: 50, keterangan: "Kursi plastik stackable" },
  { id: 4, nama: "Sound System Portable", kategori: "Elektronik", jumlah: 1, keterangan: "Speaker aktif + microphone wireless" },
  { id: 5, nama: "Panggung Modular", kategori: "Panggung", jumlah: 1, keterangan: "Panggung stage 6x4 meter" },
  { id: 6, nama: "Lampion Kerucut", kategori: "Dekorasi", jumlah: 20, keterangan: "Lampion warna-warni" },
  { id: 7, nama: "Genset 1000W", kategori: "Elektronik", jumlah: 1, keterangan: "Generator listrik cadangan" },
  { id: 8, nama: "Kabel Roll 50m", kategori: "Elektronik", jumlah: 2, keterangan: "Kabel extension" },
  { id: 9, nama: "Spanduk / Banner", kategori: "Dekorasi", jumlah: 5, keterangan: "Banner ukuran 3x1 meter" },
  { id: 10, nama: "Cooler Box", kategori: "Pendingin", jumlah: 3, keterangan: "Kotak pendingin" },
  { id: 11, nama: "Gitar Akustik", kategori: "Musik", jumlah: 2, keterangan: "Gitar akustik" },
  { id: 12, nama: "Mic Wireless", kategori: "Elektronik", jumlah: 2, keterangan: "Microphone wireless" },
];

export default function GudangPage() {
  const [selectedKategori, setSelectedKategori] = useState("Semua");

  const kategoriList = ["Semua", "Tenda", "Meja", "Kursi", "Elektronik", "Panggung", "Dekorasi", "Pendingin", "Musik"];

  const filteredInventaris = inventaris.filter((item) => {
    return selectedKategori === "Semua" || item.kategori === selectedKategori;
  });

  return (
    <div>
      {/* Hero */}
      <section className="py-16 md:py-24" style={{ background: "linear-gradient(180deg, var(--surf) 0%, var(--bg) 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>
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
          <div className="p-4 rounded-2xl flex flex-wrap justify-center gap-2" style={{ background: "var(--surf)", border: "1px solid var(--bdr)" }}>
            {kategoriList.map((kat) => (
              <button key={kat} onClick={() => setSelectedKategori(kat)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ background: selectedKategori === kat ? "var(--brass)" : "transparent", color: selectedKategori === kat ? "var(--paper)" : "var(--text2)" }}>
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
              <div key={item.id} className="p-4 rounded-xl flex items-center justify-between transition-all duration-200" style={{ background: "var(--surf)", border: "1px solid var(--bdr)" }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--brass-soft)" }}>
                    <svg className="w-6 h-6" style={{ color: "var(--brass)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium" style={{ color: "var(--ink)" }}>{item.nama}</h3>
                    <p className="text-sm" style={{ color: "var(--text2)" }}>{item.keterangan}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium" style={{ color: "var(--brass)" }}>{item.jumlah} unit</span>
                  <span className="block text-xs" style={{ color: "var(--text3)" }}>{item.kategori}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kontak */}
      <section className="py-12" style={{ background: "var(--surf2)" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 rounded-2xl text-center" style={{ background: "var(--surf)", border: "1px solid var(--bdr)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--green)" }}>
              <svg className="w-8 h-8 text-[var(--paper)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>
              Hubungi Pengurus Gudang
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--text2)" }}>
              Untuk mengajukan peminjaman, silakan hubungi pengurus gudang:
            </p>
            <div className="space-y-2">
              <p className="font-medium" style={{ color: "var(--green)" }}>Wahyu Setiadi</p>
              <p className="text-sm" style={{ color: "var(--text2)" }}>Koordinator Divisi Perlengkapan</p>
              <a href="https://wa.me/6281234567890" className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-xl font-medium transition-all duration-200" style={{ background: "#25D366", color: "white" }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
