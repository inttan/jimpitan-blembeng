// src/app/(dashboard)/nasabah/page.tsx
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import FormTambahNasabah from "@/components/forms/FormTambahNasabah";

async function getNasabah() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_saldo_nasabah")
    .select("*")
    .order("nama_lengkap");
  return data ?? [];
}

export default async function NasabahPage() {
  const nasabahList = await getNasabah();
  const aktif = nasabahList.filter((n) => n.status === "aktif");
  const totalTabungan = nasabahList.reduce((s, n) => s + (n.saldo_aktif ?? 0), 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Nasabah</h1>
          <p className="text-sm text-gray-500">{aktif.length} nasabah aktif · Total tabungan {formatRupiah(totalTabungan)}</p>
        </div>
        <FormTambahNasabah />
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Terdaftar", value: nasabahList.length, icon: "👥" },
          { label: "Nasabah Aktif", value: aktif.length, icon: "✅" },
          { label: "Punya Tabungan", value: nasabahList.filter(n => (n.saldo_aktif ?? 0) > 0).length, icon: "🏦" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-center">
            <p className="text-2xl">{s.icon}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabel nasabah */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 px-5 py-4">
          <p className="text-sm font-semibold text-gray-800">Daftar Nasabah</p>
        </div>
        {nasabahList.length === 0 ? (
          <div className="flex flex-col items-center py-14">
            <span className="text-4xl">👥</span>
            <p className="mt-2 text-sm text-gray-400">Belum ada nasabah terdaftar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-50 text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-5 py-3 text-left">Kode</th>
                  <th className="px-5 py-3 text-left">Nama Lengkap</th>
                  <th className="px-5 py-3 text-left">No. WA</th>
                  <th className="px-5 py-3 text-left">RT/RW</th>
                  <th className="px-5 py-3 text-right">Total Setoran</th>
                  <th className="px-5 py-3 text-right">Saldo Aktif</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Terdaftar</th>
                </tr>
              </thead>
              <tbody>
                {nasabahList.map((n, i) => (
                  <tr key={n.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition ${i === nasabahList.length - 1 ? "border-0" : ""}`}>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-gray-400">{n.kode_nasabah}</span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">{n.nama_lengkap}</td>
                    <td className="px-5 py-3.5 text-gray-500">{n.no_wa ?? "—"}</td>
                    <td className="px-5 py-3.5 text-gray-500">{n.rt_rw ?? "—"}</td>
                    <td className="px-5 py-3.5 text-right text-gray-600">
                      {formatRupiah(n.total_setoran_bersih ?? 0)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-emerald-700">
                      {formatRupiah(n.saldo_aktif ?? 0)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        n.status === "aktif"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {n.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-gray-400">
                      {formatTanggal(n.tanggal_daftar)}
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
