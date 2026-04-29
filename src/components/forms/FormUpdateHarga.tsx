"use client";
import { useState, useTransition } from "react";
import { updateHargaSampah } from "@/app/actions/harga";

export default function FormUpdateHarga({ sampahList }: { sampahList: any[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await updateHargaSampah(fd);
      if (!result.success) { setError(result.error ?? "Gagal"); return; }
      setOpen(false);
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition">
        + Update Harga
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Update Harga Sampah</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Jenis Sampah *</label>
                <select name="sampah_id" required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400">
                  <option value="">-- Pilih Jenis Sampah --</option>
                  {sampahList.map((s) => (
                    <option key={s.sampah_id} value={s.sampah_id}>
                      {s.nama_sampah} (sekarang: Rp {s.harga_per_kg?.toLocaleString("id-ID") ?? "—"}/kg)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Harga Baru (Rp/kg) *</label>
                <input name="harga_per_kg" type="number" min="1" required placeholder="Contoh: 2500"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Berlaku Mulai *</label>
                <input name="berlaku_mulai" type="date" required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Catatan (alasan)</label>
                <input name="catatan" placeholder="Misal: naik karena permintaan pabrik"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600">Batal</button>
                <button type="submit" disabled={isPending}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                  {isPending ? "Menyimpan..." : "Simpan Harga"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}