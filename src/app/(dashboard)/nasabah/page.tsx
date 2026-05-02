// src/app/dashboard/nasabah/page.tsx

import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import FormTambahNasabah from "@/components/forms/FormTambahNasabah";
import NasabahActions from "@/components/forms/NasabahActions";
import { Users, CheckCircle, Landmark } from "lucide-react";

async function getNasabah() {
  const supabase = await createClient();
  const { data } = await supabase.from("v_saldo_nasabah").select("*").order("nama_lengkap");
  return data ?? [];
}

const card = {
  background: "var(--surf)", border: "1px solid var(--bdr)",
  borderRadius: "var(--r)", boxShadow: "var(--shd)",
};

export default async function NasabahPage() {
  const nasabahList = await getNasabah();
  const aktif = nasabahList.filter((n) => n.status === "aktif");
  const punyaSaldo = nasabahList.filter((n) => (n.saldo_aktif ?? 0) > 0);
  const totalTabungan = nasabahList.reduce((s, n) => s + (n.saldo_aktif ?? 0), 0);

  const stats = [
    { label: "Total Terdaftar", value: nasabahList.length, Icon: Users, color: "var(--p)" },
    { label: "Nasabah Aktif", value: aktif.length, Icon: CheckCircle, color: "#22c55e" },
    { label: "Punya Tabungan", value: punyaSaldo.length, Icon: Landmark, color: "var(--acc)" },
  ];

  const headers = ["Kode", "Nama Lengkap", "No. WA", "RT/RW", "Total Setoran", "Saldo Aktif", "Status", "Terdaftar", "Aksi"];

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.4px" }}>
            Data Nasabah
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "4px" }}>
            {aktif.length} nasabah aktif · Total tabungan {formatRupiah(totalTabungan)}
          </p>
        </div>
        <FormTambahNasabah />
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {stats.map(({ label, value, Icon, color }) => (
          <div key={label} style={{ ...card, padding: "16px 18px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "9px",
              background: "var(--p5)", display: "flex", alignItems: "center",
              justifyContent: "center", color, marginBottom: "10px",
            }}>
              <Icon size={16} strokeWidth={2.5} />
            </div>
            <p style={{ fontSize: "26px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px" }}>
              {value}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "3px" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={card}>
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid var(--bdr)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>Daftar Nasabah</p>
            <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px" }}>
              Semua nasabah terdaftar
            </p>
          </div>
        </div>

        {nasabahList.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px", background: "var(--surf3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text3)", margin: "0 auto 12px",
            }}>
              <Users size={24} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: "13px", color: "var(--text3)" }}>Belum ada nasabah terdaftar.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--bdr)" }}>
                  {headers.map((h, i) => (
                    <th key={h} style={{
                      padding: "10px 16px",
                      textAlign:
                        i >= 4 && i <= 5 ? "right"
                        : i === 6 || i === 8 ? "center"
                        : "left",
                      fontSize: "10px", fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: "0.7px", color: "var(--text3)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nasabahList.map((n, i) => (
                  <tr key={n.id} style={{
                    borderBottom: i < nasabahList.length - 1 ? "1px solid var(--bdr)" : "none",
                  }}>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text3)" }}>
                        {n.kode_nasabah}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text)" }}>
                      {n.nama_lengkap}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text2)" }}>{n.no_wa ?? "—"}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text2)" }}>{n.rt_rw ?? "—"}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--text2)" }}>
                      {formatRupiah(n.total_setoran ?? 0)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--p)" }}>
                      {formatRupiah(n.saldo_aktif ?? 0)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <span style={{
                        background: n.status === "aktif" ? "var(--p5)" : "var(--surf3)",
                        color: n.status === "aktif" ? "var(--p)" : "var(--text3)",
                        borderRadius: "20px", padding: "3px 10px",
                        fontSize: "11px", fontWeight: 600,
                      }}>{n.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "11px", color: "var(--text3)" }}>
                      {formatTanggal(n.tanggal_daftar)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <NasabahActions nasabah={{
                        id: n.id,
                        nama_lengkap: n.nama_lengkap,
                        no_wa: n.no_wa,
                        rt_rw: n.rt_rw,
                        status: n.status,
                      }} />
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