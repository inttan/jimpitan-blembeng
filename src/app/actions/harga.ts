"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getHargaAktif() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_harga_aktif")
    .select("*")
    .order("nama_sampah");
  if (error) return [];
  return data ?? [];
}

export async function updateHargaSampah(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sesi login tidak valid. Silakan login ulang." };

  const sampah_id = formData.get("sampah_id")?.toString();
  const harga = parseFloat(formData.get("harga_per_kg")?.toString() ?? "0");
  const berlaku = formData.get("berlaku_mulai")?.toString();

  if (!sampah_id || !harga || !berlaku)
    return { success: false, error: "Semua field wajib diisi." };
  if (harga <= 0)
    return { success: false, error: "Harga harus lebih dari 0." };

  const { error } = await supabase.from("harga_sampah").insert({
    sampah_id,
    harga_per_kg: harga,
    berlaku_mulai: berlaku,
    catatan: formData.get("catatan")?.toString() || null,
    dibuat_oleh: user.id,
  });

  if (error) return { success: false, error: "Gagal: " + error.message };

  revalidatePath("/dashboard/harga");
  revalidatePath("/dashboard/transaksi");
  return { success: true };
}

export async function tambahSampahDenganHarga(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sesi login tidak valid. Silakan login ulang." };

  const nama = formData.get("nama_sampah")?.toString().trim();
  const kategori = formData.get("kategori")?.toString();
  const harga = Number(formData.get("harga_per_kg"));
  const satuan = formData.get("satuan")?.toString() || "kg";
  const catatan = formData.get("catatan")?.toString() || null;

  if (!nama) return { success: false, error: "Nama sampah wajib diisi." };
  if (!kategori) return { success: false, error: "Kategori wajib dipilih." };
  if (!harga || harga <= 0) return { success: false, error: "Harga harus lebih dari 0." };

  const kode_sampah = `SMP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;

  const { data: sampah, error: errSampah } = await supabase
    .from("sampah_inventory")
    .insert({ nama_sampah: nama, kategori, satuan, kode_sampah })
    .select("id")
    .single();

  if (errSampah) return { success: false, error: "Gagal menambah jenis sampah. " + errSampah.message };

  const { error: errHarga } = await supabase.from("harga_sampah").insert({
    sampah_id: sampah.id,
    harga_per_kg: harga,
    berlaku_mulai: new Date().toISOString().split("T")[0],
    catatan,
    dibuat_oleh: user.id,
  });

  if (errHarga) return { success: false, error: "Sampah tersimpan tapi harga gagal. " + errHarga.message };

  revalidatePath("/dashboard/harga");
  return { success: true };
}