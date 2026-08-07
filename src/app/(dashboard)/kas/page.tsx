import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import FormTarikKas from "@/components/forms/FormTarikKas";
import FormTarikUpah from "@/components/forms/FormTarikUpah";
import { AlertTriangle } from "lucide-react";

async function getData() {
  const supabase = await createClient();
  const [saldoRes, kasRes, upahRes, saldoUpahRes] = await Promise.all([
    supabase.from("v_saldo_kas").select("saldo_kas_kegiatan").maybeSingle(),
    supabase
      .from("kas_kegiatan")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("upah_penarik")
      .select("*, penarik:penarik_id (nama, no_hp)")
      .order("periode_mulai", { ascending: false }),
    supabase.from("v_upah_belum_dibayar").select("total_belum_dibayar"),
  ]);

  // Kas 95% dari jimpitan lunas
  const kasMasuk = (kasRes.data ?? []).filter((k) => k.jenis === "masuk");
  const kasKeluar = (kasRes.data ?? []).filter((k) => k.jenis === "keluar");

  // Saldo upah: gunakan view v_upah_belum_dibayar yang dihitung dari tabel upah_penarik
  const saldoUpah = (saldoUpahRes.data ?? []).reduce(
    (s, r) => s + Number(r.total_belum_dibayar ?? 0),
    0
  );

  return {
    saldo: Number(saldoRes.data?.saldo_kas_kegiatan ?? 0),
    kasList: kasRes.data ?? [],
    saldoUpah,
    upahList: upahRes.data ?? [],
  };
}

