import { createClient } from "@/lib/supabase/server";
import FormSetoran from "@/components/forms/FormSetoran";
import { Recycle } from "lucide-react";

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
    <div style={{ padding: "20px" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "12px",
            background: "var(--p5)", display: "flex",
            alignItems: "center", justifyContent: "center", color: "var(--p)",
          }}>
            <Recycle size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.4px" }}>
              Catat Setoran Sampah
            </h1>
            <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "3px" }}>
              Isi form di bawah lalu kirim notifikasi WhatsApp ke warga.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div style={{
          background: "var(--surf)", border: "1px solid var(--bdr)",
          borderRadius: "var(--r)", boxShadow: "var(--shd)", overflow: "hidden",
        }}>
          <FormSetoran nasabahList={nasabahList} sampahList={sampahList} />
        </div>
      </div>
    </div>
  );
}