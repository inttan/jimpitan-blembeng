"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  getAkhirMinggu,
  getMingguKe,
  type StatusJimpitan,
} from "@/lib/jimpitan";
import { catatRiwayat } from "@/lib/riwayat";

export interface JimpitanFormData {
  warga_id: string;
  penarik_id?: string | null;
  minggu_ke?: string;
  jumlah_setor?: number;
  status: StatusJimpitan;
  dicatat_oleh?: string;
}

/**
 * Simpan transaksi jimpitan mingguan.
 * - SEMUA setoran lunas masuk kas 100% (handle trigger DB trg_auto_kas_masuk)
 * - Upah penarik diambil bebas dari kas oleh pengurus (bukan di-potongan otomatis)
 * - Audit trail ke riwayat_perubahan via app-level logging + DB trigger
 */
export async function simpanJimpitan(formData: JimpitanFormData) {
  const supabase = await createClient();

  if (!formData.warga_id) return { success: false, error: "Pilih warga terlebih dahulu." };

  const status = formData.status ?? "lunas";
  const jumlah =
    status === "nihil"
      ? 0
      : formData.jumlah_setor != null && formData.jumlah_setor >= 0
        ? formData.jumlah_setor
        : 5000;

  if (status === "lunas" && jumlah <= 0) {
    return { success: false, error: "Jumlah setor harus lebih dari 0 untuk status lunas." };
  }

  const minggu_ke = formData.minggu_ke || getMingguKe();

  // Cegah double input lunas di minggu yang sama
  if (status === "lunas") {
    const { data: existing } = await supabase
      .from("jimpitan_transaksi")
      .select("id")
      .eq("warga_id", formData.warga_id)
      .eq("minggu_ke", minggu_ke)
      .eq("status", "lunas")
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: "Warga ini sudah tercatat lunas untuk minggu tersebut.",
      };
    }
  }

  const { data: transaksi, error: errTx } = await supabase
    .from("jimpitan_transaksi")
    .insert({
      warga_id: formData.warga_id,
      penarik_id: formData.penarik_id || null,
      minggu_ke,
      jumlah_setor: jumlah,
      status,
      dicatat_oleh: formData.dicatat_oleh || "Admin",
    })
    .select("id, jumlah_setor, status, minggu_ke, penarik_id")
    .single();

  if (errTx || !transaksi) {
    return { success: false, error: "Gagal menyimpan transaksi: " + (errTx?.message ?? "") };
  }

  // Ambil nama warga untuk logging
  const { data: warga } = await supabase
    .from("warga")
    .select("id, nama, no_hp, no_rumah")
    .eq("id", formData.warga_id)
    .single();

  // Catat setoran ke riwayat transparansi (kas masuk 100% via trigger DB)
  await catatRiwayat({
    tabel: "jimpitan_transaksi",
    record_id: transaksi.id,
    aksi: "insert",
    data_lama: null,
    data_baru: {
      warga_id: formData.warga_id,
      warga_nama: warga?.nama ?? "—",
      minggu_ke,
      jumlah_setor: jumlah,
      status,
      dicatat_oleh: formData.dicatat_oleh || "Admin",
    },
  });

  revalidatePath("/");
  revalidatePath("/transaksi");
  revalidatePath("/laporan");
  revalidatePath("/kas");
  revalidatePath("/warga");

  return {
    success: true,
    data: {
      id: transaksi.id,
      jumlah_setor: Number(transaksi.jumlah_setor),
      status: transaksi.status as StatusJimpitan,
      minggu_ke: transaksi.minggu_ke,
      warga: {
        nama: warga?.nama ?? "—",
        no_hp: warga?.no_hp ?? null,
      },
    },
  };
}
