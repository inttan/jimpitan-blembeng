// src/app/(dashboard)/laporan/page.tsx
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggal } from "@/lib/utils";

async function getLaporanData() {
  const supabase = await createClient();
  const [saldoRes, transaksiRes, kasRes, penarikanRes] = await Promise.all([
    supabase.from("v_saldo_nasabah").select("*").eq("status", "aktif").order("saldo_aktif", { ascending: false }),
    supabase.from("transaksi_setoran")
      .select(`kode_transaksi, berat_kg, nilai_kotor, potongan_kas, nilai_bersih, tanggal_setor,
        nasabah:nasabah_id (nama_lengkap), sampah:sampah_id (nama_sampah, kategori)`)
      .eq("status", "terverifikasi")
      .order("tanggal_setor", { ascending: false })
      .limit(50),
    supabase.from("kas_operasional").select("jumlah, tanggal").order("tanggal", { ascending: false }),
    supabase.from("transaksi_penarikan_tunai").select("*, nasabah:nasabah_id (nama_lengkap)").order("created_at", { ascending: false }),
  ]);

  const totalKas = (kasRes.data ?? []).reduce((s, k) => s + k.jumlah, 0);
  return {
    saldoList: saldoRes.data ?? [],
    transaksiList: transaksiRes.data ?? [],
    totalKas,
    penarikanList: penarikanRes.data ?? [],
  };
}

export default async function LaporanPage() {
  const { saldoList, transaksiList, totalKas, penarikanList } = await getLaporanData();

  const totalTabungan = saldoList.reduce((s, n) => s + (n.saldo_aktif ?? 0), 0);
  const totalSetoran = transaksiList.reduce((s, t) => s + (t.nilai_bersih ?? 0), 0);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Laporan</h1>
        <p className="text-sm text-gray-500">Ringkasan keuangan dan transaksi bank sampah</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Tabungan Warga", value: formatRupiah(totalTabungan), icon: "🏦", color: "text-amber-700" },
          { label: "Total Setoran Bersih", value: formatRupiah(totalSetoran), icon: "♻️", color: "text-emerald-700" },
          { label: "Total Kas Terkumpul", value: formatRupiah(totalKas), icon: "💼", color: "text-blue-700" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{s.icon}</span>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{s.label}</p>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Saldo per Nasabah */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 px-5 py-4">
          <p className="text-sm font-semibold text-gray-800">Saldo Tabungan per Nasabah</p>
          <p className="text-xs text-gray-400">Diurutkan dari saldo terbesar · Data real-time dari database</p>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-50 text-xs uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-5 py-3 text-left">Kode</th>
              <th className="px-5 py-3 text-left">Nama Nasabah</th>
              <th className="px-5 py-3 text-right">Total Setoran</th>
              <th className="px-5 py-3 text-right">Total Dicairkan</th>
              <th className="px-5 py-3 text-right">Saldo Aktif</th>
              <th className="px-5 py-3 text-right">Jml Transaksi</th>
            </tr>
          </thead>
          <tbody>
            {saldoList.map((n, i) => (
              <tr key={n.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i === saldoList.length - 1 ? "border-0" : ""}`}>
                <td className="px-5 py-3 font-mono text-xs text-gray-400">{n.kode_nasabah}</td>
                <td className="px-5 py-3 font-medium text-gray-800">{n.nama_lengkap}</td>
                <td className="px-5 py-3 text-right text-gray-600">{formatRupiah(n.total_setoran_bersih ?? 0)}</td>
                <td className="px-5 py-3 text-right text-red-500">{formatRupiah(n.total_dicairkan ?? 0)}</td>
                <td className="px-5 py-3 text-right font-bold text-emerald-700">{formatRupiah(n.saldo_aktif ?? 0)}</td>
                <td className="px-5 py-3 text-right text-gray-400">{n.total_transaksi} kali</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td colSpan={4} className="px-5 py-3 text-right text-gray-700">Total Liabilities (wajib disiapkan)</td>
              <td className="px-5 py-3 text-right text-amber-700">{formatRupiah(totalTabungan)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Riwayat Transaksi */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 px-5 py-4">
          <p className="text-sm font-semibold text-gray-800">Riwayat Transaksi Setoran</p>
          <p className="text-xs text-gray-400">50 transaksi terbaru</p>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-50 text-xs uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-5 py-3 text-left">Kode</th>
              <th className="px-5 py-3 text-left">Nasabah</th>
              <th className="px-5 py-3 text-left">Sampah</th>
              <th className="px-5 py-3 text-right">Berat</th>
              <th className="px-5 py-3 text-right">Kotor</th>
              <th className="px-5 py-3 text-right">Kas 10%</th>
              <th className="px-5 py-3 text-right">Bersih</th>
              <th className="px-5 py-3 text-right">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {transaksiList.map((t: any, i: number) => (
              <tr key={t.kode_transaksi} className={`border-b border-gray-50 hover:bg-gray-50 ${i === transaksiList.length - 1 ? "border-0" : ""}`}>
                <td className="px-5 py-3 font-mono text-xs text-gray-400">{t.kode_transaksi}</td>
                <td className="px-5 py-3 font-medium text-gray-800">{t.nasabah?.nama_lengkap ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">{t.sampah?.nama_sampah ?? "—"}</span>
                </td>
                <td className="px-5 py-3 text-right text-gray-600">{t.berat_kg} kg</td>
                <td className="px-5 py-3 text-right text-gray-500">{formatRupiah(t.nilai_kotor)}</td>
                <td className="px-5 py-3 text-right text-red-400 text-xs">{formatRupiah(t.potongan_kas)}</td>
                <td className="px-5 py-3 text-right font-semibold text-emerald-700">{formatRupiah(t.nilai_bersih)}</td>
                <td className="px-5 py-3 text-right text-xs text-gray-400">{formatTanggal(t.tanggal_setor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Riwayat Penarikan */}
      {penarikanList.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-50 px-5 py-4">
            <p className="text-sm font-semibold text-gray-800">Riwayat Pencairan Lebaran</p>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-50 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-5 py-3 text-left">Kode</th>
                <th className="px-5 py-3 text-left">Nasabah</th>
                <th className="px-5 py-3 text-right">Jumlah Dicairkan</th>
                <th className="px-5 py-3 text-left">Periode</th>
                <th className="px-5 py-3 text-left">Admin Saksi</th>
                <th className="px-5 py-3 text-right">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {penarikanList.map((p: any, i: number) => (
                <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i === penarikanList.length - 1 ? "border-0" : ""}`}>
                  <td className="px-5 py-3 font-mono text-xs text-gray-400">{p.kode_penarikan}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{p.nasabah?.nama_lengkap ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-bold text-amber-700">{formatRupiah(p.jumlah_diterima)}</td>
                  <td className="px-5 py-3 text-gray-600">{p.periode_lebaran}</td>
                  <td className="px-5 py-3 text-gray-500">{p.admin_saksi}</td>
                  <td className="px-5 py-3 text-right text-xs text-gray-400">{formatTanggal(p.tanggal_pencairan)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
