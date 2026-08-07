import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil — Dusun Blembeng",
  description: "Profil dan informasi tentang Dusun Blembeng",
};

export default function ProfilPage() {
  const profilData = {
    namaDusun: "Dusun Blembeng",
    desa: "Purwodadi",
    kecamatan: "Tegalrejo",
    kabupaten: "Magelang",
    provinsi: "Jawa Tengah",
    jumlahKK: 87,
    jumlahWarga: 312,
    tahunBerdiri: 1985,
    latitude: -7.0833,
    longitude: 110.2500,
  };

  const potensi = [
    {
      title: "Pertanian Padi",
      desc: "Lahan pertanian produktif yang menjadi sumber ekonomi utama warga",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22V12" /><path d="M12 12C12 12 8 8 8 5C8 5 10 3 12 3C14 3 16 5 16 5C16 8 12 12 12 12Z" />
          <path d="M9 15C7 17 6 19 6 21" /><path d="M15 15C17 17 18 19 18 21" />
        </svg>
      ),
    },
    {
      title: "Kerajinan Tangan",
      desc: "Beberapa warga memiliki keahlian dalam membuat anyaman dan kerajinan tradisional",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      title: "Keharmonisan Sosial",
      desc: "Semangat gotong royong dan musyawarah yang masih kuat di masyarakat",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden" style={{ background: "linear-gradient(180deg, var(--surf) 0%, var(--bg) 100%)" }}>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text3)" }}>
                <span>Dusun</span><span>/</span><span style={{ color: "var(--green)" }}>Profil</span>
              </nav>
              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>
                Profil <span style={{ color: "var(--green)" }}>Dusun</span> <span style={{ color: "var(--brass)" }}>Blembeng</span>
              </h1>
              <p className="text-lg leading-relaxed mb-6" style={{ color: "var(--text2)" }}>
                Mengenal lebih dekat komunitas kami di <strong>Desa Purwodadi, Kecamatan Tegalrejo, Kabupaten Magelang</strong>.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl text-center" style={{ background: "var(--p6)", border: "1px solid var(--p5)" }}>
                  <div className="text-2xl font-bold" style={{ color: "var(--green)", fontFamily: "var(--font-fraunces)" }}>{profilData.jumlahKK}</div>
                  <div className="text-xs" style={{ color: "var(--text2)" }}>Kepala Keluarga</div>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ background: "var(--acc2)", border: "1px solid var(--brass-soft)" }}>
                  <div className="text-2xl font-bold" style={{ color: "var(--brass)", fontFamily: "var(--font-fraunces)" }}>{profilData.jumlahWarga}</div>
                  <div className="text-xs" style={{ color: "var(--text2)" }}>Jiwa</div>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ background: "var(--surf)" }}>
                  <div className="text-2xl font-bold" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>{profilData.tahunBerdiri}</div>
                  <div className="text-xs" style={{ color: "var(--text2)" }}>Tahun Berdiri</div>
                </div>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-64 h-64 rounded-full flex items-center justify-center relative" style={{ background: "var(--surf)" }}>
                <div className="absolute inset-4 rounded-full flex items-center justify-center" style={{ background: "var(--green)" }}>
                  <svg className="w-32 h-32 text-[var(--paper)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M12 22V12" /><path d="M12 12C12 12 8 8 8 5C8 5 10 3 12 3C14 3 16 5 16 5C16 8 12 12 12 12Z" />
                    <path d="M12 8C12 8 6 10 5 13C5 13 7 14 10 12" /><path d="M12 8C12 8 18 10 19 13C19 13 17 14 14 12" />
                    <path d="M9 15C7 17 6 19 6 21" /><path d="M15 15C17 17 18 19 18 21" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sejarah & Potensi */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--green)" }}>
                  <svg className="w-6 h-6 text-[var(--paper)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>Tentang Dusun</h2>
              </div>
              <div className="p-6 rounded-2xl" style={{ background: "var(--surf)", border: "1px solid var(--bdr)" }}>
                <p className="leading-relaxed" style={{ color: "var(--text2)" }}>
                  Dusun Blembeng merupakan salah satu dusun yang berada di bawah naungan Desa Purwodadi,
                  Kecamatan Tegalrejo, Kabupaten Magelang. Didirikan pada tahun {profilData.tahunBerdiri},
                  dusun ini telah mengalami pertumbuhan yang signifikan dengan {profilData.jumlahKK} kepala
                  keluarga dan {profilData.jumlahWarga} jiwa.
                </p>
                <p className="leading-relaxed mt-4" style={{ color: "var(--text2)" }}>
                  Kehidupan bermasyarakat di Dusun Blembeng menjunjung tinggi gotong royong dan musyawarah.
                  Berbagai tradisi seperti jimpitan mingguan, rapat bulanan, dan kegiatan peringatan kemerdekaan
                  Indonesia menjadi bukti nyata kebersamaan warga.
                </p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--brass)" }}>
                  <svg className="w-6 h-6 text-[var(--paper)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>Potensi & Kearifan Lokal</h2>
              </div>
              <div className="space-y-4">
                {potensi.map((item, index) => (
                  <div key={index} className="p-5 rounded-xl flex items-start gap-4 transition-all duration-300" style={{ background: "var(--surf)", border: "1px solid var(--bdr)" }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--acc2)" }}>
                      <div className="w-5 h-5" style={{ color: "var(--brass)" }}>{item.icon}</div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>{item.title}</h3>
                      <p className="text-sm" style={{ color: "var(--text2)" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lokasi Section */}
      <section className="py-16 md:py-20" style={{ background: "var(--surf2)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>Lokasi Dusun</h2>
            <p className="text-lg" style={{ color: "var(--text2)" }}>Dusun Blembeng terletak di Desa Purwodadi, Kecamatan Tegalrejo</p>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--bdr)", boxShadow: "var(--shd2)" }}>
            <div className="aspect-[16/9] md:aspect-[21/9]">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.5!2d${profilData.longitude}!3d${profilData.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTMnMDAuMyJTIDEwOcKwMjUnMDQuNiJF!5e0!3m2!1sen!2sid!4v1234567890`}
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Lokasi Dusun Blembeng"
              />
            </div>
            <div className="p-6" style={{ background: "var(--surf)" }}>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center">
                <div><span className="text-sm" style={{ color: "var(--text3)" }}>Dusun</span><p className="font-medium" style={{ color: "var(--ink)" }}>Dusun Blembeng</p></div>
                <div style={{ width: "1px", height: "40px", background: "var(--bdr)" }} />
                <div><span className="text-sm" style={{ color: "var(--text3)" }}>Desa</span><p className="font-medium" style={{ color: "var(--ink)" }}>Purwodadi</p></div>
                <div style={{ width: "1px", height: "40px", background: "var(--bdr)" }} />
                <div><span className="text-sm" style={{ color: "var(--text3)" }}>Kecamatan</span><p className="font-medium" style={{ color: "var(--ink)" }}>Tegalrejo</p></div>
                <div style={{ width: "1px", height: "40px", background: "var(--bdr)" }} />
                <div><span className="text-sm" style={{ color: "var(--text3)" }}>Kabupaten</span><p className="font-medium" style={{ color: "var(--ink)" }}>Magelang</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
