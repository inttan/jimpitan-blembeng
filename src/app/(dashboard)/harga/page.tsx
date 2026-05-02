import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import FormUpdateHarga from "@/components/forms/FormUpdateHarga";
import FormTambahSampah from "@/components/forms/FormTambahSampah";
import { Tag, Info, History } from "lucide-react";

async function getHargaData() {
  const supabase = await createClient();
  const [hargaAktif, riwayat] = await Promise.all([
    supabase.from("v_harga_aktif").select("*").order("nama_sampah"),
    supabase.from("harga_sampah")
      .select(`harga_per_kg, berlaku_mulai, catatan, dibuat_oleh, created_at,
        sampah:sampah_id (nama_sampah, kategori)`)
      .order("created_at", { ascending: false }).limit(20),
  ]);
  return { hargaAktif: hargaAktif.data ?? [], riwayat: riwayat.data ?? [] };
}

const KATEGORI_COLOR: Record<string, { bg: string; color: string }> = {
  plastik:    { bg: "rgba(59,130,246,0.1)",  color: "#3b82f6" },
  kertas:     { bg: "rgba(234,179,8,0.1)",   color: "#ca8a04" },
  logam:      { bg: "rgba(107,114,128,0.1)", color: "var(--text3)" },
  kaca:       { bg: "rgba(6,182,212,0.1)",   color: "#0891b2" },
  organik:    { bg: "var(--p5)",             color: "var(--p)" },
  elektronik: { bg: "rgba(139,92,246,0.1)",  color: "#7c3aed" },
  lainnya:    { bg: "rgba(249,115,22,0.1)",  color: "#ea580c" },
};

const card = {
  background: "var(--surf)", border: "1px solid var(--bdr)",
  borderRadius: "var(--r)", boxShadow: "var(--shd)",
};

export default async function HargaPage() {
  const { hargaAktif, riwayat } = await getHargaData();

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.4px" }}>
            Harga Sampah
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "4px" }}>
            Kelola harga per kg · Harga lama tetap tersimpan untuk audit
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <FormTambahSampah />
          <FormUpdateHarga sampahList={hargaAktif} />
        </div>
      </div>

      {/* Harga Aktif */}
      <div style={card}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--bdr)", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "7px", background: "var(--p5)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--p)",
          }}>
            <Tag size={14} strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>Harga Berlaku Sekarang</p>
            <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "1px" }}>
              Digunakan otomatis saat input transaksi setoran
            </p>
          </div>
        </div>

        {hargaAktif.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text3)", fontSize: "13px" }}>
            Belum ada jenis sampah. Tambah dulu lewat tombol "+ Jenis Sampah Baru".
          </div>
        ) : (
          hargaAktif.map((h, i) => {
            const kat = KATEGORI_COLOR[h.kategori] ?? { bg: "var(--surf3)", color: "var(--text3)" };
            return (
              <div key={h.sampah_id} style={{
                padding: "14px 20px",
                borderBottom: i < hargaAktif.length - 1 ? "1px solid var(--bdr)" : "none",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    background: kat.bg, color: kat.color,
                    borderRadius: "6px", padding: "3px 9px",
                    fontSize: "11px", fontWeight: 600, flexShrink: 0,
                  }}>{h.kategori}</span>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{h.nama_sampah}</p>
                    {h.catatan_harga && (
                      <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px" }}>{h.catatan_harga}</p>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--p)" }}>
                    {h.harga_per_kg ? formatRupiah(h.harga_per_kg) : "Belum ada harga"}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px" }}>
                    {h.berlaku_mulai ? `per ${h.satuan} · berlaku ${formatTanggal(h.berlaku_mulai)}` : "—"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info kas */}
      <div style={{
        background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)",
        borderRadius: "var(--r)", padding: "14px 18px",
        display: "flex", gap: "12px", alignItems: "flex-start",
      }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "8px",
          background: "rgba(59,130,246,0.12)", display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "#3b82f6", flexShrink: 0,
        }}>
          <Info size={15} strokeWidth={2.5} />
        </div>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
            Potongan Kas Otomatis 10%
          </p>
          <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "4px", lineHeight: 1.6 }}>
            Setiap transaksi otomatis dipotong 10% untuk kas operasional. Nilai yang masuk tabungan warga
            adalah 90% dari harga × berat. Contoh: 5 kg kardus × Rp 2.000 = Rp 10.000 kotor →
            Rp 9.000 masuk tabungan, Rp 1.000 ke kas.
          </p>
        </div>
      </div>

      {/* Riwayat */}
      <div style={card}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--bdr)", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "7px", background: "var(--surf3)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)",
          }}>
            <History size={14} strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>Riwayat Perubahan Harga</p>
            <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "1px" }}>
              20 perubahan terbaru · Data untuk audit trail
            </p>
          </div>
        </div>

        {riwayat.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text3)", fontSize: "13px" }}>
            Belum ada riwayat.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--bdr)" }}>
                  {["Jenis Sampah", "Harga/kg", "Berlaku Mulai", "Catatan", "Diinput Oleh"].map((h, i) => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: i === 1 ? "right" : "left",
                      fontSize: "10px", fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: "0.7px", color: "var(--text3)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riwayat.map((r: any, i: number) => (
                  <tr key={i} style={{ borderBottom: i < riwayat.length - 1 ? "1px solid var(--bdr)" : "none" }}>
                    <td style={{ padding: "11px 16px", fontWeight: 600, color: "var(--text)" }}>
                      {r.sampah?.nama_sampah ?? "—"}
                    </td>
                    <td style={{ padding: "11px 16px", textAlign: "right", fontWeight: 700, color: "var(--p)" }}>
                      {formatRupiah(r.harga_per_kg)}
                    </td>
                    <td style={{ padding: "11px 16px", color: "var(--text2)" }}>
                      {formatTanggal(r.berlaku_mulai)}
                    </td>
                    <td style={{ padding: "11px 16px", fontSize: "11px", color: "var(--text3)" }}>
                      {r.catatan ?? "—"}
                    </td>
                    <td style={{ padding: "11px 16px", color: "var(--text2)" }}>
                      {r.dibuat_oleh ?? "Admin"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}