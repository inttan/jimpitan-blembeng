"use client";
import { useState, useTransition } from "react";
import { simpanSetoran } from "@/app/actions/transaksi";
import { generateWASetoranLink, kirimNotifWA } from "@/lib/whatsapp";
import { formatRupiah, formatTanggal } from "@/lib/utils";

// ── Tipe ──────────────────────────────────────────────────────────────
type ItemSampah = {
  id: string;
  sampahId: string;
  beratKg: string;
};

type FormSetoranProps = {
  nasabahList: any[];
  sampahList: any[];
};

let nextId = 1;
const buatItem = (): ItemSampah => ({
  id: String(nextId++),
  sampahId: "",
  beratKg: "",
});

// ── Komponen ──────────────────────────────────────────────────────────
export default function FormSetoran({ nasabahList, sampahList }: FormSetoranProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [nasabahId, setNasabahId] = useState("");
  const [catatan, setCatatan] = useState("");
  const [items, setItems] = useState<ItemSampah[]>([buatItem()]);

  // ── Helper kalkulasi per item ──
  function hitungItem(item: ItemSampah) {
    const sampah = sampahList.find((s) => s.sampah_id === item.sampahId);
    const harga = sampah?.harga_per_kg ?? 0;
    const berat = parseFloat(item.beratKg) || 0;
    const kotor = berat * harga;
    const kas = kotor * 0.1;
    const bersih = kotor * 0.9;
    return { harga, berat, kotor, kas, bersih };
  }

  const totalKotor = items.reduce((sum, item) => sum + hitungItem(item).kotor, 0);
  const totalKas   = totalKotor * 0.1;
  const totalBersih = totalKotor * 0.9;
  const adaPreview = items.some((item) => hitungItem(item).kotor > 0);

  // ── Manipulasi items ──
  function updateItem(id: string, field: keyof Omit<ItemSampah, "id">, val: string) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: val } : it)));
  }
  function tambahItem() {
    setItems((prev) => [...prev, buatItem()]);
  }
  function hapusItem(id: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));
  }

  // ── Submit ──
  function handleSubmit() {
    setError(null);
    if (!nasabahId) { setError("Pilih nama warga terlebih dahulu."); return; }
    const validItems = items.filter((it) => it.sampahId && parseFloat(it.beratKg) > 0);
    if (validItems.length === 0) { setError("Isi minimal satu jenis sampah dengan berat yang valid."); return; }

    startTransition(async () => {
      // Kirim array items ke server action
      const result = await simpanSetoran({
        nasabah_id: nasabahId,
        catatan: catatan || undefined,
        items: validItems.map((it) => {
          const { harga, berat, kotor, kas, bersih } = hitungItem(it);
          return {
            sampah_id: it.sampahId,
            berat_kg: berat,
            harga_satuan: harga,
            nilai_kotor: kotor,
            potongan_kas: kas,
            nilai_bersih: bersih,
          };
        }),
      });

      if (!result.success) { setError(result.error ?? "Terjadi kesalahan."); return; }
      setSuccessResult(result.data ?? null);
      setNasabahId("");
      setCatatan("");
      setItems([buatItem()]);
    });
  }

