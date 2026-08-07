"use server";

import { createClient } from "@/lib/supabase/server";
import type { AksiRiwayat, Json } from "@/types/database";

/**
 * Catat perubahan ke riwayat_perubahan (fallback app-level).
 * Prefer trigger DB; helper ini dipakai bila butuh diubah_oleh dari user login.
 */
export async function catatRiwayat(params: {
  tabel: string;
  record_id: string;
  aksi: AksiRiwayat;
  data_lama?: Json | null;
  data_baru?: Json | null;
  diubah_oleh?: string | null;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("riwayat_perubahan").insert({
      tabel: params.tabel,
      record_id: params.record_id,
      aksi: params.aksi,
      data_lama: params.data_lama ?? null,
      data_baru: params.data_baru ?? null,
      diubah_oleh: params.diubah_oleh ?? user?.email ?? user?.id ?? "admin",
    });
  } catch (e) {
    console.error("Gagal catat riwayat:", e);
  }
}