export default async function KasPage() {
  const { saldo, kasList, saldoUpah, upahList } = await getData();
  const totalMasuk = kasList.filter((k) => k.jenis === "masuk").reduce((s, k) => s + Number(k.jumlah), 0);
  const totalKeluar = kasList.filter((k) => k.jenis === "keluar").reduce((s, k) => s + Number(k.jumlah), 0);
  const kasKeluarList = kasList.filter((k) => k.jenis === "keluar");

  // Gabungkan riwayat upah dan kas keluar jadi satu
  type RiwayatItem = {
    tanggal: string;
    jenis: "upah" | "kas";
    keterangan: string;
    disetujui: string | null;
    jumlah: number;
    status?: string;
  };

  const riwayatUpah: RiwayatItem[] = (upahList as any[]).map((u) => ({
    tanggal: u.tanggal_dibayar ?? u.periode_selesai,
    jenis: "upah" as const,
    keterangan: `Upah penarik: ${u.penarik?.nama ?? "—"}`,
    disetujui: u.tanggal_dibayar ? u.penarik?.nama ?? "—" : null,
    jumlah: Number(u.total_upah),
    status: u.status,
  }));

  const riwayatKas: RiwayatItem[] = kasKeluarList.map((k) => ({
    tanggal: k.tanggal,
    jenis: "kas" as const,
    keterangan: k.keterangan,
    disetujui: k.disetujui_oleh,
    jumlah: Number(k.jumlah),
  }));

  const riwayatGabungan: RiwayatItem[] = [...riwayatUpah, ...riwayatKas].sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );

  return (
    <div style={{ padding: "20px 16px 60px", maxHeight: "100vh", overflowY: "auto" }} className="md:p-7 md:pb-20">
      {/* Topbar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "20px",
            fontWeight: 600,
            color: "var(--green)",
            margin: 0,
            lineHeight: 1.1,
          }} className="md:text-2xl">Kas &amp; Upah Penarik</h1>
          <div style={{ fontSize: "11.5px", color: "var(--ink-soft)", marginTop: "3px" }} className="md:text-sm">
            Kas kegiatan dari setoran jimpitan
          </div>
        </div>
      </div>

      {/* KPI */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "12px",
        marginBottom: "16px",
      }} className="md:grid-cols-2 md:gap-4 md:mb-5">
        <div style={{
          background: "var(--paper-raised)",
          border: "1px solid var(--line)",
          borderRadius: "12px",
          padding: "14px 16px",
          boxShadow: "var(--shd)",
          position: "relative",
          overflow: "hidden",
        }} className="md:p-5">
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: "4px", background: "var(--brass)", borderRadius: "12px 0 0 12px",
          }} />
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", fontWeight: 600, marginBottom: "6px" }} className="md:text-sm md:mb-2">
            Saldo Kas
          </div>
          <div style={{ fontSize: "20px", fontWeight: 600, color: "var(--green)", fontFamily: "'IBM Plex Mono', monospace", fontVariantNumeric: "tabular-nums" }} className="md:text-xl">
            {formatRupiah(saldo)}
          </div>
          <div style={{ fontSize: "11px", color: "var(--ink-soft)", marginTop: "5px" }} className="md:text-xs">
            +{formatRupiah(totalMasuk)} masuk · -{formatRupiah(totalKeluar)} keluar
          </div>
        </div>

        {/* Card: Rekap Upah */}
        <div style={{
          background: "var(--paper-raised)",
          border: "1px solid var(--line)",
          borderRadius: "12px",
          padding: "14px 16px",
          boxShadow: "var(--shd)",
          position: "relative",
          overflow: "hidden",
        }} className="md:p-5">
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: "4px", background: "var(--brass)", borderRadius: "12px 0 0 12px",
          }} />
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", fontWeight: 600, marginBottom: "6px" }} className="md:text-sm md:mb-2">
            Rekap Upah Penarik
          </div>
          <div style={{ fontSize: "20px", fontWeight: 600, color: "var(--ink)", fontFamily: "'IBM Plex Mono', monospace", fontVariantNumeric: "tabular-nums" }} className="md:text-xl">
            {formatRupiah(saldoUpah)}
          </div>
          <div style={{ fontSize: "11px", color: "var(--ink-soft)", marginTop: "5px" }} className="md:text-xs">
            Total upah belum ditarik
          </div>
        </div>
      </div>

      {/* Panel: Riwayat Gabungan */}
      <div style={{
        background: "var(--paper-raised)",
        border: "1px solid var(--line)",
        borderRadius: "12px",
        boxShadow: "var(--shd)",
        overflow: "hidden",
        marginBottom: "14px",
      }} className="md:mb-5">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 16px",
          borderBottom: "1px solid var(--line)",
          flexWrap: "wrap",
          gap: "10px",
        }} className="md:px-5">
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--green)",
            margin: 0,
          }} className="md:text-base">Riwayat Kas &amp; Upah</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <FormTarikUpah />
            <FormTarikKas saldoKas={saldo} />
          </div>
        </div>

        {/* Transparansi notice */}
        <div style={{
          margin: "12px 16px",
          background: "rgba(184,134,59,0.06)",
          border: "1px solid rgba(184,134,59,0.2)",
          borderRadius: "8px",
          padding: "8px 12px",
          display: "flex",
          gap: "8px",
          alignItems: "flex-start",
        }} className="md:mx-5 md:my-4">
          <AlertTriangle size={13} style={{ color: "var(--brass)", flexShrink: 0, marginTop: "1px" }} />
          <p style={{ fontSize: "11px", color: "var(--ink-soft)", margin: 0, lineHeight: 1.5 }}>
            Setiap pengeluaran wajib isi <strong style={{ color: "var(--ink)" }}>keterangan</strong> dan nama <strong style={{ color: "var(--ink)" }}>penyetuju</strong>.
          </p>
        </div>

        {riwayatGabungan.length === 0 ? (
          <div style={{ padding: "20px 16px 30px", textAlign: "center", color: "var(--ink-soft)", fontSize: "12px" }} className="md:py-8">
            Belum ada riwayat.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--line)" }}>
                  {["Tanggal", "Jenis", "Keterangan", "Jumlah"].map((h, i) => (
                    <th key={h} style={{
                      textAlign: i === 3 ? "right" : "left",
                      padding: "8px 12px",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--ink-soft)",
                      fontWeight: 600,
                    }} className="md:text-xs md:px-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riwayatGabungan.map((r: RiwayatItem, i: number) => (
                  <tr
                    key={`${r.jenis}-${r.tanggal}-${i}`}
                    style={{
                      borderBottom: i < riwayatGabungan.length - 1 ? "1px solid var(--line)" : "none",
                    }}
                  >
                    <td style={{ padding: "10px 12px", color: "var(--ink-soft)", fontSize: "11px", whiteSpace: "nowrap" }} className="md:px-5">
                      {formatTanggal(r.tanggal)}
                    </td>
                    <td style={{ padding: "10px 12px" }} className="md:px-5">
                      <span style={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 700,
                        fontSize: "10px",
                        padding: "3px 8px",
                        borderRadius: "20px",
                        ...(r.jenis === "upah" ? {
                          color: "var(--brass)",
                          background: "rgba(184,134,59,0.1)",
                        } : {
                          color: "var(--red)",
                          background: "rgba(161,61,61,0.1)",
                        }),
                      }}>
                        {r.jenis === "upah" ? "Upah" : "Kas"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--ink)" }} className="md:px-5">
                      {r.keterangan}
                    </td>
                    <td style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontWeight: 700,
                      color: r.jenis === "upah" ? "var(--brass)" : "var(--red)",
                      fontSize: "12px",
                    }} className="md:px-5">
                      -{formatRupiah(r.jumlah)}
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
