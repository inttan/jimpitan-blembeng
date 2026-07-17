"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ItemSetoranInput {
  sampah_id: string;
  berat_kg: number;
  harga_satuan: number;
}

export interface SetoranFormData {
  nasabah_id: string;
  items: ItemSetoranInput[];
  catatan?: string;
}

function buatKode(prefix: string) {
  const tgl = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rnd = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${tgl}-${rnd}`;
}

export async function simpanSetoran(formData: SetoranFormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sesi login tidak valid. Silakan login ulang." };

  if (!formData.items?.length)
    return { success: false, error: "Tidak ada item sampah." };

  const sampahIds = formData.items.map((i) => i.sampah_id);
  const { data: hargaList, error: errHarga } = await supabase
    .from("v_harga_aktif")
    .select("sampah_id, harga_per_kg, nama_sampah")
    .in("sampah_id", sampahIds)
    .eq("is_active", true);

  if (errHarga || !hargaList?.length)
    return { success: false, error: "Gagal mengambil data harga sampah." };

  const hargaMap = Object.fromEntries(hargaList.map((h) => [h.sampah_id, h]));

  const itemsHitung = formData.items.map((item) => {
    const hargaData = hargaMap[item.sampah_id];
    if (!hargaData) throw new Error(`Sampah tidak ditemukan: ${item.sampah_id}`);
    if (item.berat_kg <= 0) throw new Error("Berat harus lebih dari 0 kg.");

    const harga = hargaData.harga_per_kg ?? item.harga_satuan;
    const nilaiKotor  = item.berat_kg * harga;
    const potonganKas = nilaiKotor * 0.1;
    const nilaiBersih = nilaiKotor * 0.9;

    return {
      sampah_id:   item.sampah_id,
      nama_sampah: hargaData.nama_sampah as string,
      berat_kg:    item.berat_kg,
      harga_satuan: harga,
      nilai_kotor:  nilaiKotor,
      potongan_kas: potonganKas,
      nilai_bersih: nilaiBersih,
    };
  });

  const totalKotor    = itemsHitung.reduce((s, i) => s + i.nilai_kotor, 0);
  const totalPotongan = itemsHitung.reduce((s, i) => s + i.potongan_kas, 0);
  const totalBersih   = itemsHitung.reduce((s, i) => s + i.nilai_bersih, 0);

  const { data: setoran, error: errSetoran } = await supabase
    .from("setoran")
    .insert({
      kode_setoran:       buatKode("SET"),
      nasabah_id:         formData.nasabah_id,
      dicatat_oleh:       user.id,
      total_kotor:        totalKotor,
      total_potongan_kas: totalPotongan,
      total_nilai_bersih: totalBersih,
      catatan:            formData.catatan ?? null,
      status:             "terverifikasi",
    })
    .select("setoran_id, kode_setoran")
    .single();

  if (errSetoran || !setoran)
    return { success: false, error: "Gagal menyimpan setoran: " + errSetoran?.message };

  const detailRows = itemsHitung.map((item) => ({
    setoran_id:   setoran.setoran_id,
    sampah_id:    item.sampah_id,
    berat_kg:     item.berat_kg,
    harga_satuan: item.harga_satuan,
    nilai_kotor:  item.nilai_kotor,
    potongan_kas: item.potongan_kas,
    nilai_bersih: item.nilai_bersih,
  }));

  const { error: errDetail } = await supabase
    .from("setoran_detail")
    .insert(detailRows);

  if (errDetail)
    return { success: false, error: "Gagal menyimpan detail: " + errDetail.message };

  const { data: saldo } = await supabase
    .from("v_saldo_nasabah")
    .select("nama_lengkap, no_wa, saldo_aktif, kode_nasabah")
    .eq("id", formData.nasabah_id)
    .single();

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transaksi");

  return {
    success: true,
    data: {
      kode_setoran:       setoran.kode_setoran,
      items:              itemsHitung.map(({ sampah_id: _, ...rest }) => rest),
      total_kotor:        totalKotor,
      total_potongan_kas: totalPotongan,
      total_nilai_bersih: totalBersih,
      saldo_sebelum:       saldo?.saldo_aktif ?? 0,
      saldo_sesudah:       (saldo?.saldo_aktif ?? 0) + totalBersih,
      nama_nasabah:        saldo?.nama_lengkap ?? "",
      no_wa_nasabah:       saldo?.no_wa ?? null,
      saldo_aktif:         (saldo?.saldo_aktif ?? 0) + totalBersih,
      kode_nasabah:        saldo?.kode_nasabah ?? "",
      catatan:             formData.catatan ?? null,
      tanggal_catat:        new Date().toISOString(),
      // Nested object untuk backward compat dengan FormSetoran
      nasabah: {
        nama_lengkap: saldo?.nama_lengkap ?? "—",
        no_wa:       saldo?.no_wa ?? null,
        saldo_aktif: (saldo?.saldo_aktif ?? 0) + totalBersih,
      },
    },
  };
}

export async function cairkanTabungan(formData: {
  nasabah_id: string;
  jumlah_diterima: number;
  admin_saksi: string;
  periode_lebaran: string;
  catatan?: string;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Sesi login tidak valid. Silakan login ulang." };

  const { data: saldo } = await supabase
    .from("v_saldo_nasabah").select("saldo_aktif, nama_lengkap, no_wa")
    .eq("id", formData.nasabah_id).single();

  if (!saldo) return { success: false, error: "Nasabah tidak ditemukan." };
  if ((saldo.saldo_aktif ?? 0) < formData.jumlah_diterima)
    return {
      success: false,
      error: `Saldo tidak cukup. Saldo aktif: Rp ${saldo.saldo_aktif?.toLocaleString("id-ID")}`,
    };

  const kode = `TRK-${formData.periode_lebaran.toUpperCase().replace(/\s+/g, "-").slice(0, 15)}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;

  const { error } = await supabase.from("transaksi_penarikan_tunai").insert({
    kode_penarikan:  kode,
    nasabah_id:      formData.nasabah_id,
    dicairkan_oleh:  user.id,
    jumlah_diterima: formData.jumlah_diterima,
    admin_saksi:     formData.admin_saksi,
    periode_lebaran: formData.periode_lebaran,
    catatan:         formData.catatan ?? null,
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
      kode_penarikan:  kode,
      jumlah_diterima: formData.jumlah_diterima,
      periode_lebaran: formData.periode_lebaran,
      admin_saksi:     formData.admin_saksi,
      saldo_sebelum:   saldo?.saldo_aktif ?? 0,
      saldo_sesudah:   saldoBaru?.saldo_aktif ?? 0,
      tanggal_catat:    new Date().toISOString(),
      catatan:         formData.catatan ?? null,
      nama_nasabah:    saldo?.nama_lengkap ?? "",
      no_wa_nasabah:   saldo?.no_wa ?? null,
      saldo_aktif:     saldoBaru?.saldo_aktif ?? 0,
      // Nested object untuk backward compat dengan FormPenarikan
      nasabah: {
        nama_lengkap: saldo?.nama_lengkap ?? "",
        no_wa:       saldo?.no_wa ?? null,
        saldo_aktif: saldoBaru?.saldo_aktif ?? 0,
      },
    },
  };
}
