"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function catatRiwayat(tabel: string, record_id: string, aksi: string, data_lama: any, data_baru: any) {
  const supabase = await createClient();
  await supabase.from("riwayat_perubahan").insert({
    tabel,
    record_id,
    aksi,
    data_lama,
    data_baru,
    diubah_oleh: "Admin",
  });
}

export async function tambahWarga(formData: FormData) {
  const supabase = await createClient();

  const nama = formData.get("nama")?.toString().trim();
  if (!nama) return { success: false, error: "Nama warga wajib diisi." };

  const payload = {
    nama,
    no_rumah: formData.get("no_rumah")?.toString().trim() || null,
    no_hp: formData.get("no_hp")?.toString().trim() || null,
    status_aktif: true,
  };

  const { data, error } = await supabase.from("warga").insert(payload).select().single();

  if (error) return { success: false, error: "Gagal menyimpan warga. " + error.message };

  await catatRiwayat("warga", data.id, "insert", null, data);

  revalidatePath("/warga");
  revalidatePath("/");
  return { success: true };
}

export async function updateWarga(
  id: string,
  payload: {
    nama: string;
    no_hp?: string;
    no_rumah?: string;
    status_aktif: boolean;
  }
) {
  const supabase = await createClient();

  const { data: lama } = await supabase.from("warga").select("*").eq("id", id).single();
  const { error } = await supabase.from("warga").update(payload).eq("id", id);
  const { data: baru } = await supabase.from("warga").select("*").eq("id", id).single();

  if (error) return { error: error.message };

  await catatRiwayat("warga", id, "update", lama, baru);

  revalidatePath("/warga");
  revalidatePath("/");
  return { success: true };
}

export async function deleteWarga(id: string) {
  const supabase = await createClient();

  const { data: lama } = await supabase.from("warga").select("*").eq("id", id).single();
  const { error } = await supabase.from("warga").update({ status_aktif: false }).eq("id", id);

  if (error) return { error: error.message };

  await catatRiwayat("warga", id, "update", lama, { ...lama, status_aktif: false });

  revalidatePath("/warga");
  revalidatePath("/");
  return { success: true };
}
