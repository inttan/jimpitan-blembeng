"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function tambahNasabah(formData: FormData) {
  const supabase = await createClient();

  const nama = formData.get("nama_lengkap")?.toString().trim();
  if (!nama) return { success: false, error: "Nama lengkap wajib diisi." };

  const tahun = new Date().getFullYear();

  // Ambil kode tertinggi tahun ini, bukan pakai count
  const { data: last } = await supabase
    .from("nasabah")
    .select("kode_nasabah")
    .like("kode_nasabah", `NSB-${tahun}-%`)
    .order("kode_nasabah", { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastNum = last?.kode_nasabah
    ? parseInt(last.kode_nasabah.split("-")[2] ?? "0", 10)
    : 0;
  const kode = `NSB-${tahun}-${String(lastNum + 1).padStart(3, "0")}`;

  const { error } = await supabase.from("nasabah").insert({
    kode_nasabah: kode,
    nama_lengkap: nama,
    nik:    formData.get("nik")?.toString() || null,
    no_wa:  formData.get("no_wa")?.toString() || null,
    alamat: formData.get("alamat")?.toString() || null,
    rt_rw:  formData.get("rt_rw")?.toString() || null,
    status: "aktif",
  });

  if (error) return { success: false, error: "Gagal menyimpan nasabah. " + error.message };

  revalidatePath("/dashboard/nasabah");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateNasabah(id: string, payload: {
  nama_lengkap: string;
  no_wa?: string;
  rt_rw?: string;
  status: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("nasabah")
    .update(payload)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/nasabah");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteNasabah(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("nasabah")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/nasabah");
  revalidatePath("/dashboard");
  return { success: true };
}