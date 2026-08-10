import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import ButtonDownloadLaporan from "@/components/forms/ButtonDownloadLaporan";

async function getLaporanData() {
  const supabase = await createClient();

  const [saldoRes, txRes, kasRes, riwayatRes] = await Promise.all([
    supabase.from("v_saldo_kas").select("saldo_kas_kegiatan").maybeSingle(),
    supabase.from("jimpitan_transaksi").select("*, warga:warga_id (nama, no_rumah)").order("created_at", { ascending: false }).limit(100),
    supabase.from("kas_kegiatan").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("riwayat_perubahan").select("*").order("created_at", { ascending: false }).limit(50),
  ]);

  const aktivitas: any[] = [];

  // ── SETOR ──────────────────────────────────────────────────────────
  // Setoran warga per KK (lunas / belum / nihil).
  (txRes.data ?? []).forEach((t: any) => {
    const waktu = new Date(t.created_at);
    aktivitas.push({
      id: `tx-${t.id}`,
      waktu: waktu.getTime(),
      labelWaktu: waktu.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + ` ${waktu.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`,
      aksi: "SETOR",
      label: t.status === "lunas" ? "Lunas" : t.status === "belum" ? "Belum" : "Nihil",
      jumlah: Number(t.jumlah_setor ?? 0),
      warna: t.status === "lunas" ? "#22C55E" : t.status === "belum" ? "#EF4444" : "#9CA3AF",
      detail: `${t.warga?.nama ?? "—"} · RT ${t.warga?.no_rumah ?? "—"}`,
    });
  });

  // ── KAS MASUK ──────────────────────────────────────────────────
  // Setoran jimpitan lunas — amount dari kas_kegiatan, nama dari jimpitan_transaksi.
  // Join kas_kegiatan (transaksi_ref) ke jimpitan_transaksi untuk dapat nama warga.
  const txMap = new Map((txRes.data ?? []).map((t: any) => [t.id, t]));
  (kasRes.data ?? []).filter((k: any) => k.jenis === "masuk" && k.transaksi_ref !== null).forEach((k: any) => {
    const tx = txMap.get(k.transaksi_ref);
    const waktu = new Date(k.created_at);
    aktivitas.push({
      id: `kas-in-${k.id}`,
      waktu: waktu.getTime(),
      labelWaktu: waktu.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + ` ${waktu.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`,
      aksi: "KAS MASUK",
      label: "Setoran Jimpitan",
      jumlah: Number(k.jumlah ?? 0),
      warna: "#22C55E",
      detail: `${tx?.warga?.nama ?? "—"} · RT ${tx?.warga?.no_rumah ?? "—"}`,
    });
  });
  // Kas masuk MANUAL (transaksi_ref = null).
  (kasRes.data ?? []).filter((k: any) => k.jenis === "masuk" && k.transaksi_ref === null).forEach((k: any) => {
    const waktu = new Date(k.created_at);
    aktivitas.push({
      id: `kas-in-manual-${k.id}`,
      waktu: waktu.getTime(),
      labelWaktu: waktu.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + ` ${waktu.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`,
      aksi: "KAS MASUK",
      label: "Manual",
      jumlah: Number(k.jumlah ?? 0),
      warna: "#22C55E",
      detail: k.keterangan ?? "Kas masuk manual",
    });
  });

  // ── KAS KELUAR ────────────────────────────────────────────────
  (kasRes.data ?? []).filter((k: any) => k.jenis === "keluar").forEach((k: any) => {
    const waktu = new Date(k.created_at);
    aktivitas.push({
      id: `kas-out-${k.id}`,
      waktu: waktu.getTime(),
      labelWaktu: waktu.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + ` ${waktu.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`,
      aksi: "KAS KELUAR",
      label: k.nama_penarik ? `Upah · ${k.nama_penarik}` : "Penarikan",
      jumlah: Number(k.jumlah ?? 0),
      warna: "#EF4444",
      detail: k.keterangan ?? "Penarikan kas",
    });
  });

  // ── EDIT WARGA ─────────────────────────────────────────────────
  (riwayatRes.data ?? []).filter((r: any) => r.tabel === "warga").forEach((r: any) => {
    const waktu = new Date(r.created_at);
    const baru = r.data_baru;
    const lama = r.data_lama;
    let detail = "";
    let warna = "#8B5CF6";
    let label = "Edit";
    if (r.aksi === "insert") {
      label = "Tambah";
      detail = `${baru?.nama ?? "—"} · RT ${baru?.no_rumah ?? "—"}`;
      warna = "#22C55E";
    } else if (r.aksi === "update") {
      if (baru?.status_aktif === false) {
        label = "Nonaktif";
        detail = baru?.nama ?? "—";
      } else {
        label = "Edit";
        const perubahan: string[] = [];
        if (lama?.nama !== baru?.nama) perubahan.push(`nama`);
        if (lama?.no_rumah !== baru?.no_rumah) perubahan.push(`RT`);
        if (lama?.no_hp !== baru?.no_hp) perubahan.push(`WA`);
        detail = perubahan.length > 0 ? `Edit: ${perubahan.join(", ")}` : baru?.nama ?? "—";
      }
    }
    aktivitas.push({
      id: `warga-${r.id}`,
      waktu: waktu.getTime(),
      labelWaktu: waktu.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + ` ${waktu.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`,
      aksi: "EDIT WARGA",
      label,
      jumlah: undefined,
      warna,
      detail,
    });
  });

  aktivitas.sort((a, b) => b.waktu - a.waktu);

  const totalMasuk = (kasRes.data ?? []).filter((k: any) => k.jenis === "masuk").reduce((s: number, k: any) => s + Number(k.jumlah ?? 0), 0);
  const totalKeluar = (kasRes.data ?? []).filter((k: any) => k.jenis === "keluar").reduce((s: number, k: any) => s + Number(k.jumlah ?? 0), 0);

  return { saldo: Number(saldoRes.data?.saldo_kas_kegiatan ?? 0), aktivitas, totalMasuk, totalKeluar };
}

