"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  getAkhirMinggu,
  getMingguKe,
  hitungAlokasi,
  NOMINAL_STANDAR,
  type StatusJimpitan,
} from "@/lib/jimpitan";

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
 * - Kas masuk 95% di-handle trigger DB (trg_auto_kas_masuk) saat status=lunas
 * - Upah 5% di-akumulasi ke upah_penarik per penarik + minggu
 * - Audit trail di-handle trigger DB (trg_audit_jimpitan_transaksi)
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
        : NOMINAL_STANDAR;

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
    .select("id, jumlah_setor, status, potongan_kas, dana_kegiatan, minggu_ke, penarik_id")
    .single();

  if (errTx || !transaksi) {
    return { success: false, error: "Gagal menyimpan transaksi: " + (errTx?.message ?? "") };
  }

  // Akumulasi upah penarik (hanya status lunas + ada penarik)
  if (status === "lunas" && formData.penarik_id) {
    const potongan =
      transaksi.potongan_kas ?? hitungAlokasi(jumlah).potongan_kas;
    const periode_mulai = minggu_ke;
    const periode_selesai = getAkhirMinggu(minggu_ke);

    const { data: upahExisting } = await supabase
      .from("upah_penarik")
      .select("id, total_upah")
      .eq("penarik_id", formData.penarik_id)
      .eq("periode_mulai", periode_mulai)
      .eq("periode_selesai", periode_selesai)
      .eq("status", "belum_dibayar")
      .maybeSingle();

    if (upahExisting) {
      await supabase
        .from("upah_penarik")
        .update({ total_upah: Number(upahExisting.total_upah) + Number(potongan) })
        .eq("id", upahExisting.id);
    } else {
      await supabase.from("upah_penarik").insert({
        penarik_id: formData.penarik_id,
        periode_mulai,
        periode_selesai,
        total_upah: potongan,
        status: "belum_dibayar",
      });
    }
  }

  const { data: warga } = await supabase
    .from("warga")
    .select("id, nama, no_hp, no_rumah")
    .eq("id", formData.warga_id)
    .single();

  revalidatePath("/");
  revalidatePath("/transaksi");
  revalidatePath("/laporan");
  revalidatePath("/upah");
  revalidatePath("/kas");
  revalidatePath("/warga");

  return {
    success: true,
    data: {
      id: transaksi.id,
      jumlah_setor: Number(transaksi.jumlah_setor),
      status: transaksi.status as StatusJimpitan,
      potongan_kas: Number(transaksi.potongan_kas ?? hitungAlokasi(jumlah).potongan_kas),
      dana_kegiatan: Number(transaksi.dana_kegiatan ?? hitungAlokasi(jumlah).dana_kegiatan),
      minggu_ke: transaksi.minggu_ke,
      warga: {
        nama: warga?.nama ?? "—",
        no_hp: warga?.no_hp ?? null,
      },
    },
  };
}
