export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      nasabah: {
        Row: {
          id: string; kode_nasabah: string; nama_lengkap: string;
          nik: string | null; no_hp: string | null; no_wa: string | null;
          alamat: string | null; rt_rw: string | null;
          status: "aktif" | "nonaktif"; tanggal_daftar: string;
          created_at: string; updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["nasabah"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["nasabah"]["Insert"]>;
      };
      sampah_inventory: {
        Row: {
          id: string; kode_sampah: string; nama_sampah: string;
          kategori: "plastik"|"kertas"|"logam"|"kaca"|"organik"|"elektronik"|"lainnya";
          satuan: "kg"|"pcs"|"liter"; deskripsi: string | null;
          is_active: boolean; created_at: string; updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sampah_inventory"]["Row"], "id"|"created_at"|"updated_at">;
        Update: Partial<Database["public"]["Tables"]["sampah_inventory"]["Insert"]>;
      };
      transaksi_setoran: {
        Row: {
          id: string; kode_transaksi: string; nasabah_id: string; sampah_id: string;
          berat_kg: number; harga_satuan: number; potongan_kas: number;
          nilai_bersih: number; nilai_kotor: number;
          status: "pending"|"terverifikasi"|"dibatalkan";
          catatan: string | null; tanggal_setor: string;
          created_at: string; updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["transaksi_setoran"]["Row"], "id"|"potongan_kas"|"nilai_bersih"|"nilai_kotor"|"created_at"|"updated_at">;
        Update: Partial<Database["public"]["Tables"]["transaksi_setoran"]["Insert"]>;
      };
      harga_sampah: {
        Row: {
          id: string; sampah_id: string; harga_per_kg: number;
          berlaku_mulai: string; catatan: string | null;
          dibuat_oleh: string | null; created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["harga_sampah"]["Row"], "id"|"created_at">;
        Update: never;
      };
      kas_operasional: {
        Row: {
          id: string; transaksi_id: string; jumlah: number;
          keterangan: string; tanggal: string; created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["kas_operasional"]["Row"], "id"|"created_at">;
        Update: never;
      };
      transaksi_penarikan_tunai: {
        Row: {
          id: string; kode_penarikan: string; nasabah_id: string;
          jumlah_diterima: number; admin_saksi: string;
          periode_lebaran: string; catatan: string | null;
          tanggal_pencairan: string; created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["transaksi_penarikan_tunai"]["Row"], "id"|"created_at">;
        Update: never;
      };
    };
Views: {
  v_saldo_nasabah: {
    Row: {
      id: string;
      kode_nasabah: string;
      nama_lengkap: string;
      no_wa: string | null;
      no_hp: string | null;
      alamat: string | null;
      rt_rw: string | null;
      status: "aktif" | "nonaktif";
      tanggal_daftar: string;
      total_setoran_bersih: number;
      total_dicairkan: number;
      saldo_aktif: number;
      total_transaksi: number;
    };
  };
  v_harga_aktif: {
    Row: {
      sampah_id: string;
      kode_sampah: string;
      nama_sampah: string;
      kategori: string;
      satuan: string;
      is_active: boolean;
      harga_per_kg: number | null;
      berlaku_mulai: string | null;
      catatan_harga: string | null;
    };
  };
  v_dashboard_metrics: {
    Row: {
      total_liabilities: number;
      total_sampah_kg: number;
      total_kas_terkumpul: number;
      transaksi_hari_ini: number;
      rata_rata_setoran: number;
    };
  };
  v_nasabah_stats: {
    Row: {
      nasabah_aktif: number;
      total_nasabah: number;
    };
  };
};
    Functions: {};
    Enums: {};
  };
};

export type Nasabah = Database["public"]["Tables"]["nasabah"]["Row"];
export type NasabahInsert = Database["public"]["Tables"]["nasabah"]["Insert"];
export type TransaksiSetoran = Database["public"]["Tables"]["transaksi_setoran"]["Row"];
export type TransaksiSetoranInsert = Database["public"]["Tables"]["transaksi_setoran"]["Insert"];
export type SampahInventory = Database["public"]["Tables"]["sampah_inventory"]["Row"];
export type HargaSampah = Database["public"]["Tables"]["harga_sampah"]["Row"];
export type TransaksiPenarikan = Database["public"]["Tables"]["transaksi_penarikan_tunai"]["Row"];
export type SaldoNasabah = Database["public"]["Views"]["v_saldo_nasabah"]["Row"];
export type HargaAktif = Database["public"]["Views"]["v_harga_aktif"]["Row"];
export type DashboardMetrics = Database["public"]["Views"]["v_dashboard_metrics"]["Row"];