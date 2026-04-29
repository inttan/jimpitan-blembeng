"use server";
// src/app/actions/nasabah.ts

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function tambahNasabah(formData: FormData) {
  const supabase = await createClient();

  const nama = formData.get("nama_lengkap")?.toString().trim();
  if (!nama) return { success: false, error: "Nama lengkap wajib diisi." };

  // Generate kode nasabah otomatis
  const { count } = await supabase
    .from("nasabah").select("*", { count: "exact", head: true });
  const nomor = String((count ?? 0) + 1).padStart(3, "0");
  const tahun = new Date().getFullYear();
  const kode = `NSB-${tahun}-${nomor}`;

  const { error } = await supabase.from("nasabah").insert({
    kode_nasabah: kode,
    nama_lengkap: nama,
    nik: formData.get("nik")?.toString() || null,
    no_hp: formData.get("no_hp")?.toString() || null,
    no_wa: formData.get("no_wa")?.toString() || null,
    alamat: formData.get("alamat")?.toString() || null,
    rt_rw: formData.get("rt_rw")?.toString() || null,
    status: "aktif",
  });

  if (error) return { success: false, error: "Gagal menyimpan nasabah. " + error.message };

  revalidatePath("/dashboard/nasabah");
  revalidatePath("/dashboard");
  return { success: true };
}