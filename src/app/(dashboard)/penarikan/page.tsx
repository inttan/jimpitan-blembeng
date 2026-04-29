import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import FormPenarikan from "@/components/forms/FormPenarikan";

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
  return { nasabahList: (nasabahRes.data ?? []) as any[], penarikanList: (penarikanRes.data ?? []) as any[] };
}

export default async function PenarikanPage() {
  const { nasabahList, penarikanList } = await getData();
  const totalSiapCair = nasabahList.reduce((s: number, n: any) => s + (n.saldo_aktif ?? 0), 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pencairan Tabungan Lebaran</h1>
          <p className="text-sm text-gray-500">
            {nasabahList.length} nasabah siap cairkan · Total {formatRupiah(totalSiapCair)}
          </p>
        </div>
        <FormPenarikan nasabahList={nasabahList} />
      </div>

      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <span className="text-2xl">🕌</span>
        <div>
          <p className="font-semibold text-amber-800">Panduan Pencairan</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Pencairan dilakukan sekali setahun sebelum Lebaran. Setelah dicatat, saldo nasabah otomatis berkurang.
            Kirim notifikasi WA setelah pencairan dicatat.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 px-5 py-4">
          <p className="text-sm font-semibold text-gray-800">Nasabah Siap Dicairkan</p>
        </div>
        {nasabahList.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            Semua saldo sudah dicairkan atau belum ada transaksi.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-50 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-5 py-3 text-left">Nama Nasabah</th>
                <th className="px-5 py-3 text-left">No. WA</th>
                <th className="px-5 py-3 text-right">Saldo Siap Cair</th>
              </tr>
            </thead>
            <tbody>
              {nasabahList.map((n: any, i: number) => (
                <tr key={n.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i === nasabahList.length - 1 ? "border-0" : ""}`}>
                  <td className="px-5 py-3.5 font-medium text-gray-800">{n.nama_lengkap}</td>
                  <td className="px-5 py-3.5 text-gray-500">{n.no_wa ?? "—"}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-emerald-700">{formatRupiah(n.saldo_aktif ?? 0)}</td>
                </tr>
              ))}
              <tr className="bg-amber-50">
                <td colSpan={2} className="px-5 py-3 text-right font-semibold text-amber-800">Total harus disiapkan</td>
                <td className="px-5 py-3 text-right font-bold text-amber-700 text-base">{formatRupiah(totalSiapCair)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {penarikanList.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-50 px-5 py-4">
            <p className="text-sm font-semibold text-gray-800">Riwayat Pencairan</p>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-50 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-5 py-3 text-left">Nasabah</th>
                <th className="px-5 py-3 text-right">Jumlah</th>
                <th className="px-5 py-3 text-left">Periode</th>
                <th className="px-5 py-3 text-left">Admin Saksi</th>
                <th className="px-5 py-3 text-right">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {penarikanList.map((p: any, i: number) => (
                <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i === penarikanList.length - 1 ? "border-0" : ""}`}>
                  <td className="px-5 py-3 font-medium text-gray-800">{p.nasabah?.nama_lengkap}</td>
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