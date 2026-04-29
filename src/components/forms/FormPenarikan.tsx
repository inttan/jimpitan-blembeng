"use client";
import { useState, useTransition } from "react";
import { cairkanTabungan } from "@/app/actions/transaksi";
import { generateWAPenarikanLink, kirimNotifWA } from "@/lib/whatsapp";
import { formatRupiah } from "@/lib/utils";
import type { SaldoNasabah } from "@/types/database";

type NasabahItem = Pick<SaldoNasabah, "id" | "kode_nasabah" | "nama_lengkap" | "no_wa" | "saldo_aktif">;

export default function FormPenarikan({ nasabahList }: { nasabahList: NasabahItem[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);
  const [nasabahId, setNasabahId] = useState("");

  const nasabahDipilih = nasabahList.find(n => n.id === nasabahId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await cairkanTabungan({
        nasabah_id: nasabahId,
        jumlah_diterima: parseFloat(fd.get("jumlah")?.toString() ?? "0"),
        admin_saksi: fd.get("admin_saksi")?.toString() ?? "Admin",
        periode_lebaran: fd.get("periode")?.toString() ?? "",
        catatan: fd.get("catatan")?.toString() || undefined,
      });
      if (!result.success) { setError(result.error ?? "Gagal"); return; }
      setSuccessData(result.data);
    });
  }

  function handleKirimWA() {
    if (!successData?.nasabah?.no_wa) return;
    const url = generateWAPenarikanLink({
      namaNasabah: successData.nasabah.nama_lengkap,
      jumlahDiterima: successData.jumlah_diterima,
      periodeLebaran: successData.periode_lebaran ?? "",
      adminSaksi: "Admin Bank Sampah",
      noWa: successData.nasabah.no_wa,
      sisaSaldo: successData.nasabah.saldo_aktif ?? 0,
    });
    kirimNotifWA(url);
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition">
        💵 Cairkan Tabungan
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Cairkan Tabungan Lebaran</h2>
              <button onClick={() => { setOpen(false); setSuccessData(null); setError(null); }}
                className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* Success state */}
            {successData && (
              <div className="space-y-3">
                <div className="rounded-xl bg-emerald-50 p-4 text-center">
                  <p className="text-2xl">✅</p>
                  <p className="mt-1 font-semibold text-emerald-800">Pencairan Berhasil Dicatat!</p>
                  <p className="text-sm text-emerald-600 mt-1">
                    {successData.nasabah.nama_lengkap} · {formatRupiah(successData.jumlah_diterima)}
                  </p>
                </div>
                {successData.nasabah.no_wa ? (
                  <button onClick={handleKirimWA}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white hover:bg-[#1ebe5d]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    Kirim Notifikasi WA ke {successData.nasabah.nama_lengkap}
                  </button>
                ) : (
                  <p className="text-center text-xs text-amber-600">⚠️ Nomor WA nasabah belum terdaftar.</p>
                )}
                <button onClick={() => { setOpen(false); setSuccessData(null); }}
                  className="w-full rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                  Tutup
                </button>
              </div>
            )}

            {/* Form state */}
            {!successData && (
              <>
                {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Nasabah <span className="text-red-500">*</span></label>
                    <select value={nasabahId} onChange={e => setNasabahId(e.target.value)} required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none">
                      <option value="">-- Pilih Nasabah --</option>
                      {nasabahList.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.nama_lengkap} · Saldo: {formatRupiah(n.saldo_aktif ?? 0)}
                        </option>
                      ))}
                    </select>
                    {nasabahDipilih && (
                      <p className="mt-1 text-xs text-emerald-600 font-medium">
                        Saldo aktif: {formatRupiah(nasabahDipilih.saldo_aktif ?? 0)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Jumlah Dicairkan (Rp) <span className="text-red-500">*</span></label>
                    <input name="jumlah" type="number" min="1" required
                      max={nasabahDipilih?.saldo_aktif ?? undefined}
                      placeholder={nasabahDipilih ? `Maks. ${formatRupiah(nasabahDipilih.saldo_aktif ?? 0)}` : "Pilih nasabah dulu"}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Periode Lebaran <span className="text-red-500">*</span></label>
                    <input name="periode" required placeholder="Ramadan 1446H / 2025"
                      defaultValue={`Ramadan ${new Date().getFullYear()}H / ${new Date().getFullYear()}`}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Nama Admin Saksi <span className="text-red-500">*</span></label>
                    <input name="admin_saksi" required placeholder="Nama pengurus yang mencairkan"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Catatan</label>
                    <input name="catatan" placeholder="Opsional"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setOpen(false)}
                      className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Batal</button>
                    <button type="submit" disabled={isPending || !nasabahId}
                      className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60">
                      {isPending ? "Memproses..." : "💵 Cairkan"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
