import { createClient } from "@/lib/supabase/server";
import FormJimpitan from "@/components/forms/FormJimpitan";
import { formatRupiah, formatTanggalPendek } from "@/lib/utils";

interface TxRow {
  id: string;
  warga?: { nama: string; no_rumah?: string | null };
  status: string;
  jumlah_setor: number;
  minggu_ke: string;
  created_at: string;
}

async function getData() {
  const supabase = await createClient();
  const [wargaRes, txRes] = await Promise.all([
    supabase.from("warga").select("id, nama, no_rumah, no_hp").eq("status_aktif", true).order("nama"),
    supabase
      .from("jimpitan_transaksi")
      .select("id, warga:warga_id (nama, no_rumah), status, jumlah_setor, minggu_ke, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const existingTxs = (txRes.data ?? []).map((t: any) => ({
    warga_id: t.warga_id,
    minggu_ke: t.minggu_ke,
    status: t.status,
  }));

  return {
    wargaList: (wargaRes.data ?? []).map((w: any) => ({ id: w.id, nama: w.nama, no_rumah: w.no_rumah, no_hp: w.no_hp })),
    existingTxs,
    txRows: txRes.data ?? [],
  };
}

export default async function TransaksiPage() {
  const { wargaList, existingTxs, txRows } = await getData();

  return (
    <div style={{ padding: "20px 16px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "20px", fontWeight: 600, color: "var(--green)", margin: 0 }}>Catatan Setoran</h1>
      </div>

      <FormJimpitan wargaList={wargaList} existingTxs={existingTxs} />

      {txRows.length > 0 && (
        <div style={{ background: "var(--paper-raised)", border: "1px solid var(--line)", borderRadius: "12px", overflow: "hidden", marginTop: "24px" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", background: "var(--surf2)" }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "13px", fontWeight: 600, color: "var(--green)", margin: 0 }}>Riwayat Transaksi</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--line)" }}>
                {["Nama", "RT/RW", "Nominal", "Status", "Minggu"].map(h => (
                  <th key={h} style={{
                    textAlign: h === "Nominal" ? "right" : "left",
                    padding: "7px 12px",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--ink-soft)",
                    fontWeight: 600,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(txRows as unknown as TxRow[]).map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < txRows.length - 1 ? "1px solid var(--line)" : "none" }}>
                  <td style={{ padding: "9px 12px", fontWeight: 600, color: "var(--ink)" }}>{r.warga?.nama ?? "—"}</td>
                  <td style={{ padding: "9px 12px", color: "var(--ink-soft)", fontSize: "11px" }}>{r.warga?.no_rumah ?? "—"}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px" }}>
                    {r.status === "nihil" ? "—" : formatRupiah(Number(r.jumlah_setor ?? 0))}
                  </td>
                  <td style={{ padding: "9px 12px" }}>
                    <span style={{
                      fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "10px",
                      padding: "2px 8px", borderRadius: "20px",
                      color: r.status === "lunas" ? "var(--green)" : r.status === "belum" ? "var(--red)" : "var(--ink-soft)",
                      background: r.status === "lunas" ? "rgba(31,61,43,0.08)" : r.status === "belum" ? "rgba(161,61,61,0.08)" : "rgba(92,88,75,0.08)",
                    }}>
                      {r.status === "lunas" ? "Lunas" : r.status === "belum" ? "Belum" : "Nihil"}
                    </span>
                  </td>
                  <td style={{ padding: "9px 12px", fontSize: "11px", color: "var(--ink-soft)" }}>
                    {formatTanggalPendek(r.minggu_ke)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
