import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { Landmark, Recycle, Briefcase } from "lucide-react";
import ButtonDownloadLaporan from "@/components/forms/ButtonDownloadLaporan";
import RiwayatSetoranTable from "@/components/laporan/RiwayatSetoranTable";

async function getLaporanData() {
  const supabase = await createClient();
  const [saldoRes, setoranRes, kasSetoranRes, kasLegacyRes, penarikanRes] = await Promise.all([
    supabase
      .from("v_saldo_nasabah")
      .select("*")
      .eq("status", "aktif")
      .order("saldo_aktif", { ascending: false }),

    // ← pakai v_riwayat_setoran, bukan transaksi_setoran
    supabase
      .from("v_riwayat_setoran")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),

    // Source of truth kas: dari setoran.total_potongan_kas (bukan kas_operasional,
    // karena kas_operasional cuma audit trail yang bergantung trigger — bisa bolong)
    supabase
      .from("setoran")
      .select("total_potongan_kas")
      .eq("status", "terverifikasi"),

    // Sisa data lama yang belum dimigrasi ke struktur setoran/setoran_detail
    supabase
      .from("transaksi_setoran")
      .select("potongan_kas")
      .eq("status", "terverifikasi"),

    supabase
      .from("transaksi_penarikan_tunai")
      .select("*, nasabah:nasabah_id (nama_lengkap)")
      .order("created_at", { ascending: false }),
  ]);

  const totalKasBaru = (kasSetoranRes.data ?? []).reduce((s, k) => s + (k.total_potongan_kas ?? 0), 0);
  const totalKasLama = (kasLegacyRes.data ?? []).reduce((s, k) => s + (k.potongan_kas ?? 0), 0);
  const totalKas = totalKasBaru + totalKasLama;

  return {
    saldoList:    saldoRes.data ?? [],
    setoranList:  setoranRes.data ?? [],
    totalKas,
    penarikanList: penarikanRes.data ?? [],
  };
}

const card = {
  background: "var(--surf)", border: "1px solid var(--bdr)",
  borderRadius: "var(--r)", boxShadow: "var(--shd)",
};

function SectionCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={card}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--bdr)" }}>
        <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{title}</p>
        {sub && <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px" }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export default async function LaporanPage() {
  const { saldoList, setoranList, totalKas, penarikanList } = await getLaporanData();

  const totalTabungan = saldoList.reduce((s, n) => s + (n.saldo_aktif ?? 0), 0);
  // Total bersih dari setoran header (sudah aggregate)
  const totalSetoran  = setoranList.reduce((s, t) => s + (t.total_nilai_bersih ?? 0), 0);

  const summaryStats = [
    { label: "Total Tabungan Warga",  value: formatRupiah(totalTabungan), Icon: Landmark,  color: "var(--acc)" },
    { label: "Total Setoran Bersih",  value: formatRupiah(totalSetoran),  Icon: Recycle,   color: "var(--p)"   },
    { label: "Total Kas Terkumpul",   value: formatRupiah(totalKas),      Icon: Briefcase, color: "#3b82f6"    },
  ];

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.4px" }}>
            Laporan
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "4px" }}>
            Ringkasan keuangan dan transaksi bank sampah
          </p>
        </div>
        <ButtonDownloadLaporan />
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
        {summaryStats.map(({ label, value, Icon, color }) => (
          <div key={label} style={{ ...card, padding: "18px 20px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "9px",
              background: "var(--p5)", display: "flex",
              alignItems: "center", justifyContent: "center",
              color, marginBottom: "12px",
            }}>
              <Icon size={16} strokeWidth={2.5} />
            </div>
            <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.7px", color: "var(--text3)", marginBottom: "5px" }}>
              {label}
            </p>
            <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px" }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Saldo per Nasabah */}
      <SectionCard
        title="Saldo Tabungan per Nasabah"
        sub="Diurutkan dari saldo terbesar · Data real-time dari database"
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--bdr)" }}>
                {["Kode", "Nama Nasabah", "Total Setoran", "Total Dicairkan", "Saldo Aktif", "Jml Setoran"].map((h, i) => (
                  <th key={h} style={{
                    padding: "10px 16px", textAlign: i >= 2 ? "right" : "left",
                    fontSize: "10px", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.7px", color: "var(--text3)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {saldoList.map((n, i) => (
                <tr key={n.id} style={{ borderBottom: i < saldoList.length - 1 ? "1px solid var(--bdr)" : "none" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text3)" }}>
                      {n.kode_nasabah}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text)" }}>
                    {n.nama_lengkap}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--text2)" }}>
                    {formatRupiah(n.total_setoran ?? 0)}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--red)" }}>
                    {formatRupiah(n.total_dicairkan ?? 0)}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--p)" }}>
                    {formatRupiah(n.saldo_aktif ?? 0)}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--text3)" }}>
                    {n.jumlah_transaksi}x
                  </td>
                </tr>
              ))}
              <tr style={{ background: "var(--acc2)" }}>
                <td colSpan={4} style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "var(--text2)", fontSize: "12px" }}>
                  Total Liabilities (wajib disiapkan)
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 800, color: "var(--acc)" }}>
                  {formatRupiah(totalTabungan)}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Riwayat Setoran — client component karena ada expand/collapse */}
      <SectionCard title="Riwayat Setoran" sub="50 setoran terbaru">
        <RiwayatSetoranTable setoranList={setoranList} />
      </SectionCard>

      {/* Riwayat Penarikan */}
      {penarikanList.length > 0 && (
        <SectionCard title="Riwayat Pencairan Lebaran">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--bdr)" }}>
                  {["Kode", "Nasabah", "Jumlah Dicairkan", "Periode", "Admin Saksi", "Tanggal"].map((h, i) => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: i === 2 || i === 5 ? "right" : "left",
                      fontSize: "10px", fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: "0.7px", color: "var(--text3)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {penarikanList.map((p: any, i: number) => (
                  <tr key={p.id} style={{ borderBottom: i < penarikanList.length - 1 ? "1px solid var(--bdr)" : "none" }}>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text3)" }}>
                        {p.kode_penarikan}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px", fontWeight: 600, color: "var(--text)" }}>
                      {p.nasabah?.nama_lengkap ?? "—"}
                    </td>
                    <td style={{ padding: "11px 16px", textAlign: "right", fontWeight: 700, color: "var(--acc)" }}>
                      {formatRupiah(p.jumlah_diterima)}
                    </td>
                    <td style={{ padding: "11px 16px", color: "var(--text2)" }}>{p.periode_lebaran}</td>
                    <td style={{ padding: "11px 16px", color: "var(--text2)" }}>{p.admin_saksi}</td>
                    <td style={{ padding: "11px 16px", textAlign: "right", fontSize: "11px", color: "var(--text3)" }}>
                      {formatTanggal(p.tanggal_pencairan)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}