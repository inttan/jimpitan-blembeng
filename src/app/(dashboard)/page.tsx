import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/ui/DashboardClient";

async function getDashboardData() {
  try {
    const supabase = await createClient();
    const [metricsRes, nasabahStatsRes, setoranBaruRes, semuaBaruRes] = await Promise.all([
      supabase.from("v_dashboard_metrics").select("*").single(),
      supabase.from("v_nasabah_stats").select("*").single(),

      supabase.from("setoran")
        .select(`setoran_id, total_nilai_bersih, created_at,
          nasabah:nasabah_id (nama_lengkap),
          setoran_detail (berat_kg, sampah:sampah_id (nama_sampah, kategori))`)
        .eq("status", "terverifikasi")
        .order("created_at", { ascending: false })
        .limit(6),

      supabase.from("setoran")
        .select(`total_nilai_bersih, created_at,
          setoran_detail (berat_kg, sampah:sampah_id (kategori, nama_sampah))`)
        .eq("status", "terverifikasi"),
    ]);

    const transaksiTerbaru = (setoranBaruRes.data ?? []).map((s: any) => {
      const details = s.setoran_detail ?? [];
      const totalBerat = details.reduce((sum: number, d: any) => sum + (d.berat_kg ?? 0), 0);
      const firstDetail = details[0];
      const namaSampah = firstDetail?.sampah?.nama_sampah
        ? details.length > 1
          ? `${firstDetail.sampah.nama_sampah} +${details.length - 1}`
          : firstDetail.sampah.nama_sampah
        : "—";
      return {
        id: s.setoran_id,
        berat_kg: totalBerat,
        nilai_bersih: s.total_nilai_bersih,
        tanggal_setor: s.created_at,
        nasabah: s.nasabah,
        sampah: { nama_sampah: namaSampah, kategori: firstDetail?.sampah?.kategori ?? "" },
      };
    });

    const bulanLabels = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    const setoranBulanan: Record<number, { nilai: number; berat: number }> = {};
    const sampahKategori: Record<string, number> = {};
    let akumulasiRunning = 0;

    (semuaBaruRes.data ?? []).forEach((s: any) => {
      const bulan = new Date(s.created_at).getMonth();
      if (!setoranBulanan[bulan]) setoranBulanan[bulan] = { nilai: 0, berat: 0 };
      setoranBulanan[bulan].nilai += s.total_nilai_bersih ?? 0;
      (s.setoran_detail ?? []).forEach((d: any) => {
        setoranBulanan[bulan].berat += d.berat_kg ?? 0;
        const kat = d.sampah?.kategori ?? "lainnya";
        sampahKategori[kat] = (sampahKategori[kat] ?? 0) + (d.berat_kg ?? 0);
      });
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
      transaksiTerbaru,
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