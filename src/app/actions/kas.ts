"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface TarikKasFormData {
  jumlah: number;
  keterangan: string;
  disetujui_oleh: string;
  tanggal?: string;
}

/**
 * Catat pengeluaran kas kegiatan desa.
 * Keterangan WAJIB. Audit di-handle trigger DB.
 */
export async function tarikKasKegiatan(formData: TarikKasFormData) {
  const supabase = await createClient();

  const keterangan = formData.keterangan?.trim();
  if (!keterangan) {
    return { success: false, error: "Keterangan wajib diisi." };
  }
  if (!formData.jumlah || formData.jumlah <= 0) {
    return { success: false, error: "Jumlah pengeluaran harus lebih dari 0." };
  }
  if (!formData.disetujui_oleh?.trim()) {
    return { success: false, error: "Nama yang menyetujui wajib diisi." };
  }

  // Cek saldo
  const { data: saldoRow } = await supabase
    .from("v_saldo_kas")
    .select("saldo_kas_kegiatan")
    .single();

  const saldo = Number(saldoRow?.saldo_kas_kegiatan ?? 0);
  if (saldo < formData.jumlah) {
    return {
      success: false,
      error: `Saldo tidak cukup. Saldo: Rp ${saldo.toLocaleString("id-ID")}`,
    };
  }

  // Tanggal hari ini (local)
  const today = new Date();
  const tanggal = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const { data: row, error } = await supabase
    .from("kas_kegiatan")
    .insert({
      tanggal,
      jenis: "keluar",
      jumlah: formData.jumlah,
      keterangan,
      disetujui_oleh: formData.disetujui_oleh.trim(),
      transaksi_ref: null,
    })
    .select("id, jumlah, keterangan, disetujui_oleh, tanggal")
    .single();

  if (error || !row) {
    return { success: false, error: "Gagal mencatat: " + (error?.message ?? "") };
  }

  const { data: saldoBaru } = await supabase
    .from("v_saldo_kas")
    .select("saldo_kas_kegiatan")
    .single();

  revalidatePath("/");
  revalidatePath("/kas");
  revalidatePath("/laporan");

  return {
    success: true,
    data: {
      ...row,
      saldo_akhir: Number(saldoBaru?.saldo_kas_kegiatan ?? 0),
    },
  };
}
