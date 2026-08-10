"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { catatRiwayat } from "@/lib/riwayat";

/** Tandai rekap upah penarik sebagai sudah dibayar */
export async function tandaiUpahDibayar(id: string, tanggal_dibayar?: string) {
  const supabase = await createClient();

  const { data: lama } = await supabase
    .from("upah_penarik")
    .select("*")
    .eq("id", id)
    .single();

  if (!lama) return { success: false, error: "Data upah tidak ditemukan." };
  if (lama.status === "sudah_dibayar") {
    return { success: false, error: "Upah ini sudah ditandai dibayar." };
  }

  // Tanggal hari ini (local)
  const today = new Date();
  const tgl = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const { data: baru, error } = await supabase
    .from("upah_penarik")
    .update({ status: "sudah_dibayar", tanggal_dibayar: tgl })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !baru) {
    return { success: false, error: "Gagal update: " + (error?.message ?? "") };
  }

  // Catat ke riwayat transparansi
  await catatRiwayat({
    tabel: "upah_penarik",
    record_id: id,
    aksi: "update",
    data_lama: { status: lama.status },
    data_baru: { status: "sudah_dibayar", tanggal_dibayar: tgl },
  });

  revalidatePath("/kas");
  revalidatePath("/");
  return { success: true };
}
