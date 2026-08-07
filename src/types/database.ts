export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type StatusJimpitan = "lunas" | "belum" | "nihil";
export type JenisKas = "masuk" | "keluar";
export type StatusUpah = "belum_dibayar" | "sudah_dibayar";
export type AksiRiwayat = "insert" | "update" | "delete";

export type Database = {
  public: {
    Tables: {
      warga: {
        Row: {
          id: string;
          nama: string;
          no_rumah: string | null;
          no_hp: string | null;
          status_aktif: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          no_rumah?: string | null;
          no_hp?: string | null;
          status_aktif?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["warga"]["Insert"]>;
      };
      penarik: {
        Row: {
          id: string;
          nama: string;
          no_hp: string | null;
          status_aktif: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          no_hp?: string | null;
          status_aktif?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["penarik"]["Insert"]>;
      };
      jimpitan_transaksi: {
        Row: {
          id: string;
          warga_id: string;
          penarik_id: string | null;
          minggu_ke: string;
          jumlah_setor: number;
          status: StatusJimpitan;
          potongan_kas: number;
          dana_kegiatan: number;
          dicatat_oleh: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          warga_id: string;
          penarik_id?: string | null;
          minggu_ke: string;
          jumlah_setor?: number;
          status?: StatusJimpitan;
          dicatat_oleh?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["jimpitan_transaksi"]["Insert"]>;
      };
      kas_kegiatan: {
        Row: {
          id: string;
          tanggal: string;
          jenis: JenisKas;
          jumlah: number;
          keterangan: string;
          disetujui_oleh: string | null;
          transaksi_ref: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tanggal?: string;
          jenis: JenisKas;
          jumlah: number;
          keterangan: string;
          disetujui_oleh?: string | null;
          transaksi_ref?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["kas_kegiatan"]["Insert"]>;
      };
      upah_penarik: {
        Row: {
          id: string;
          penarik_id: string;
          periode_mulai: string;
          periode_selesai: string;
          total_upah: number;
          status: StatusUpah;
          tanggal_dibayar: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          penarik_id: string;
          periode_mulai: string;
          periode_selesai: string;
          total_upah: number;
          status?: StatusUpah;
          tanggal_dibayar?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["upah_penarik"]["Insert"]>;
      };
      riwayat_perubahan: {
        Row: {
          id: string;
          tabel: string;
          record_id: string;
          aksi: AksiRiwayat;
          data_lama: Json | null;
          data_baru: Json | null;
          diubah_oleh: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tabel: string;
          record_id: string;
          aksi: AksiRiwayat;
          data_lama?: Json | null;
          data_baru?: Json | null;
          diubah_oleh?: string | null;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: {
      v_saldo_kas: {
        Row: {
          saldo_kas_kegiatan: number;
        };
      };
      v_belum_setor_minggu_ini: {
        Row: {
          id: string;
          nama: string;
          no_hp: string | null;
          no_rumah: string | null;
        };
      };
      v_upah_belum_dibayar: {
        Row: {
          penarik_id: string;
          total_belum_dibayar: number;
        };
      };
    };
    Functions: {};
    Enums: {};
  };
};

export type Warga = Database["public"]["Tables"]["warga"]["Row"];
export type WargaInsert = Database["public"]["Tables"]["warga"]["Insert"];
export type Penarik = Database["public"]["Tables"]["penarik"]["Row"];
export type JimpitanTransaksi = Database["public"]["Tables"]["jimpitan_transaksi"]["Row"];
export type JimpitanTransaksiInsert = Database["public"]["Tables"]["jimpitan_transaksi"]["Insert"];
export type KasKegiatan = Database["public"]["Tables"]["kas_kegiatan"]["Row"];
export type KasKegiatanInsert = Database["public"]["Tables"]["kas_kegiatan"]["Insert"];
export type UpahPenarik = Database["public"]["Tables"]["upah_penarik"]["Row"];
export type RiwayatPerubahan = Database["public"]["Tables"]["riwayat_perubahan"]["Row"];
export type SaldoKas = Database["public"]["Views"]["v_saldo_kas"]["Row"];
export type BelumSetorMingguIni = Database["public"]["Views"]["v_belum_setor_minggu_ini"]["Row"];
export type UpahBelumDibayar = Database["public"]["Views"]["v_upah_belum_dibayar"]["Row"];
