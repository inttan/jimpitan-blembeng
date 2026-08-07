import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = {
  title: "Beranda — Dusun Blembeng",
  description: "Sistem kas kegiatan dan jimpitan mingguan untuk kesejahteraan warga Dusun Blembeng",
};

async function getStats() {
  try {
    const supabase = await createClient();
    const currentWeek = new Date();
    currentWeek.setHours(0, 0, 0, 0);
    const day = currentWeek.getDay();
    const diff = currentWeek.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(currentWeek.setDate(diff));

    const [wargaCount, setoranMingguIni, saldoKas] = await Promise.all([
      supabase.from("warga").select("id", { count: "exact", head: true }).eq("status_aktif", true),
      supabase
        .from("jimpitan_transaksi")
        .select("id", { count: "exact", head: true })
        .eq("minggu_ke", monday.toISOString().split("T")[0])
        .eq("status", "lunas"),
      supabase.from("v_saldo_kas").select("saldo_kas_kegiatan").single(),
    ]);

    return {
      totalWarga: wargaCount.count || 0,
      setoranMingguIni: setoranMingguIni.count || 0,
      saldoKas: saldoKas.data?.saldo_kas_kegiatan || 0,
      activeProker: 4,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      totalWarga: 0,
      setoranMingguIni: 0,
      saldoKas: 0,
      activeProker: 4,
    };
  }
}

const programKerja = [
  {
    id: "jimpitan",
    title: "Jimpitan Mingguan",
    desc: "Iuran wajib warga setiap minggu untuk kas kegiatan dusun",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
    color: "#1F3D2B",
    href: "/transaksi",
  },
  {
    id: "gudang",
    title: "Gudang Perlengkapan",
    desc: "Tempat penyimpanan Tratak, panggung, dan perlengkapan dusun",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    color: "#B8863B",
    href: "/gudang",
  },
  {
    id: "nyinom",
    title: "Nyinom",
    desc: "Program regenerasi dan pemberdayaan pemuda karang taruna",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>,
    color: "#A13D3D",
    href: "/proker",
  },
  {
    id: "agustusan",
    title: "Program Agustusan",
    desc: "Rangkaian kegiatan memperingati Hari Ulang Tahun Kemerdekaan RI",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    color: "#C4622D",
    href: "/proker",
  },
];

function formatRupiah(num: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
}

export default async function BerandaPage() {
  const stats = await getStats();

  return (
    <div>
      {/* Hero Section with Rice Field Background */}
      <section className="relative overflow-hidden" style={{ minHeight: "75vh" }}>
        {/* Background Image - Rice Fields from Local */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/hero-sawah.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Dark Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(31,61,43,0.88) 0%, rgba(31,61,43,0.75) 50%, rgba(31,61,43,0.6) 100%)",
          }}
        />
        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 py-20 md:py-28 flex items-center" style={{ minHeight: "75vh" }}>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: "rgba(246,243,234,0.12)", backdropFilter: "blur(8px)", color: "var(--paper)", border: "1px solid rgba(246,243,234,0.2)" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#86EFAC" }} />
              <span className="text-sm font-medium">Selalu Terbuka untuk Warga</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6" style={{ color: "var(--paper)", fontFamily: "var(--font-fraunces)" }}>
              Selamat Datang di<br />
              <span style={{ color: "#86EFAC" }}>Dusun Blembeng</span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed mb-8 max-w-2xl" style={{ color: "rgba(246,243,234,0.9)" }}>
              Bersama membangun dusun melalui pengelolaan kas kegiatan yang transparan dan partisipasi aktif seluruh warga dalam program kerja.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/profil" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200" style={{ background: "var(--paper)", color: "var(--green)" }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                Kenali Dusun Kami
              </Link>
              <Link href="/proker" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200" style={{ background: "rgba(246,243,234,0.15)", color: "var(--paper)", border: "1px solid rgba(246,243,234,0.3)", backdropFilter: "blur(4px)" }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
                Lihat Program Kerja
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200" style={{ background: "var(--brass)", color: "var(--paper)" }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                Masuk Admin
              </Link>
            </div>
          </div>
        </div>
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="var(--bg)" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="p-6 md:p-8 rounded-2xl transition-all duration-300" style={{ background: "var(--surf)", border: "1px solid var(--bdr)", boxShadow: "var(--shd-card)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--p6)" }}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--green)" }}><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>{stats.setoranMingguIni}<span className="text-lg font-normal ml-1" style={{ color: "var(--text2)" }}>KK</span></div>
              <p className="text-sm" style={{ color: "var(--text2)" }}>Sudah setor minggu ini</p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl transition-all duration-300" style={{ background: "var(--surf)", border: "1px solid var(--bdr)", boxShadow: "var(--shd-card)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--acc2)" }}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brass)" }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>{stats.totalWarga}<span className="text-lg font-normal ml-1" style={{ color: "var(--text2)" }}>KK</span></div>
              <p className="text-sm" style={{ color: "var(--text2)" }}>Total Kepala Keluarga</p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl transition-all duration-300" style={{ background: "var(--surf)", border: "1px solid var(--bdr)", boxShadow: "var(--shd-card)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(196,98,45,0.1)" }}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--terracotta)" }}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold mb-1 truncate" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>{formatRupiah(stats.saldoKas)}</div>
              <p className="text-sm" style={{ color: "var(--text2)" }}>Saldo Kas Kegiatan</p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl transition-all duration-300" style={{ background: "var(--surf)", border: "1px solid var(--bdr)", boxShadow: "var(--shd-card)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(161,61,61,0.1)" }}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--red)" }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>{stats.activeProker}<span className="text-lg font-normal ml-1" style={{ color: "var(--text2)" }}>Proker</span></div>
              <p className="text-sm" style={{ color: "var(--text2)" }}>Program Kerja Aktif</p>
            </div>
          </div>
        </div>
      </section>

      {/* Program Kerja Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>Program Kerja Kami</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text2)" }}>Berbagai program kegiatan untuk kebersamaan dan kesejahteraan warga Dusun Blembeng</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programKerja.map((proker) => (
              <Link key={proker.id} href={proker.href} className="group block">
                <div className="h-full p-6 rounded-2xl transition-all duration-300" style={{ background: "var(--surf)", border: "1px solid var(--bdr)", boxShadow: "var(--shd-card)" }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110" style={{ background: proker.color + "15" }}>
                    <div className="w-8 h-8" style={{ color: proker.color }}>{proker.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>{proker.title}</h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text2)" }}>{proker.desc}</p>
                  <div className="flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: proker.color }}>
                    <span>Selengkapnya</span>
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28" style={{ background: "var(--green)" }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--paper)", fontFamily: "var(--font-fraunces)" }}>Transparansi untuk Warga</h2>
          <p className="text-lg md:text-xl mb-8 opacity-90" style={{ color: "var(--paper)" }}>Seluruh data kas kegiatan dan transaksi jimpitan dapat diakses oleh seluruh warga. Bersama kita jaga transparansi dan akuntabilitas.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/kalender" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200" style={{ background: "var(--paper)", color: "var(--green)" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              Lihat Kalender Kegiatan
            </Link>
            <Link href="/struktur" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200" style={{ background: "transparent", color: "var(--paper)", border: "2px solid var(--paper)" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
              Kenali Struktur Kami
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
