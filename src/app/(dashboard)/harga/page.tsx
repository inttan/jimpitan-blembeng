// src/app/(dashboard)/harga/page.tsx
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import FormUpdateHarga from "@/components/forms/FormUpdateHarga";

async function getHargaData() {
  const supabase = await createClient();
  const [hargaAktif, riwayat] = await Promise.all([
    supabase.from("v_harga_aktif").select("*").order("nama_sampah"),
    supabase.from("harga_sampah")
      .select(`harga_per_kg, berlaku_mulai, catatan, dibuat_oleh, created_at,
        sampah:sampah_id (nama_sampah, kategori)`)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  return { hargaAktif: hargaAktif.data ?? [], riwayat: riwayat.data ?? [] };
}

const KATEGORI_COLOR: Record<string, string> = {
  plastik: "bg-blue-50 text-blue-700",
  kertas: "bg-yellow-50 text-yellow-700",
  logam: "bg-gray-100 text-gray-700",
  kaca: "bg-cyan-50 text-cyan-700",
  organik: "bg-green-50 text-green-700",
  elektronik: "bg-purple-50 text-purple-700",
  lainnya: "bg-orange-50 text-orange-700",
};

export default async function HargaPage() {
  const { hargaAktif, riwayat } = await getHargaData();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Harga Sampah</h1>
          <p className="text-sm text-gray-500">
            Kelola harga per kg setiap jenis sampah · Harga lama tetap tersimpan untuk audit
          </p>
        </div>
        <FormUpdateHarga sampahList={hargaAktif} />
      </div>

      {/* Harga Aktif */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 px-5 py-4">
          <p className="text-sm font-semibold text-gray-800">Harga Berlaku Sekarang</p>
          <p className="text-xs text-gray-400">Digunakan otomatis saat input transaksi setoran</p>
        </div>
        <div className="grid gap-0 divide-y divide-gray-50">
          {hargaAktif.map((h) => (
            <div key={h.sampah_id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${KATEGORI_COLOR[h.kategori] ?? "bg-gray-100 text-gray-600"}`}>
                  {h.kategori}
                </span>
                <div>
                  <p className="font-medium text-gray-800">{h.nama_sampah}</p>
                  {h.catatan_harga && (
                    <p className="text-xs text-gray-400">{h.catatan_harga}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-700">
                  {h.harga_per_kg ? formatRupiah(h.harga_per_kg) : "Belum ada harga"}
                </p>
                <p className="text-xs text-gray-400">
                  {h.berlaku_mulai ? `per ${h.satuan} · berlaku ${formatTanggal(h.berlaku_mulai)}` : "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info potongan kas */}
      <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <span className="text-xl">ℹ️</span>
        <div>
          <p className="text-sm font-semibold text-blue-800">Potongan Kas Otomatis 10%</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Setiap transaksi otomatis dipotong 10% untuk kas operasional. Nilai yang masuk tabungan warga adalah 90% dari harga × berat.
            Contoh: 5 kg kardus × Rp 2.000 = Rp 10.000 kotor → Rp 9.000 masuk tabungan, Rp 1.000 ke kas.
          </p>
        </div>
      </div>

      {/* Riwayat perubahan harga */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 px-5 py-4">
          <p className="text-sm font-semibold text-gray-800">Riwayat Perubahan Harga</p>
          <p className="text-xs text-gray-400">20 perubahan terbaru · Data ini dipakai untuk audit trail</p>
        </div>
        {riwayat.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">Belum ada riwayat.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-50 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-5 py-3 text-left">Jenis Sampah</th>
                <th className="px-5 py-3 text-right">Harga/kg</th>
                <th className="px-5 py-3 text-left">Berlaku Mulai</th>
                <th className="px-5 py-3 text-left">Catatan</th>
                <th className="px-5 py-3 text-left">Diinput Oleh</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.map((r: any, i: number) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{r.sampah?.nama_sampah ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-semibold text-emerald-700">{formatRupiah(r.harga_per_kg)}</td>
                  <td className="px-5 py-3 text-gray-600">{formatTanggal(r.berlaku_mulai)}</td>
                  <td className="px-5 py-3 text-xs text-gray-400">{r.catatan ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-500">{r.dibuat_oleh ?? "Admin"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