function handleKirimWA() {
  if (!successResult?.nasabah?.no_wa) return;
  const url = generateWASetoranLink({
    namaNasabah:  successResult.nasabah.nama_lengkap,
    items:        successResult.items,        // array langsung dari server action
    totalKotor:   successResult.total_kotor,
    totalPotongan: successResult.total_potongan_kas,
    totalBersih:  successResult.total_nilai_bersih,
    saldoAktif:   successResult.nasabah.saldo_aktif,
    tanggal:      formatTanggal(new Date()),
    noWa:         successResult.nasabah.no_wa,
  });
  kirimNotifWA(url);
}

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── Sukses ── */}
      {successResult && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-2">
          <p className="font-semibold text-emerald-800">✅ Setoran berhasil dicatat!</p>
          <p className="text-sm text-emerald-600">{successResult.nasabah.nama_lengkap}</p>

          {/* Rincian per jenis */}
          <div className="rounded-xl bg-white/70 p-3 text-xs space-y-1">
            {successResult.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-gray-700">
                <span>{item.nama_sampah} · {item.berat_kg} kg</span>
                <span>{formatRupiah(item.nilai_bersih)}</span>
              </div>
            ))}
            <div className="border-t pt-1 mt-1 grid grid-cols-3 gap-2">
              <div><p className="text-gray-400">Kotor</p><p className="font-semibold">{formatRupiah(successResult.total_kotor)}</p></div>
              <div><p className="text-gray-400">Kas 10%</p><p className="font-semibold text-red-500">-{formatRupiah(successResult.total_potongan_kas)}</p></div>
              <div><p className="text-gray-400">Tabungan</p><p className="font-semibold text-emerald-700">{formatRupiah(successResult.total_nilai_bersih)}</p></div>
            </div>
          </div>

          <p className="text-sm font-medium text-emerald-800">
            Total Tabungan: <span className="font-bold">{formatRupiah(successResult.nasabah.saldo_aktif)}</span>
          </p>

          {successResult.nasabah.no_wa ? (
            <button onClick={handleKirimWA}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1ebe5d]">
              📱 Kirim Notifikasi WA ke {successResult.nasabah.nama_lengkap}
            </button>
          ) : (
            <p className="text-xs text-amber-600">⚠️ Nomor WA nasabah belum terdaftar.</p>
          )}
          <button onClick={() => setSuccessResult(null)} className="w-full text-xs text-gray-400 hover:text-gray-600">Tutup</button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* ── Form ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Input Setoran Sampah</h2>

        {/* Pilih warga */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Warga *</label>
          <select value={nasabahId} onChange={(e) => setNasabahId(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none">
            <option value="">-- Pilih Warga --</option>
            {nasabahList.map((n) => (
              <option key={n.id} value={n.id}>{n.nama_lengkap} ({n.kode_nasabah})</option>
            ))}
          </select>
        </div>

        {/* ── Daftar item sampah ── */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Jenis & Berat Sampah *</label>

          {items.map((item, idx) => {
            const { harga, berat, kotor } = hitungItem(item);
            return (
              <div key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Item {idx + 1}</span>
                  {items.length > 1 && (
                    <button onClick={() => hapusItem(item.id)}
                      className="text-xs text-red-400 hover:text-red-600">✕ Hapus</button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Pilih jenis sampah */}
                  <select value={item.sampahId} onChange={(e) => updateItem(item.id, "sampahId", e.target.value)}
                    className="col-span-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none">
                    <option value="">-- Pilih Jenis --</option>
                    {sampahList.filter((s) => s.is_active).map((s) => (
                      <option key={s.sampah_id} value={s.sampah_id}>
                        {s.nama_sampah} — {formatRupiah(s.harga_per_kg ?? 0)}/kg
                      </option>
                    ))}
                  </select>

                  {/* Berat */}
                  <input type="number" min="0.1" step="0.1" placeholder="Berat (kg)"
                    value={item.beratKg} onChange={(e) => updateItem(item.id, "beratKg", e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none" />

                  {/* Nilai kotor real-time */}
                  <div className="flex items-center rounded-lg bg-white border border-gray-100 px-3 py-2 text-sm text-gray-500">
                    {kotor > 0 ? (
                      <span className="text-emerald-600 font-medium">{formatRupiah(kotor)}</span>
                    ) : (
                      <span className="text-gray-300">Rp 0</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <button onClick={tambahItem} type="button"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-emerald-300 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50">
            + Tambah Jenis Sampah
          </button>
        </div>

        {/* Preview total */}
        {adaPreview && (
          <div className="rounded-xl bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>Total Kotor</span><span>{formatRupiah(totalKotor)}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Potongan Kas 10%</span><span>-{formatRupiah(totalKas)}</span>
            </div>
            <div className="flex justify-between font-semibold text-emerald-700 border-t pt-1">
              <span>Total Masuk Tabungan</span><span>{formatRupiah(totalBersih)}</span>
            </div>
          </div>
        )}

        {/* Catatan */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Catatan (opsional)</label>
          <input type="text" value={catatan} onChange={(e) => setCatatan(e.target.value)}
            placeholder="Misal: sampah basah, dsb."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" />
        </div>

        <button onClick={handleSubmit} disabled={isPending}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
          {isPending ? "Menyimpan..." : "✅ Simpan Setoran"}
        </button>
      </div>
    </div>
  );
}