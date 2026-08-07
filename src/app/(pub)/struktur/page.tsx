"use client";

import { useState } from "react";

const strukturDusun = {
  kepalaDusun: { nama: "Budi Santoso", jabatan: "Kepala Dusun", foto: null },
  rtRw: [
    { nama: "Wartono", jabatan: "RT 01", foto: null },
    { nama: "Siti Aminah", jabatan: "RT 02", foto: null },
    { nama: "Ahmad Dahlan", jabatan: "RT 03", foto: null },
    { nama: "Dewi Lestari", jabatan: "RT 04", foto: null },
  ],
  tokohMasyarakat: [
    { nama: "H. Abdul Rahman", jabatan: "Tokoh Agama", foto: null },
    { nama: "Parno", jabatan: "Mantan Kepala Dusun", foto: null },
    { nama: "Nengsih", jabatan: "Bidan Desa", foto: null },
  ],
};

const strukturKarangTaruna = {
  periode: "2024-2027",
  struktur: [
    {
      divisi: "Pengurus Inti",
      anggota: [
        { nama: "Rizki Pratama", jabatan: "Ketua", foto: null },
        { nama: "Dian Permatasari", jabatan: "Wakil Ketua", foto: null },
        { nama: "Fajar Nugroho", jabatan: "Sekretaris", foto: null },
        { nama: "Anisa Rahma", jabatan: "Bendahara", foto: null },
      ],
    },
    {
      divisi: "Divisi Nyinom",
      anggota: [
        { nama: "Bagus Setiawan", jabatan: "Koordinator", foto: null },
        { nama: "Rina Wulandari", jabatan: "Anggota", foto: null },
        { nama: "Dimas Arya", jabatan: "Anggota", foto: null },
        { nama: "Siti Zahra", jabatan: "Anggota", foto: null },
      ],
    },
    {
      divisi: "Divisi Kegiatan",
      anggota: [
        { nama: "Hendra Kusuma", jabatan: "Koordinator", foto: null },
        { nama: "Fitri Handayani", jabatan: "Anggota", foto: null },
        { nama: "Rudi Hermawan", jabatan: "Anggota", foto: null },
      ],
    },
    {
      divisi: "Divisi Perlengkapan",
      anggota: [
        { nama: "Wahyu Setiadi", jabatan: "Koordinator", foto: null },
        { nama: "Nurul Hidayah", jabatan: "Anggota", foto: null },
        { nama: "Taufik Hidayat", jabatan: "Anggota", foto: null },
      ],
    },
  ],
};

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const sizeClasses = { sm: "w-12 h-12 text-sm", md: "w-16 h-16 text-base", lg: "w-24 h-24 text-xl" };
  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium`}
      style={{ background: "linear-gradient(135deg, var(--green) 0%, var(--green-soft) 100%)", color: "var(--paper)" }}>
      {initials}
    </div>
  );
}

function PersonCard({ nama, jabatan, foto, size = "md" }: { nama: string; jabatan: string; foto: string | null; size?: "sm" | "md" | "lg" }) {
  return (
    <div className="p-4 rounded-xl text-center transition-all duration-300" style={{ background: "var(--surf)", border: "1px solid var(--bdr)" }}>
      <div className="flex justify-center mb-3">
        {foto ? <img src={foto} alt={nama} className="w-16 h-16 rounded-full object-cover" /> : <Avatar name={nama} size={size} />}
      </div>
      <h4 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>{nama}</h4>
      <p className="text-sm" style={{ color: "var(--text2)" }}>{jabatan}</p>
    </div>
  );
}

export default function StrukturPage() {
  const [activeTab, setActiveTab] = useState<"dusun" | "karangtaruna">("dusun");

  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-24" style={{ background: "linear-gradient(180deg, var(--surf) 0%, var(--bg) 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>
            Struktur <span style={{ color: "var(--green)" }}>Organisasi</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text2)" }}>
            Kenali kepemimpinan dan organisasi yang mengelola Dusun Blembeng
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="pb-8 -mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex p-1 rounded-xl mx-auto" style={{ background: "var(--surf)", border: "1px solid var(--bdr)", boxShadow: "var(--shd)" }}>
            <button onClick={() => setActiveTab("dusun")}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-300"
              style={{ background: activeTab === "dusun" ? "var(--green)" : "transparent", color: activeTab === "dusun" ? "var(--paper)" : "var(--text2)" }}>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Struktur Dusun
              </span>
            </button>
            <button onClick={() => setActiveTab("karangtaruna")}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-300"
              style={{ background: activeTab === "karangtaruna" ? "var(--green)" : "transparent", color: activeTab === "karangtaruna" ? "var(--paper)" : "var(--text2)" }}>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                Karang Taruna
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === "dusun" && (
            <div className="animate-in">
              {/* Kepala Dusun */}
              <div className="mb-12 text-center">
                <div className="inline-block p-6 rounded-2xl" style={{ background: "var(--surf)", border: "2px solid var(--green)", boxShadow: "var(--shd2)", maxWidth: "300px" }}>
                  <div className="flex justify-center mb-4"><Avatar name={strukturDusun.kepalaDusun.nama} size="lg" /></div>
                  <h3 className="text-2xl font-bold mb-1" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>{strukturDusun.kepalaDusun.nama}</h3>
                  <p className="text-sm" style={{ color: "var(--green)", fontWeight: 500 }}>{strukturDusun.kepalaDusun.jabatan}</p>
                </div>
              </div>

              {/* RT/RW */}
              <div className="mb-12">
                <h3 className="text-xl font-bold mb-6 text-center" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>Perangkat Dusun</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {strukturDusun.rtRw.map((rt, index) => <PersonCard key={index} {...rt} size="sm" />)}
                </div>
              </div>

              {/* Tokoh Masyarakat */}
              <div>
                <h3 className="text-xl font-bold mb-6 text-center" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>Tokoh Masyarakat</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {strukturDusun.tokohMasyarakat.map((tokoh, index) => (
                    <div key={index} className="p-5 rounded-xl flex items-center gap-4" style={{ background: "var(--surf)", border: "1px solid var(--bdr)" }}>
                      <Avatar name={tokoh.nama} size="md" />
                      <div>
                        <h4 className="font-semibold" style={{ color: "var(--ink)" }}>{tokoh.nama}</h4>
                        <p className="text-sm" style={{ color: "var(--text2)" }}>{tokoh.jabatan}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "karangtaruna" && (
            <div className="animate-in">
              <div className="text-center mb-12">
                <div className="inline-block px-4 py-2 rounded-full mb-4" style={{ background: "var(--brass-soft)", color: "var(--brass)" }}>
                  <span className="text-sm font-medium">Periode {strukturKarangTaruna.periode}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>
                  Karang Taruna Dusun Blembeng
                </h2>
                <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text2)" }}>
                  Organisasi pemuda-pemudi yang menggerakkan semangat regenerasi dan partisipasi anak muda
                </p>
              </div>

              {strukturKarangTaruna.struktur.map((divisi, divisiIndex) => (
                <div key={divisiIndex} className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                      style={{ background: divisi.divisi === "Pengurus Inti" ? "var(--green)" : divisi.divisi === "Divisi Nyinom" ? "var(--red)" : divisi.divisi === "Divisi Kegiatan" ? "var(--brass)" : "var(--terracotta)", color: "var(--paper)" }}>
                      {divisiIndex + 1}
                    </div>
                    <h3 className="text-xl font-bold" style={{ color: "var(--ink)", fontFamily: "var(--font-fraunces)" }}>{divisi.divisi}</h3>
                    <div className="flex-1 h-px" style={{ background: "var(--bdr)" }} />
                  </div>
                  <div className={`grid gap-4 ${divisi.divisi === "Pengurus Inti" ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
                    {divisi.anggota.map((anggota, anggotaIndex) => (
                      <PersonCard key={anggotaIndex} {...anggota} size={divisi.divisi === "Pengurus Inti" ? "md" : "sm"} />
                    ))}
                  </div>
                </div>
              ))}

              <div className="p-6 rounded-2xl" style={{ background: "var(--p6)", border: "1px solid var(--p5)" }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--green)" }}>
                    <svg className="w-6 h-6 text-[var(--paper)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2" style={{ color: "var(--green)" }}>Tentang Karang Taruna</h4>
                    <p className="text-sm" style={{ color: "var(--text2)" }}>
                      Karang Taruna merupakan organisasi kemasyarakatan yang bergerak di bidang pengembangan generasi muda.
                      Di Dusun Blembeng, Karang Taruna aktif mengelola program Nyinom (regenerasi), membantu kesiapan
                      sarana prasarana untuk kegiatan dusun, dan menjadi motor penggerak berbagai program kerja.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
