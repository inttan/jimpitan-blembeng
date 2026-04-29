import { createClient } from "@/lib/supabase/server";
import FormSetoran from "@/components/forms/FormSetoran";

async function getFormData() {
  const supabase = await createClient();
  const [nasabahRes, sampahRes] = await Promise.all([
    supabase.from("v_saldo_nasabah")
      .select("id, nama_lengkap, kode_nasabah, no_wa, saldo_aktif")
      .eq("status", "aktif").order("nama_lengkap"),
    supabase.from("v_harga_aktif")
      .select("*").eq("is_active", true).order("nama_sampah"),
  ]);
  return {
    nasabahList: (nasabahRes.data ?? []) as any[],
    sampahList: (sampahRes.data ?? []) as any[],
  };
}

export default async function TransaksiPage() {
  const { nasabahList, sampahList } = await getFormData();
  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Catat Setoran Sampah</h1>
        <p className="mt-1 text-sm text-gray-500">
          Isi form di bawah lalu kirim notifikasi WhatsApp ke warga.
        </p>
      </div>
      <FormSetoran nasabahList={nasabahList} sampahList={sampahList} />
    </div>
  );
}