function IkonAksi({ aksi }: { aksi: string }) {
  if (aksi === "SETOR") return "💰";
  if (aksi === "KAS MASUK") return "📥";
  if (aksi === "KAS KELUAR") return "📤";
  return "✏️";
}

export default async function LaporanPage() {
  const { saldo, aktivitas, totalMasuk, totalKeluar } = await getLaporanData();

  return (
    <div style={{ padding: "20px 16px 60px", maxHeight: "100vh", overflowY: "auto" }} className="md:p-7 md:pb-20">

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "20px", fontWeight: 600, color: "var(--green)", margin: 0 }} className="md:text-2xl">Laporan &amp; Riwayat</h1>
          <p style={{ fontSize: "11.5px", color: "var(--ink-soft)", marginTop: "4px" }} className="md:text-sm">Transparansi kas kegiatan</p>
        </div>
      </div>

      {/* Ringkasan Kas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }} className="md:grid-cols-3">
        <div style={{ background: "var(--paper-raised)", border: "1px solid var(--line)", borderRadius: "12px", padding: "14px 16px", borderLeft: "4px solid var(--green)" }}>
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", fontWeight: 600, marginBottom: "6px" }}>Saldo Kas</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--green)", fontFamily: "'IBM Plex Mono', monospace" }}>{formatRupiah(saldo)}</div>
        </div>
        <div style={{ background: "var(--paper-raised)", border: "1px solid var(--line)", borderRadius: "12px", padding: "14px 16px", borderLeft: "4px solid #22C55E" }}>
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", fontWeight: 600, marginBottom: "6px" }}>Total Kas Masuk</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#22C55E", fontFamily: "'IBM Plex Mono', monospace" }}>{formatRupiah(totalMasuk)}</div>
        </div>
        <div style={{ background: "var(--paper-raised)", border: "1px solid var(--line)", borderRadius: "12px", padding: "14px 16px", borderLeft: "4px solid #EF4444" }}>
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", fontWeight: 600, marginBottom: "6px" }}>Total Kas Keluar</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#EF4444", fontFamily: "'IBM Plex Mono', monospace" }}>{formatRupiah(totalKeluar)}</div>
        </div>
      </div>

      {/* Ekspor PDF */}
      <div style={{ background: "var(--paper-raised)", border: "1px solid var(--line)", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "14px", fontWeight: 600, color: "var(--green)", margin: "0 0 12px" }}>📥 Ekspor Laporan</h2>
        <ButtonDownloadLaporan />
      </div>

      {/* Riwayat Lengkap */}
      <div style={{ background: "var(--paper-raised)", border: "1px solid var(--line)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", background: "var(--surf2)" }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "14px", fontWeight: 600, color: "var(--green)", margin: 0 }}>📋 Riwayat Lengkap</h2>
          <p style={{ fontSize: "11px", color: "var(--ink-soft)", margin: "2px 0 0" }}>Terbaru di atas</p>
        </div>

        {aktivitas.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--ink-soft)", fontSize: "13px" }}>Belum ada aktivitas.</div>
        ) : (
          <div>
            {aktivitas.map((item, i) => (
              <div key={item.id} style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: i < aktivitas.length - 1 ? "1px solid var(--line)" : "none",
              }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "50%", background: item.warna,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginRight: "12px", fontSize: "16px",
                }}>
                  <IkonAksi aksi={item.aksi} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px", flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "10.5px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px",
                      background: `${item.warna}20`, color: item.warna, textTransform: "uppercase",
                    }}>{item.aksi}</span>
                    <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "var(--surf2)", color: "var(--ink-soft)" }}>{item.label}</span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--ink)", marginBottom: "2px" }}>{item.detail}</div>
                  <div style={{ fontSize: "11px", color: "var(--ink-soft)", fontFamily: "'IBM Plex Mono', monospace" }}>
                    {item.labelWaktu}
                  </div>
                </div>
                {item.jumlah !== undefined && (
                  <div style={{
                    background: `${item.warna}15`,
                    border: `1px solid ${item.warna}35`,
                    borderRadius: "8px",
                    padding: "6px 12px",
                    flexShrink: 0,
                    marginLeft: "12px",
                    textAlign: "right",
                  }}>
                    <div style={{ fontSize: "10px", color: item.warna, fontWeight: 600 }}>
                      {item.aksi === "KAS KELUAR" ? "KELUAR" : "MASUK"}
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: "14px", color: item.warna }}>
                      {item.aksi === "KAS KELUAR" ? "-" : "+"}Rp {Math.round(item.jumlah).toLocaleString("id-ID")}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
