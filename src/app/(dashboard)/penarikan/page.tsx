import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import FormPenarikan from "@/components/forms/FormPenarikan";
import { AlertTriangle, Banknote } from "lucide-react";

async function getData() {
  const supabase = await createClient();
  const [nasabahRes, penarikanRes] = await Promise.all([
    supabase.from("v_saldo_nasabah")
      .select("id, kode_nasabah, nama_lengkap, no_wa, saldo_aktif")
      .eq("status", "aktif").gt("saldo_aktif", 0).order("nama_lengkap"),
    supabase.from("transaksi_penarikan_tunai")
      .select("*, nasabah:nasabah_id (nama_lengkap)")
      .order("created_at", { ascending: false }).limit(20),
  ]);
  return { nasabahList: nasabahRes.data ?? [], penarikanList: penarikanRes.data ?? [] };
}

const card = {
  background: "var(--surf)", border: "1px solid var(--bdr)",
  borderRadius: "var(--r)", boxShadow: "var(--shd)",
};

export default async function PenarikanPage() {
  const { nasabahList, penarikanList } = await getData();
  const totalSiapCair = nasabahList.reduce((s, n) => s + (n.saldo_aktif ?? 0), 0);

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.4px" }}>
            Pencairan Tabungan Lebaran
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "4px" }}>
            {nasabahList.length} nasabah siap cairkan · Total {formatRupiah(totalSiapCair)}
          </p>
        </div>
        <FormPenarikan nasabahList={nasabahList} />
      </div>

      {/* Info banner */}
      <div style={{
        background: "var(--acc2)", border: "1px solid rgba(217,119,6,0.2)",
        borderRadius: "var(--r)", padding: "14px 18px",
        display: "flex", gap: "12px", alignItems: "flex-start",
      }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "9px",
          background: "rgba(217,119,6,0.12)", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acc)",
        }}>
          <AlertTriangle size={16} strokeWidth={2.5} />
        </div>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--acc)" }}>Panduan Pencairan</p>
          <p style={{ fontSize: "12px", color: "var(--text2)", marginTop: "4px", lineHeight: 1.65 }}>
            Pencairan hanya dilakukan sekali setahun sebelum Lebaran. Jumlah yang dicairkan maksimal
            sama dengan saldo aktif nasabah. Setelah dicatat, saldo nasabah otomatis berkurang.
            Kirim notifikasi WA setelah pencairan dicatat.
          </p>
        </div>
      </div>

      {/* Daftar siap cairkan */}
      <div style={card}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--bdr)", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "7px", background: "var(--p5)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--p)",
          }}>
            <Banknote size={14} strokeWidth={2.5} />
          </div>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
            Nasabah yang Punya Saldo (Siap Dicairkan)
          </p>
        </div>

        {nasabahList.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", fontSize: "13px", color: "var(--text3)" }}>
            Semua saldo sudah dicairkan atau belum ada transaksi.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--bdr)" }}>
                  {["Nama Nasabah", "No. WA", "Saldo Siap Cair"].map((h, i) => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: i === 2 ? "right" : "left",
                      fontSize: "10px", fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: "0.7px", color: "var(--text3)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nasabahList.map((n, i) => (
                  <tr key={n.id} style={{ borderBottom: i < nasabahList.length - 1 ? "1px solid var(--bdr)" : "none" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text)" }}>{n.nama_lengkap}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text2)" }}>{n.no_wa ?? "—"}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--p)" }}>
                      {formatRupiah(n.saldo_aktif ?? 0)}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "var(--acc2)", borderTop: "1px solid var(--bdr)" }}>
                  <td colSpan={2} style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "var(--acc)", fontSize: "12px" }}>
                    Total yang harus disiapkan
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 800, color: "var(--acc)", fontSize: "15px" }}>
                    {formatRupiah(totalSiapCair)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Riwayat */}
      {penarikanList.length > 0 && (
        <div style={card}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--bdr)" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>Riwayat Pencairan</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--bdr)" }}>
                  {["Nasabah", "Jumlah", "Periode", "Admin Saksi", "Tanggal"].map((h, i) => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: i === 1 || i === 4 ? "right" : "left",
                      fontSize: "10px", fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: "0.7px", color: "var(--text3)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {penarikanList.map((p: any, i: number) => (
                  <tr key={p.id} style={{ borderBottom: i < penarikanList.length - 1 ? "1px solid var(--bdr)" : "none" }}>
                    <td style={{ padding: "11px 16px", fontWeight: 600, color: "var(--text)" }}>
                      {p.nasabah?.nama_lengkap}
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
        </div>
      )}
    </div>
  );
}