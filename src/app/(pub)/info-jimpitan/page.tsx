import { createClient } from "@/lib/supabase/server";
import { getMingguKe } from "@/lib/jimpitan";

export const metadata = {
  title: "Jimpitan Mingguan — Daven Blembeng",
  description: "Program iuran wajib mingguan untuk kas kegiatan dusun dan operasional Karang Taruna Daven Blembeng",
};

function formatRupiah(num: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatTahun() {
  return new Date().getFullYear().toString();
}

async function getJimpitanStats() {
  try {
    const supabase = await createClient();
    const tahunIni = formatTahun();
    const mingguIni = getMingguKe();

    // 1. Total KK aktif ikut jimpitan (COUNT only)
    const { count: totalKK } = await supabase
      .from("warga")
      .select("id", { count: "exact", head: true })
      .eq("status_aktif", true);

    // 2. KK sudah setor minggu ini (COUNT only)
    const { count: sudahSetor } = await supabase
      .from("jimpitan_transaksi")
      .select("id", { count: "exact", head: true })
      .eq("minggu_ke", mingguIni)
      .eq("status", "lunas");

    // 3. Total dana kas masuk tahun berjalan (SUM only)
    const { data: totalKas } = await supabase
      .from("kas_kegiatan")
      .select("jumlah")
      .eq("jenis", "masuk")
      .gte("tanggal", `${tahunIni}-01-01`)
      .lte("tanggal", `${tahunIni}-12-31`);

    const totalDanaKas = totalKas?.reduce((sum, item) => sum + Number(item.jumlah ?? 0), 0) ?? 0;

    return {
      totalKK: totalKK ?? 0,
      sudahSetor: sudahSetor ?? 0,
      totalDanaKas,
      tahun: tahunIni,
    };
  } catch (error) {
    console.error("Error fetching jimpitan stats:", error);
    return {
      totalKK: 0,
      sudahSetor: 0,
      totalDanaKas: 0,
      tahun: formatTahun(),
    };
  }
}

export default async function InfoJimpitanPage() {
  const stats = await getJimpitanStats();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Hero Banner */}
      <section
        className="relative py-16 md:py-24"
        style={{
          background: "linear-gradient(135deg, #1F3D2B 0%, #2D5A40 50%, #1F3D2B 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: "rgba(134,239,172,0.15)", color: "#86EFAC" }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="text-sm font-medium">Program Jimpitan Mingguan</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ color: "var(--paper)", fontFamily: "var(--font-fraunces)" }}>
            Jimpitan Daven Blembeng
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: "rgba(246,243,234,0.85)" }}>
            Transparansi dan akuntabilitas kas kegiatan untuk kesejahteraan bersama
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* About Section */}
          <div
            className="p-8 md:p-10 rounded-3xl mb-10"
            style={{ background: "var(--surf)", border: "1px solid var(--bdr)", boxShadow: "var(--shd-card)" }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--brass) 0%, #9A7030 100%)" }}
              >
                <svg className="w-7 h-7" style={{ color: "var(--paper)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>
                Tentang Jimpitan
              </h2>
            </div>

            <div className="space-y-5" style={{ color: "var(--text1)", lineHeight: 1.8 }}>
              <p>
                <strong>Jimpitan</strong> adalah program iuran wajib mingguan sebesar{' '}
                <strong style={{ color: "var(--green)" }}>Rp 5.000 per Kartu Keluarga</strong>.
                Dana ini dikelola secara transparan dan tercatat dalam sistem untuk mendukung
                operasional dusun serta berbagai kegiatan warga.
              </p>

              <p>
                Prinsip utama program ini adalah <strong>&ldquo;dari warga, untuk warga&rdquo;</strong> —
                setiap kontribusi digunakan sepenuhnya untuk kepentingan bersama, seperti kegiatan
                Karang Taruna, perayaan hari besar nasional, perawatan fasilitas dusun, hingga
                kebutuhan mendesak lainnya.
              </p>

              <p>
                Seluruh aliran dana dapat dipantau secara terbuka oleh seluruh warga melalui
                laporan kas yang tersedia. Setiap pengeluaran harus disetujui dan dicatat dengan
                baik.
              </p>
            </div>
          </div>

          {/* Statistics Section */}
          <div
            className="p-8 md:p-10 rounded-3xl mb-10"
            style={{ background: "var(--surf)", border: "1px solid var(--bdr)", boxShadow: "var(--shd-card)" }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(31,61,43,0.1)" }}
              >
                <svg className="w-7 h-7" style={{ color: "var(--green)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>
                  Statistik {stats.tahun}
                </h2>
                <p className="text-sm" style={{ color: "var(--text2)" }}>
                  Data agregat transparan untuk seluruh warga
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total KK */}
              <div
                className="p-6 rounded-2xl text-center"
                style={{ background: "var(--paper)", border: "1px solid var(--bdr)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(31,61,43,0.1)" }}
                >
                  <svg className="w-6 h-6" style={{ color: "var(--green)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <div className="text-4xl font-bold mb-2" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>
                  {stats.totalKK}
                </div>
                <div className="text-sm" style={{ color: "var(--text2)" }}>Total KK Ikut Jimpitan</div>
              </div>

              {/* Sudah Setor */}
              <div
                className="p-6 rounded-2xl text-center"
                style={{ background: "var(--paper)", border: "1px solid var(--bdr)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(34,197,94,0.1)" }}
                >
                  <svg className="w-6 h-6" style={{ color: "#22C55E" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="text-4xl font-bold mb-2" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>
                  {stats.sudahSetor}
                </div>
                <div className="text-sm" style={{ color: "var(--text2)" }}>KK Sudah Setor Minggu Ini</div>
              </div>

              {/* Total Dana Kas */}
              <div
                className="p-6 rounded-2xl text-center"
                style={{ background: "var(--paper)", border: "1px solid var(--bdr)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(184,134,59,0.1)" }}
                >
                  <svg className="w-6 h-6" style={{ color: "var(--brass)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                </div>
                <div className="text-2xl font-bold mb-2 truncate" style={{ color: "var(--brass)", fontFamily: "var(--font-fraunces)" }}>
                  {formatRupiah(stats.totalDanaKas)}
                </div>
                <div className="text-sm" style={{ color: "var(--text2)" }}>Total Dana Kas {stats.tahun}</div>
              </div>
            </div>
          </div>

          {/* Transparency Note */}
          <div
            className="p-6 rounded-2xl"
            style={{ background: "rgba(31,61,43,0.05)", border: "1px solid rgba(31,61,43,0.15)" }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--green)" }}
              >
                <svg className="w-5 h-5" style={{ color: "var(--paper)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-2" style={{ color: "var(--ink)" }}>
                  Transparansi untuk Semua
                </h3>
                <p className="text-sm" style={{ color: "var(--text2)", lineHeight: 1.7 }}>
                  Data yang ditampilkan adalah informasi agregat untuk menjaga privasi warga.
                  Detail transaksi dan pengelolaan kas dapat dipantau melalui sistem admin yang
                  dikelola oleh Pengurus Karang Taruna.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center" style={{ borderTop: "1px solid var(--bdr)" }}>
        <p className="text-sm" style={{ color: "var(--text2)" }}>
          Daven Blembeng, Desa Purwodadi, Kecamatan Tegalrejo
        </p>
      </footer>
    </div>
  );
}
