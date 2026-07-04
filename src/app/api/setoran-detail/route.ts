import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Parameter id wajib diisi" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("setoran_detail")
    .select(`
      berat_kg, harga_satuan, nilai_kotor, potongan_kas, nilai_bersih,
      sampah:sampah_id (nama_sampah)
    `)
    .eq("setoran_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data ?? []).map((d: any) => ({
    nama_sampah: d.sampah?.nama_sampah ?? "-",
    berat_kg: d.berat_kg,
    harga_satuan: d.harga_satuan,
    nilai_kotor: d.nilai_kotor,
    potongan_kas: d.potongan_kas,
    nilai_bersih: d.nilai_bersih,
  }));

  return NextResponse.json({ items });
}