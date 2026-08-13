"use client";

import { useState } from "react";

/**
 * Data program kerja dusun.
 * TODO #1: Timeline Jimpitan - konfirmasi bulan pasti Musyawarah dengan pengurus.
 * TODO #2: Pertimbangkan memindahkan ke file data terpisah (json/ts) agar mudah diupdate.
 */

// ============================================================================
// TYPE DEFINITIONS - Discriminated Union
// ============================================================================

type TimelineItem = { bulan: string; kegiatan: string };
type JadwalRutinItem = { hari: string; kegiatan: string };

interface ProkerBase {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

interface ProkerTahunan extends ProkerBase {
  type: "tahunan";
  timeline: TimelineItem[];
}

interface ProkerRutin extends ProkerBase {
  type: "rutin";
  jadwal: JadwalRutinItem[];
}

type Proker = ProkerTahunan | ProkerRutin;

// ============================================================================
// DATA
// ============================================================================

const programKerja: Proker[] = [
  {
    id: "jimpitan",
    type: "tahunan",
    title: "Jimpitan & Kas Dumont",
    desc: "Iuran wajib mingguan warga untuk kas kegiatan dusun",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    color: "#1F3D2B",
    // TODO: Konfirmasi bulan pasti Musyawarah Dumont dengan pengurus
    timeline: [
      { bulan: "Januari", kegiatan: "Evaluasi kas & rencana tahunan" },
      { bulan: "Februari", kegiatan: "Kumpulan Jimpitan & Karang Taruna (evaluasi 2 bulanan)" },
      { bulan: "Maret", kegiatan: "Musyawarah Dumont — laporan jimpitan triwulan" },
      { bulan: "April", kegiatan: "Kumpulan Jimpitan & Karang Taruna" },
      { bulan: "Mei", kegiatan: "Kegiatan rutin berjalan seperti biasa" },
      { bulan: "Juni", kegiatan: "Kumpulan Jimpitan & Karang Taruna + Musyawarah Dumont triwulan" },
      { bulan: "Juli", kegiatan: "Kegiatan rutin berjalan seperti biasa" },
      { bulan: "Agustus", kegiatan: "Kumpulan Jimpitan & Karang Taruna, persiapan Agustusan" },
      { bulan: "September", kegiatan: "Musyawarah Dumont — laporan jimpitan triwulan" },
      { bulan: "Oktober", kegiatan: "Kumpulan Jimpitan & Karang Taruna" },
      { bulan: "November", kegiatan: "Persiapan akhir tahun" },
      { bulan: "Desember", kegiatan: "Kumpulan Jimpitan & Karang Taruna + Musyawarah Dumont & laporan akhir tahun" },
    ],
  },
  {
    id: "rutin",
    type: "rutin",
    title: "Kegiatan Rutin Sosial-Keagamaan",
    desc: "Rangkaian kegiatan rutin mingguan yang menjadi rutinitas warga",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    color: "#4A7C59",
    jadwal: [
      { hari: "Kamis malam (malam Jumat)", kegiatan: "Yasinan Bapak-bapak" },
      { hari: "Jumat malam (malam Sabtu)", kegiatan: "Yasinan Ibu-ibu" },
      { hari: "Minggu malam (malam Senin)", kegiatan: "Ndibaan" },
      { hari: "Minggu Pon (siklus 35 hari)", kegiatan: "Bank Sampah" },
    ],
  },
  {
    id: "gudang",
    type: "tahunan",
    title: "Pengelolaan Gudang",
    desc: "Penyimpanan dan peminjaman perlengkapan dusun",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    color: "#B8863B",
    timeline: [
      { bulan: "Januari", kegiatan: "Inventarisasi tahunan" },
      { bulan: "Februari", kegiatan: "Perbaikan perlengkapan rusak" },
      { bulan: "Maret", kegiatan: "Pencatatan peminjaman" },
      { bulan: "April", kegiatan: "Pembersihan gudang" },
      { bulan: "Mei", kegiatan: "Pencatatan peminjaman" },
      { bulan: "Juni", kegiatan: "Evaluasi kondisi inventaris" },
      { bulan: "Juli", kegiatan: "Pencatatan peminjaman" },
      { bulan: "Agustus", kegiatan: "Persiapan perlengkapan Agustusan" },
      { bulan: "September", kegiatan: "Pencatatan peminjaman" },
      { bulan: "Oktober", kegiatan: "Pembersihan akhir tahun" },
      { bulan: "November", kegiatan: "Pengadaan perlengkapan baru" },
      { bulan: "Desember", kegiatan: "Stock opname akhir tahun" },
    ],
  },
  {
    id: "nyinom",
    type: "tahunan",
    title: "Program Nyinom",
    desc: "Rencana pengembangan program regenerasi dan pemberdayaan pemuda karang taruna",
    badge: "Rencana Pengembangan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    color: "#A13D3D",
    timeline: [
      { bulan: "Januari", kegiatan: "Perencanaan program regenerasi" },
      { bulan: "Februari", kegiatan: "Identifikasi pemuda potensial" },
      { bulan: "Maret", kegiatan: "Rapat koordinasi Karang Taruna" },
      { bulan: "April", kegiatan: "Penyusunan rencana kerja" },
      { bulan: "Mei", kegiatan: "Konsultasi dengan Pembina" },
      { bulan: "Juni", kegiatan: "Persiapan pelaksanaan program" },
      { bulan: "Juli", kegiatan: "Pelatihan dasar kepemimpinan" },
      { bulan: "Agustus", kegiatan: "Pelaksanaan program regenerasi" },
      { bulan: "September", kegiatan: "Evaluasi & penyesuaian program" },
      { bulan: "Oktober", kegiatan: " Dokumentasi hasil program" },
      { bulan: "November", kegiatan: "Rapat evaluasi tahunan" },
      { bulan: "Desember", kegiatan: "Penyusunan rencana tahun depan" },
    ],
  },
  {
    id: "agustusan",
    type: "tahunan",
    title: "Program Agustusan",
    desc: "Rangkaian kegiatan memperingati kemerdekaan RI",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
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

// ============================================================================
// COMPONENTS
// ============================================================================

function TimelineItem({ bulan, kegiatan, isHighlight, color }: { bulan: string; kegiatan: string; isHighlight: boolean; color: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div
          className="w-4 h-4 rounded-full border-2 z-10"
          style={{
            background: isHighlight ? color : "var(--surf)",
            borderColor: color,
          }}
        />
        <div className="w-0.5 h-full -mt-1" style={{ background: "var(--line)" }} />
      </div>
      <div className="flex-1 pb-6" style={{ marginLeft: "-8px" }}>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{
              background: isHighlight ? color + "20" : "var(--surf)",
              color: isHighlight ? color : "var(--text2)",
            }}
          >
            {bulan}
          </span>
        </div>
        <p className="text-sm" style={{ color: "var(--ink)" }}>
          {kegiatan}
        </p>
      </div>
    </div>
  );
}

function RecurringItem({ hari, kegiatan, color }: { hari: string; kegiatan: string; color: string }) {
  return (
    <div
      className="flex items-start gap-4 p-4 rounded-xl transition-all duration-200"
      style={{ background: "var(--surf)", border: "1px solid var(--bdr)" }}
    >
      <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          {kegiatan}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text2)" }}>
          {hari}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ProkerPage() {
  const [activeProker, setActiveProker] = useState(programKerja[0].id);
  const currentProker = programKerja.find((p) => p.id === activeProker) || programKerja[0];
  const currentYear = new Date().getFullYear();

  // Tentukan isHighlight: highlight SEMUA bulan yang berisi "Musyawarah Dumont"
  const isMusyawarah = (kegiatan: string) => kegiatan.toLowerCase().includes("musyawarah");

  // Helper untuk render badge (hanya untuk proker yang punya badge)
  const hasBadge = "badge" in currentProker && currentProker.badge !== undefined;
  const badgeText = hasBadge ? (currentProker as { badge: string }).badge : undefined;

  // Helper untuk cek tipe (discriminated union narrowing)
  const isTahunan = currentProker.type === "tahunan";
  const isRutin = currentProker.type === "rutin";

  return (
    <div>
      {/* Hero */}
      <section
        className="py-16 md:py-24"
        style={{ background: "linear-gradient(180deg, var(--surf) 0%, var(--bg) 100%)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}
          >
            Program <span style={{ color: "var(--green)" }}>Kerja</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text2)" }}>
            Rencana dan jadwal kegiatan Dumont Blembeng untuk satu tahun penuh
          </p>
        </div>
      </section>

      {/* Program Cards */}
      <section className="pb-8 -mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {programKerja.map((proker) => (
              <button
                key={proker.id}
                onClick={() => setActiveProker(proker.id)}
                className="p-5 rounded-xl text-left transition-all duration-300 relative"
                style={{
                  background: activeProker === proker.id ? proker.color : "var(--surf)",
                  border: activeProker === proker.id ? "none" : "1px solid var(--bdr)",
                  color: activeProker === proker.id ? "var(--paper)" : "var(--ink)",
                  boxShadow: activeProker === proker.id ? "var(--shd2)" : "var(--shd-card)",
                }}
              >
                {/* Badge untuk program rencana */}
                {"badge" in proker && proker.badge && (
                  <span
                    className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: activeProker === proker.id ? "rgba(255,255,255,0.25)" : "var(--acc2)",
                      color: activeProker === proker.id ? "var(--paper)" : "var(--brass)",
                    }}
                  >
                    {proker.badge}
                  </span>
                )}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{
                    background:
                      activeProker === proker.id ? "rgba(255,255,255,0.2)" : proker.color + "15",
                    color: activeProker === proker.id ? "var(--paper)" : proker.color,
                  }}
                >
                  <div className="w-5 h-5">{proker.icon}</div>
                </div>
                <h3 className="font-semibold mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
                  {proker.title}
                </h3>
                <p className="text-xs opacity-80 line-clamp-2">{proker.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Program */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Info */}
            <div className="md:col-span-1">
              <div
                className="sticky top-24 p-6 rounded-2xl"
                style={{ background: "var(--surf)", border: "1px solid var(--bdr)", boxShadow: "var(--shd-card)" }}
              >
                {/* Badge untuk program rencana */}
                {badgeText && (
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                    style={{ background: "var(--acc2)", color: "var(--brass)" }}
                  >
                    {badgeText}
                  </span>
                )}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: currentProker.color + "15" }}
                >
                  <div className="w-8 h-8" style={{ color: currentProker.color }}>
                    {currentProker.icon}
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>
                  {currentProker.title}
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--text2)" }}>
                  {currentProker.desc}
                </p>

                {isTahunan && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border-2"
                        style={{ background: "var(--surf)", borderColor: currentProker.color }}
                      />
                      <span className="text-sm" style={{ color: "var(--text2)" }}>
                        Aktivitas reguler
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ background: currentProker.color }} />
                      <span className="text-sm" style={{ color: "var(--text2)" }}>
                        Fokus kegiatan
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--bdr)" }}>
                  <p className="text-xs" style={{ color: "var(--text3)" }}>
                    {isRutin
                      ? "Jadwal kegiatan rutin mingguan"
                      : `Roadmap kegiatan sepanjang tahun ${currentYear}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Timeline */}
            <div className="md:col-span-2">
              <div
                className="p-6 rounded-2xl"
                style={{ background: "var(--surf)", border: "1px solid var(--bdr)", boxShadow: "var(--shd-card)" }}
              >
                <h3
                  className="text-xl font-bold mb-6 flex items-center gap-3"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}
                >
                  {isRutin ? "Jadwal Mingguan" : `Jadwal Kegiatan ${currentYear}`}
                </h3>

                {/* Render berdasarkan tipe - TypeScript narrowing works here */}
                {isRutin ? (
                  /* ProkerRutin: render jadwal rutin */
                  <div className="space-y-3">
                    {(currentProker as ProkerRutin).jadwal.map((item, index) => (
                      <RecurringItem
                        key={index}
                        hari={item.hari}
                        kegiatan={item.kegiatan}
                        color={currentProker.color}
                      />
                    ))}
                  </div>
                ) : (
                  /* ProkerTahunan: render timeline bulanan */
                  <div className="relative">
                    {(currentProker as ProkerTahunan).timeline.map((item, index) => {
                      const highlight = isMusyawarah(item.kegiatan);
                      return (
                        <TimelineItem
                          key={index}
                          bulan={item.bulan}
                          kegiatan={item.kegiatan}
                          isHighlight={highlight}
                          color={currentProker.color}
                        />
                      );
                    })}
                    <div
                      className="w-4 h-4 rounded-full absolute"
                      style={{ left: "6px", top: "24px", bottom: "0", background: "var(--surf)", border: "2px solid var(--line)" }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
