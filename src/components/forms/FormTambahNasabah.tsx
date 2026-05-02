"use client";
// src/components/forms/FormTambahNasabah.tsx

import { useState, useTransition } from "react";
import { tambahNasabah } from "@/app/actions/nasabah";

export default function FormTambahNasabah() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await tambahNasabah(fd);
      if (!result.success) { setError(result.error ?? "Gagal"); return; }
      setOpen(false);
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition">
        + Tambah Nasabah
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Tambah Nasabah Baru</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { name: "nama_lengkap", label: "Nama Lengkap", placeholder: "Siti Rahayu", required: true },
                { name: "nik", label: "NIK", placeholder: "3308010101800001", required: false },
                { name: "no_wa", label: "No. WhatsApp", placeholder: "6281234567890 (pakai 62...)", required: false },
                { name: "alamat", label: "Alamat", placeholder: "Desa Kebonagung RT 01", required: false },
                { name: "rt_rw", label: "RT/RW", placeholder: "001/001", required: false },
              ].map((f) => (
                <div key={f.name}>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <input name={f.name} placeholder={f.placeholder} required={f.required}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                  {isPending ? "Menyimpan..." : "Simpan Nasabah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}