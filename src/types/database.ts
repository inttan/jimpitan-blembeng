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
      setoran: {
        Row: {
          setoran_id: string; kode_setoran: string; nasabah_id: string;
          total_kotor: number; total_potongan_kas: number; total_nilai_bersih: number;
          catatan: string | null; status: "pending"|"terverifikasi"|"dibatalkan";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["setoran"]["Row"], "setoran_id"|"created_at">;
        Update: Partial<Database["public"]["Tables"]["setoran"]["Insert"]>;
      };
      setoran_detail: {
        Row: {
          detail_id: string; setoran_id: string; sampah_id: string;
          berat_kg: number; harga_satuan: number;
          nilai_kotor: number; potongan_kas: number; nilai_bersih: number;
        };
        Insert: Omit<Database["public"]["Tables"]["setoran_detail"]["Row"], "detail_id">;
        Update: never;
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
      notifikasi_log: {
        Row: {
          id: string; setoran_id: string;
          response_time_ms: number | null; latency_ms: number | null;
          status_pengiriman: "terkirim"|"gagal";
          skenario_beban: "ringan"|"sedang"|"berat";
          percobaan_ke: number; created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifikasi_log"]["Row"], "id"|"created_at"|"percobaan_ke"> & { percobaan_ke?: number };
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
          rt_rw: string | null;
          tanggal_daftar: string;
          status: "aktif" | "nonaktif";
          saldo_aktif: number;
          total_setoran: number;
          total_setoran_bersih: number;
          total_dicairkan: number;
          jumlah_transaksi: number;
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
      v_riwayat_setoran: {
        Row: {
          id: string;
          kode: string;
          nasabah_id: string;
          nama_lengkap: string;
          kode_nasabah: string;
          total_kotor: number;
          total_potongan_kas: number;
          total_nilai_bersih: number;
          catatan: string | null;
          status: string;
          created_at: string;
          jumlah_jenis: number;
          total_berat_kg: number;
          nama_sampah_list: string[];
        };
      };
    };
    Functions: {};
    Enums: {};
  };
};

export type Nasabah = Database["public"]["Tables"]["nasabah"]["Row"];
export type NasabahInsert = Database["public"]["Tables"]["nasabah"]["Insert"];
export type Setoran = Database["public"]["Tables"]["setoran"]["Row"];
export type SetoranInsert = Database["public"]["Tables"]["setoran"]["Insert"];
export type SetoranDetail = Database["public"]["Tables"]["setoran_detail"]["Row"];
export type SetoranDetailInsert = Database["public"]["Tables"]["setoran_detail"]["Insert"];
export type SampahInventory = Database["public"]["Tables"]["sampah_inventory"]["Row"];
export type HargaSampah = Database["public"]["Tables"]["harga_sampah"]["Row"];
export type TransaksiPenarikan = Database["public"]["Tables"]["transaksi_penarikan_tunai"]["Row"];
export type NotifikasiLog = Database["public"]["Tables"]["notifikasi_log"]["Row"];
export type NotifikasiLogInsert = Database["public"]["Tables"]["notifikasi_log"]["Insert"];
export type SaldoNasabah = Database["public"]["Views"]["v_saldo_nasabah"]["Row"];
export type HargaAktif = Database["public"]["Views"]["v_harga_aktif"]["Row"];
export type DashboardMetrics = Database["public"]["Views"]["v_dashboard_metrics"]["Row"];
export type RiwayatSetoran = Database["public"]["Views"]["v_riwayat_setoran"]["Row"];