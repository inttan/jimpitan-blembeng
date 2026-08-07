import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/ui/DashboardClient";
import { getMingguKe, formatPeriodeMinggu } from "@/lib/jimpitan";

async function getDashboardData() {
  try {
    const supabase = await createClient();
    const mingguIni = getMingguKe();

    const [
      saldoRes,
      upahRes,
      wargaRes,
      txMingguRes,
      txTerbaruRes,
      kasAllRes,
      kasPrevRes,
    ] = await Promise.all([
      supabase.from("v_saldo_kas").select("saldo_kas_kegiatan").maybeSingle(),
      supabase.from("v_upah_belum_dibayar").select("total_belum_dibayar"),
      supabase.from("warga").select("id, nama, no_hp, no_rumah, status_aktif"),
      supabase
        .from("jimpitan_transaksi")
        .select("id, jumlah_setor, status, warga_id, minggu_ke")
        .eq("minggu_ke", mingguIni),
      supabase
        .from("jimpitan_transaksi")
        .select("id, status, minggu_ke, jumlah_setor, created_at, warga:warga_id (nama, no_rumah)")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase.from("kas_kegiatan").select("jenis, jumlah, tanggal, created_at"),
      supabase
        .from("kas_kegiatan")
        .select("jenis, jumlah")
        .lt("tanggal", mingguIni)
        .order("tanggal", { ascending: false }),
    ]);

    const wargaList = wargaRes.data ?? [];
    const wargaAktif = wargaList.filter((w) => w.status_aktif).length;
    const totalWarga = wargaList.length;

    const totalUpahBelum = (upahRes.data ?? []).reduce(
      (s, r) => s + Number(r.total_belum_dibayar ?? 0),
      0
    );

    const txMinggu = txMingguRes.data ?? [];
    const lunasMingguIni = txMinggu.filter((t) => t.status === "lunas").length;
    const totalSetorMingguIni = txMinggu
      .filter((t) => t.status === "lunas")
      .reduce((s, t) => s + Number(t.jumlah_setor ?? 0), 0);

    // Hitung warga yang belum setor minggu ini
    const lunasIds = new Set(txMinggu.filter((t) => t.status === "lunas").map((t) => t.warga_id));
    const belumSetor = wargaList
      .filter((w: any) => w.status_aktif && !lunasIds.has(w.id))
      .map((w: any) => ({ id: w.id, nama: w.nama, no_hp: w.no_hp, no_rumah: w.no_rumah }));

    // Chart bulanan dari kas_kegiatan — 6 bulan terakhir
    const bulanLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const kasBulanan: Record<number, { masuk: number; keluar: number }> = {};
    let totalMasuk = 0;
    let totalKeluar = 0;

    (kasAllRes.data ?? []).forEach((k: any) => {
      const bln = new Date(k.tanggal || k.created_at).getMonth();
      if (!kasBulanan[bln]) kasBulanan[bln] = { masuk: 0, keluar: 0 };
      const jml = Number(k.jumlah ?? 0);
      if (k.jenis === "masuk") {
        kasBulanan[bln].masuk += jml;
        totalMasuk += jml;
      } else {
        kasBulanan[bln].keluar += jml;
        totalKeluar += jml;
      }
    });

    const bulanIni = new Date().getMonth();
    const chartBulanan = Array.from({ length: 6 }, (_, i) => {
      const idx = (bulanIni - 5 + i + 12) % 12;
      const d = kasBulanan[idx] ?? { masuk: 0, keluar: 0 };
      return {
        bulan: bulanLabels[idx],
        nilai: d.masuk,
        keluar: d.keluar,
      };
    });

    let akumulasiRunning = 0;
    const chartAkumulasi = chartBulanan.map((d) => {
      akumulasiRunning += d.nilai - d.keluar;
      return { bulan: d.bulan, akumulasi: Math.max(0, akumulasiRunning) };
    });

    // Saldo minggu lalu (dari kas sebelum minggu ini)
    let saldoKasPrev = 0;
    (kasPrevRes.data ?? []).forEach((k: any) => {
      saldoKasPrev += k.jenis === "masuk" ? Number(k.jumlah) : -Number(k.jumlah);
    });

    return {
      saldoKas: Number(saldoRes.data?.saldo_kas_kegiatan ?? 0),
      saldoKasPrev,
      belumSetor,
      totalUpahBelum,
      wargaAktif,
      totalWarga,
      lunasMingguIni,
      totalSetorMingguIni,
      transaksiTerbaru: (txTerbaruRes.data ?? []).map((t: any) => ({
        id: t.id,
        status: t.status,
        potongan_kas: Number(t.potongan_kas ?? 0),
        dana_kegiatan: Number(t.dana_kegiatan ?? 0),
        minggu_ke: t.minggu_ke,
        warga: t.warga,
        jumlah_setor: Number(t.jumlah_setor ?? 0),
      })),
      chartBulanan,
      chartAkumulasi,
      mingguIni: new Date(mingguIni + "T00:00:00").toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
      formatPeriode: formatPeriodeMinggu(mingguIni),
    };
  } catch (e) {
    console.error(e);
    return {
      saldoKas: 0, saldoKasPrev: 0,
      belumSetor: [],
      totalUpahBelum: 0,
      wargaAktif: 0, totalWarga: 0,
      lunasMingguIni: 0, totalSetorMingguIni: 0,
      transaksiTerbaru: [], chartBulanan: [], chartAkumulasi: [],
      mingguIni: "", formatPeriode: "",
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardClient {...data} />;
}
