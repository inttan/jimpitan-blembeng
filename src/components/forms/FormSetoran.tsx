"use client";
import { useState, useTransition } from "react";
import { simpanSetoran } from "@/app/actions/transaksi";
import { generateWASetoranLink, kirimNotifWA } from "@/lib/whatsapp";
import { formatRupiah, formatTanggal } from "@/lib/utils";

export default function FormSetoran({ nasabahList, sampahList }: { nasabahList: any[]; sampahList: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any>(null);
  const [nasabahId, setNasabahId] = useState("");
  const [sampahId, setSampahId] = useState("");
  const [beratKg, setBeratKg] = useState("");
  const [catatan, setCatatan] = useState("");

  const sampahDipilih = sampahList.find((s) => s.sampah_id === sampahId);
  const hargaSatuan = sampahDipilih?.harga_per_kg ?? 0;
  const beratNum = parseFloat(beratKg) || 0;
  const nilaiKotor = beratNum * hargaSatuan;
  const nilaiBersih = nilaiKotor * 0.9;

  function handleSubmit() {
    setError(null);
    if (!nasabahId || !sampahId || !beratKg) { setError("Isi semua field yang wajib."); return; }
    startTransition(async () => {
      const result = await simpanSetoran({
        nasabah_id: nasabahId, sampah_id: sampahId,
        berat_kg: beratNum, harga_satuan: hargaSatuan, catatan: catatan || undefined,
      });
      if (!result.success) { setError(result.error ?? "Terjadi kesalahan."); return; }
      setSuccessResult(result.data ?? null);
      setNasabahId(""); setSampahId(""); setBeratKg(""); setCatatan("");
    });
  }

  function handleKirimWA() {
    if (!successResult?.nasabah?.no_wa) return;
    const url = generateWASetoranLink({
      namaНасabah: successResult.nasabah.nama_lengkap,
      namaСampah: successResult.nama_sampah,
      beratKg: successResult.berat_kg,
      nilaiKotor: successResult.nilai_kotor,
      potonganKas: successResult.potongan_kas,
      nilaiBersih: successResult.nilai_bersih,
      saldoAktif: successResult.nasabah.saldo_aktif,
      tanggal: formatTanggal(new Date()),
      noWa: successResult.nasabah.no_wa,
    });
    kirimNotifWA(url);
  }

  return (
    <div className="space-y-4">
      {successResult && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-semibold text-emerald-800">✅ Setoran berhasil dicatat!</p>
          <p className="text-sm text-emerald-600 mt-1">
            {successResult.nasabah.nama_lengkap} · {successResult.nama_sampah} · {successResult.berat_kg} kg
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl bg-white/70 p-3 text-xs">
            <div><p className="text-gray-400">Nilai Kotor</p><p className="font-semibold">{formatRupiah(successResult.nilai_kotor)}</p></div>
            <div><p className="text-gray-400">Potongan Kas</p><p className="font-semibold text-red-500">-{formatRupiah(successResult.potongan_kas)}</p></div>
            <div><p className="text-gray-400">Masuk Tabungan</p><p className="font-semibold text-emerald-700">{formatRupiah(successResult.nilai_bersih)}</p></div>
          </div>
          <p className="mt-2 text-sm font-medium text-emerald-800">
            Total Tabungan: <span className="font-bold">{formatRupiah(successResult.nasabah.saldo_aktif)}</span>
          </p>
          {successResult.nasabah.no_wa ? (
            <button onClick={handleKirimWA}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1ebe5d]">
              📱 Kirim Notifikasi WA ke {successResult.nasabah.nama_lengkap}
            </button>
          ) : (
            <p className="mt-2 text-xs text-amber-600">⚠️ Nomor WA nasabah belum terdaftar.</p>
          )}
          <button onClick={() => setSuccessResult(null)} className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600">Tutup</button>
        </div>
      )}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Input Setoran Sampah</h2>
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
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Jenis Sampah *</label>
          <select value={sampahId} onChange={(e) => setSampahId(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none">
            <option value="">-- Pilih Jenis Sampah --</option>
            {sampahList.filter((s) => s.is_active).map((s) => (
              <option key={s.sampah_id} value={s.sampah_id}>
                {s.nama_sampah} — {formatRupiah(s.harga_per_kg ?? 0)}/kg
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Berat (kg) *</label>
          <input type="number" min="0.1" step="0.1" value={beratKg}
            onChange={(e) => setBeratKg(e.target.value)} placeholder="Contoh: 2.5"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" />
        </div>
        {beratNum > 0 && hargaSatuan > 0 && (
          <div className="rounded-xl bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>Nilai Kotor</span><span>{formatRupiah(nilaiKotor)}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Potongan Kas 10%</span><span>-{formatRupiah(nilaiKotor * 0.1)}</span>
            </div>
            <div className="flex justify-between font-semibold text-emerald-700 border-t pt-1">
              <span>Masuk Tabungan</span><span>{formatRupiah(nilaiBersih)}</span>
            </div>
          </div>
        )}
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