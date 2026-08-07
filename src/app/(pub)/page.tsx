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
      {/* Hero Section - Redesigned */}
      <section className="relative overflow-hidden" style={{ minHeight: "100vh" }}>
        {/* Background Image */}
        <div className="absolute inset-0" style={{ backgroundImage: "url('/images/hero-sawah.jpeg')", backgroundSize: "cover", backgroundPosition: "center top" }} />

        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(31,61,43,0.85) 0%, rgba(31,61,43,0.7) 30%, rgba(31,61,43,0.6) 60%, rgba(31,61,43,0.8) 100%)" }} />

        {/* Decorative Glow - Top Left */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full animate-glow-pulse" style={{ background: "radial-gradient(circle, #86EFAC 0%, transparent 70%)", opacity: 0.15, filter: "blur(40px)" }} />

        {/* Decorative Glow - Bottom Right */}
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full animate-glow-pulse" style={{ background: "radial-gradient(circle, #B8863B 0%, transparent 70%)", opacity: 0.12, filter: "blur(60px)", animationDelay: "1s" }} />

        {/* Content - Centered */}
        <div className="relative flex items-center justify-center min-h-screen px-6">
          <div className="max-w-4xl text-center">
            {/* Location Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl mb-8 animate-fade-in-down" style={{ background: "rgba(246,243,234,0.08)", backdropFilter: "blur(12px)", color: "var(--paper)", border: "1px solid rgba(246,243,234,0.15)" }}>
              <div className="relative">
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "#86EFAC" }} />
                <span className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping" style={{ background: "#86EFAC", opacity: 0.5 }} />
              </div>
              <span className="text-sm font-medium tracking-wide">Dusun Blembeng, Desa Purwodadi, Kecamatan Tegalrejo</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold leading-none mb-8 animate-fade-in-up" style={{ color: "var(--paper)", fontFamily: "var(--font-fraunces)", animationDelay: "0.2s" }}>
              <span className="block text-2xl md:text-3xl lg:text-4xl font-normal mb-4 opacity-80" style={{ fontFamily: "var(--font-public)", letterSpacing: "0.2em" }}>SELAMAT DATANG DI</span>
              <span className="block" style={{ background: "linear-gradient(135deg, #F6F3EA 0%, #86EFAC 50%, #F6F3EA 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>DUSUN BLEMBENG</span>
            </h1>

            {/* Tagline */}
            <p className="text-lg md:text-2xl leading-relaxed mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ color: "rgba(246,243,234,0.85)", animationDelay: "0.4s" }}>
              Bersama membangun dusun melalui <span className="font-semibold" style={{ color: "#86EFAC" }}>pengelolaan kas kegiatan</span> yang transparan dan partisipasi aktif seluruh warga dalam program kerja.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-5 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
              <Link href="/profil" className="group inline-flex items-center gap-3 px-7 py-4 rounded-2xl font-semibold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ background: "var(--paper)", color: "var(--green)", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
                <span className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: "var(--green)", color: "var(--paper)" }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                </span>
                Kenali Dusun Kami
              </Link>

              <Link href="/proker" className="group inline-flex items-center gap-3 px-7 py-4 rounded-2xl font-semibold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ background: "rgba(246,243,234,0.1)", color: "var(--paper)", border: "1px solid rgba(246,243,234,0.2)", backdropFilter: "blur(8px)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                <span className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: "rgba(246,243,234,0.15)", color: "#86EFAC" }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
                </span>
                Lihat Program Kerja
              </Link>

              <Link href="/login" className="group inline-flex items-center gap-3 px-7 py-4 rounded-2xl font-semibold text-base transition-all duration-300 hover:-translate-y-1" style={{ background: "linear-gradient(135deg, var(--brass) 0%, #9A7030 100%)", color: "var(--paper)", boxShadow: "0 4px 20px rgba(184,134,59,0.35)" }}>
                <span className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: "rgba(246,243,234,0.15)" }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                </span>
                Masuk Admin
              </Link>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-fade-in-up" style={{ animationDelay: "1s" }}>
              <div className="flex flex-col items-center gap-2" style={{ color: "rgba(246,243,234,0.5)" }}>
                <span className="text-xs tracking-widest uppercase">Scroll</span>
                <div className="w-6 h-10 rounded-full border-2 flex justify-center pt-2" style={{ borderColor: "rgba(246,243,234,0.3)" }}>
                  <div className="w-1.5 h-3 rounded-full animate-bounce" style={{ background: "rgba(246,243,234,0.6)" }} />
                </div>
              </div>
            </div>
          </div>
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
