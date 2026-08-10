import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { catatRiwayat } from "@/lib/riwayat";

export async function POST(req: NextRequest) {
  try {
    const { jumlah, keterangan } = await req.json();

    if (!jumlah || jumlah <= 0) {
      return NextResponse.json({ error: "Jumlah harus lebih dari 0" }, { status: 400 });
    }

    const supabase = await createClient();

    // Cek saldo kas
    const { data: saldoRow } = await supabase
      .from("v_saldo_kas")
      .select("saldo_kas_kegiatan")
      .single();

    const saldo = Number(saldoRow?.saldo_kas_kegiatan ?? 0);
    if (saldo < jumlah) {
      return NextResponse.json(
        { error: `Saldo tidak cukup. Saldo: Rp ${saldo.toLocaleString("id-ID")}` },
        { status: 400 }
      );
    }

    // Tanggal hari ini (local)
    const today = new Date();
    const tanggal = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    // Catat sebagai kas keluar
    const { data: row, error } = await supabase
      .from("kas_kegiatan")
      .insert({
        tanggal,
        jenis: "keluar",
        jumlah,
        keterangan: keterangan || "Penarikan upah penarik",
        disetujui_oleh: "Admin",
      })
      .select("id, jumlah, keterangan, disetujui_oleh, tanggal")
      .single();

    if (error || !row) {
      return NextResponse.json({ error: "Gagal mencatat: " + error.message }, { status: 500 });
    }

    // Catat ke riwayat transparansi
    await catatRiwayat({
      tabel: "kas_kegiatan",
      record_id: row.id,
      aksi: "insert",
      data_lama: null,
      data_baru: row,
    });

    revalidatePath("/kas");
    revalidatePath("/");
    revalidatePath("/laporan");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Terjadi kesalahan" }, { status: 500 });
  }
}
