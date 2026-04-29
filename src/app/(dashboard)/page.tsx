import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/ui/DashboardClient";

async function getDashboardData() {
  try {
    const supabase = await createClient();
    const [metricsRes, nasabahStatsRes, transaksiRes, semuaTransaksiRes] = await Promise.all([
      supabase.from("v_dashboard_metrics").select("*").single(),
      supabase.from("v_nasabah_stats").select("*").single(),
      supabase.from("transaksi_setoran")
        .select(`id, berat_kg, nilai_bersih, tanggal_setor,
          nasabah:nasabah_id (nama_lengkap),
          sampah:sampah_id (nama_sampah, kategori)`)
        .eq("status", "terverifikasi")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase.from("transaksi_setoran")
        .select("nilai_bersih, berat_kg, tanggal_setor, sampah:sampah_id (kategori, nama_sampah)")
        .eq("status", "terverifikasi"),
    ]);

    const bulanLabels = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    const setoranBulanan: Record<number, { nilai: number; berat: number }> = {};
    const sampahKategori: Record<string, number> = {};
    let akumulasiRunning = 0;

    (semuaTransaksiRes.data ?? []).forEach((t: any) => {
      const bulan = new Date(t.tanggal_setor).getMonth();
      if (!setoranBulanan[bulan]) setoranBulanan[bulan] = { nilai: 0, berat: 0 };
      setoranBulanan[bulan].nilai += t.nilai_bersih ?? 0;
      setoranBulanan[bulan].berat += t.berat_kg ?? 0;
      const kat = t.sampah?.kategori ?? "lainnya";
      sampahKategori[kat] = (sampahKategori[kat] ?? 0) + (t.berat_kg ?? 0);
    });

    const bulanIni = new Date().getMonth();
    const chartBulanan = Array.from({ length: 6 }, (_, i) => {
      const idx = (bulanIni - 5 + i + 12) % 12;
      const d = setoranBulanan[idx] ?? { nilai: 0, berat: 0 };
      akumulasiRunning += d.nilai;
      return { bulan: bulanLabels[idx], nilai: d.nilai, berat: d.berat, akumulasi: akumulasiRunning };
    });

    const chartKomposisi = Object.entries(sampahKategori).map(([k, v]) => ({
      name: k.charAt(0).toUpperCase() + k.slice(1), value: v,
    }));

    return {
      metrics: metricsRes.data,
      nasabahStats: nasabahStatsRes.data,
      transaksiTerbaru: transaksiRes.data ?? [],
      chartBulanan,
      chartKomposisi,
    };
  } catch (e) {
    console.error(e);
    return { metrics: null, nasabahStats: null, transaksiTerbaru: [], chartBulanan: [], chartKomposisi: [] };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardClient {...data} />;
}