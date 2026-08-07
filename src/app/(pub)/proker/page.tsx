"use client";

import { useState } from "react";

const programKerja = [
  {
    id: "jimpitan",
    title: "Jimpitan Mingguan",
    desc: "Iuran wajib mingguan warga untuk kas kegiatan dusun",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
    color: "#1F3D2B",
    timeline: [
      { bulan: "Januari", kegiatan: "Evaluasi kas tahun sebelumnya" },
      { bulan: "Februari", kegiatan: "Penetapan target setoran tahunan" },
      { bulan: "Maret", kegiatan: "Monitoring setoran reguler" },
      { bulan: "April", kegiatan: "Rekap triwulan" },
      { bulan: "Mei", kegiatan: "Monitoring setoran reguler" },
      { bulan: "Juni", kegiatan: "Evaluasi semester awal" },
      { bulan: "Juli", kegiatan: "Monitoring setoran reguler" },
      { bulan: "Agustus", kegiatan: "Siap-siap kegiatan Agustusan" },
      { bulan: "September", kegiatan: "Rekap triwulan" },
      { bulan: "Oktober", kegiatan: "Monitoring setoran reguler" },
      { bulan: "November", kegiatan: "Persiapan akhir tahun" },
      { bulan: "Desember", kegiatan: "Rapat akhir tahun & laporan" },
    ],
  },
  {
    id: "gudang",
    title: "Pengelolaan Gudang",
    desc: "Penyimpanan dan peminjaman perlengkapan dusun",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    color: "#B8863B",
    timeline: [
      { bulan: "Januari", kegiatan: "Inventaris tahunan" },
      { bulan: "Februari", kegiatan: "Perbaikan perlengkapan rusak" },
      { bulan: "Maret", kegiatan: "Pencatatan peminjaman" },
      { bulan: "April", kegiatan: "Pembersihan gudang" },
      { bulan: "Mei", kegiatan: "Pencatatan peminjaman" },
      { bulan: "Juni", kegiatan: "Evaluasi kondisi inventaris" },
      { bulan: "Juli", kegiatan: "Pencatatan peminjaman" },
      { bulan: "Agustus", kegiatan: "Siap-siap perlengkapan Agustusan" },
      { bulan: "September", kegiatan: "Pencatatan peminjaman" },
      { bulan: "Oktober", kegiatan: "Pembersihan akhir tahun" },
      { bulan: "November", kegiatan: "Pengadaan perlengkapan baru" },
      { bulan: "Desember", kegiatan: "Stock opname akhir tahun" },
    ],
  },
  {
    id: "nyinom",
    title: "Program Nyinom",
    desc: "Regenerasi dan pemberdayaan pemuda karang taruna",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>,
    color: "#A13D3D",
    timeline: [
      { bulan: "Januari", kegiatan: "Regenerasi pengurus baru" },
      { bulan: "Februari", kegiatan: "Pelatihan kepemimpinan" },
      { bulan: "Maret", kegiatan: "Kerja bakti bulanan" },
      { bulan: "April", kegiatan: "Pelatihan organisasi" },
      { bulan: "Mei", kegiatan: "Kerja bakti bulanan" },
      { bulan: "Juni", kegiatan: "Persiapan anggota baru" },
      { bulan: "Juli", kegiatan: "Kerja bakti bulanan" },
      { bulan: "Agustus", kegiatan: "Aktif dalam kegiatan Agustusan" },
      { bulan: "September", kegiatan: "Evaluasi program" },
      { bulan: "Oktober", kegiatan: "Kerja bakti bulanan" },
      { bulan: "November", kegiatan: "Rapat akhir tahun" },
      { bulan: "Desember", kegiatan: "Persiapan program tahun depan" },
    ],
  },
  {
    id: "agustusan",
    title: "Program Agustusan",
    desc: "Rangkaian kegiatan memperingati kemerdekaan RI",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    color: "#C4622D",
    timeline: [
      { bulan: "Juni", kegiatan: "Pembentukan panitia" },
      { bulan: "Juli", kegiatan: "Persiapan perlengkapan & venues" },
      { bulan: "1-17 Agustus", kegiatan: "Rangkaian kegiatan HTD" },
      { bulan: "17 Agustus", kegiatan: "Puncak peringatan kemerdekaan" },
      { bulan: "Agustus-End", kegiatan: "Evaluasi & laporan" },
    ],
  },
];

