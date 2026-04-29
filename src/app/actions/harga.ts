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
    dibuat_oleh: "Admin",
  });

  if (error) return { success: false, error: "Gagal: " + error.message };

  revalidatePath("/dashboard/harga");
  revalidatePath("/dashboard/transaksi");
  return { success: true };
}