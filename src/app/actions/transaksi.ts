"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SetoranFormData {
  nasabah_id: string; sampah_id: string;
  berat_kg: number; harga_satuan: number; catatan?: string;
}

export async function simpanSetoran(formData: SetoranFormData) {
  const supabase = await createClient();
  if (formData.berat_kg <= 0) return { success: false, error: "Berat harus lebih dari 0 kg." };

  const { data: hargaServer } = await supabase
    .from("v_harga_aktif").select("harga_per_kg, nama_sampah")
    .eq("sampah_id", formData.sampah_id).eq("is_active", true).single();

  if (!hargaServer) return { success: false, error: "Jenis sampah tidak ditemukan." };

  const hargaFinal = hargaServer.harga_per_kg ?? formData.harga_satuan;
  const kode = `TRX-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.floor(Math.random()*10000).toString().padStart(4,"0")}`;

  const { data: transaksi, error } = await supabase
    .from("transaksi_setoran").insert({
      kode_transaksi: kode,
      nasabah_id: formData.nasabah_id,
      sampah_id: formData.sampah_id,
      berat_kg: formData.berat_kg,
      harga_satuan: hargaFinal,
      status: "terverifikasi",
      catatan: formData.catatan ?? null,
    }).select("id, kode_transaksi, nilai_kotor, potongan_kas, nilai_bersih, berat_kg").single();

  if (error || !transaksi) return { success: false, error: "Gagal menyimpan: " + error?.message };

  const { data: saldo } = await supabase
    .from("v_saldo_nasabah").select("nama_lengkap, no_wa, saldo_aktif, kode_nasabah")
    .eq("id", formData.nasabah_id).single();

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transaksi");

  return {
    success: true,
    data: {
      transaksi_id: transaksi.id,
      kode_transaksi: transaksi.kode_transaksi,
      nilai_kotor: transaksi.nilai_kotor,
      potongan_kas: transaksi.potongan_kas,
      nilai_bersih: transaksi.nilai_bersih,
      berat_kg: transaksi.berat_kg,
      nama_sampah: hargaServer.nama_sampah,
      nasabah: saldo ?? { nama_lengkap: "—", no_wa: null, saldo_aktif: 0, kode_nasabah: "—" },
    },
  };
}

export async function cairkanTabungan(formData: {
  nasabah_id: string; jumlah_diterima: number;
  admin_saksi: string; periode_lebaran: string; catatan?: string;
}) {
  const supabase = await createClient();

  const { data: saldo } = await supabase
    .from("v_saldo_nasabah").select("saldo_aktif, nama_lengkap, no_wa")
    .eq("id", formData.nasabah_id).single();

  if (!saldo) return { success: false, error: "Nasabah tidak ditemukan." };
  if ((saldo.saldo_aktif ?? 0) < formData.jumlah_diterima)
    return { success: false, error: `Saldo tidak cukup. Saldo aktif: Rp ${saldo.saldo_aktif?.toLocaleString("id-ID")}` };

  const kode = `TRK-${formData.periode_lebaran.toUpperCase().replace(/\s+/g,"-").slice(0,15)}-${Math.floor(Math.random()*1000).toString().padStart(3,"0")}`;

  const { error } = await supabase.from("transaksi_penarikan_tunai").insert({
    kode_penarikan: kode,
    nasabah_id: formData.nasabah_id,
    jumlah_diterima: formData.jumlah_diterima,
    admin_saksi: formData.admin_saksi,
    periode_lebaran: formData.periode_lebaran,
    catatan: formData.catatan ?? null,
  });

  if (error) return { success: false, error: "Gagal mencatat: " + error.message };

  const { data: saldoBaru } = await supabase
    .from("v_saldo_nasabah").select("saldo_aktif, nama_lengkap, no_wa")
    .eq("id", formData.nasabah_id).single();

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/penarikan");

  return {
    success: true,
    data: {
      kode_penarikan: kode,
      jumlah_diterima: formData.jumlah_diterima,
      nasabah: saldoBaru ?? saldo,
    },
  };
}