function TimelineItem({ bulan, kegiatan, isHighlight, color }: { bulan: string; kegiatan: string; isHighlight: boolean; color: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className="w-4 h-4 rounded-full border-2 z-10" style={{ background: isHighlight ? color : "var(--surf)", borderColor: color }} />
        <div className="w-0.5 h-full -mt-1" style={{ background: "var(--line)" }} />
      </div>
      <div className="flex-1 pb-6" style={{ marginLeft: "-8px" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: isHighlight ? color + "20" : "var(--surf)", color: isHighlight ? color : "var(--text2)" }}>
            {bulan}
          </span>
        </div>
        <p className="text-sm" style={{ color: "var(--ink)" }}>{kegiatan}</p>
      </div>
    </div>
  );
}

export default function ProkerPage() {
  const [activeProker, setActiveProker] = useState(programKerja[0].id);
  const currentProker = programKerja.find((p) => p.id === activeProker) || programKerja[0];

  return (
    <div>
      {/* Hero */}
      <section className="py-16 md:py-24" style={{ background: "linear-gradient(180deg, var(--surf) 0%, var(--bg) 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>
            Program <span style={{ color: "var(--green)" }}>Kerja</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text2)" }}>
            Rencana dan jadwal kegiatan Dusun Blembeng untuk satu tahun penuh
          </p>
        </div>
      </section>

      {/* Program Cards */}
      <section className="pb-8 -mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {programKerja.map((proker) => (
              <button key={proker.id} onClick={() => setActiveProker(proker.id)}
                className="p-5 rounded-xl text-left transition-all duration-300"
                style={{ background: activeProker === proker.id ? proker.color : "var(--surf)", border: activeProker === proker.id ? "none" : "1px solid var(--bdr)", color: activeProker === proker.id ? "var(--paper)" : "var(--ink)", boxShadow: activeProker === proker.id ? "var(--shd2)" : "var(--shd-card)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: activeProker === proker.id ? "rgba(255,255,255,0.2)" : proker.color + "15", color: activeProker === proker.id ? "var(--paper)" : proker.color }}>
                  <div className="w-5 h-5">{proker.icon}</div>
                </div>
                <h3 className="font-semibold mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>{proker.title}</h3>
                <p className="text-xs opacity-80 line-clamp-2">{proker.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="md:col-span-1">
              <div className="sticky top-24 p-6 rounded-2xl" style={{ background: "var(--surf)", border: "1px solid var(--bdr)", boxShadow: "var(--shd-card)" }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: currentProker.color + "15" }}>
                  <div className="w-8 h-8" style={{ color: currentProker.color }}>{currentProker.icon}</div>
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>{currentProker.title}</h2>
                <p className="text-sm mb-6" style={{ color: "var(--text2)" }}>{currentProker.desc}</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2" style={{ background: "var(--surf)", borderColor: currentProker.color }} />
                    <span className="text-sm" style={{ color: "var(--text2)" }}>Aktivitas reguler</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ background: currentProker.color }} />
                    <span className="text-sm" style={{ color: "var(--text2)" }}>Fokus kegiatan</span>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--bdr)" }}>
                  <p className="text-xs" style={{ color: "var(--text3)" }}>Roadmap kegiatan sepanjang tahun {new Date().getFullYear()}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Timeline */}
            <div className="md:col-span-2">
              <div className="p-6 rounded-2xl" style={{ background: "var(--surf)", border: "1px solid var(--bdr)", boxShadow: "var(--shd-card)" }}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: currentProker.color, color: "var(--paper)" }}>24</span>
                  Jadwal Kegiatan Tahunan
                </h3>
                <div className="relative">
                  {currentProker.timeline.map((item, index) => {
                    let isHighlight = false;
                    if (currentProker.id === "jimpitan") isHighlight = item.bulan === "September";
                    else if (currentProker.id === "agustusan") isHighlight = item.bulan.includes("Agustus") || item.bulan.includes("17");
                    else if (currentProker.id === "nyinom") isHighlight = item.bulan === "Januari";
                    return <TimelineItem key={index} {...item} isHighlight={isHighlight} color={currentProker.color} />;
                  })}
                  <div className="w-4 h-4 rounded-full absolute" style={{ left: "6px", top: "24px", bottom: "0", background: "var(--surf)", border: "2px solid var(--line)" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
