-- ============================================================
-- MIGRATION 002: REVISED SCHEMA - BANK SAMPAH KEBONAGUNG
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: DROP TRIGGERS & FUNCTIONS LAMA (jika ada)
-- ============================================================
DROP TRIGGER IF EXISTS trigger_update_saldo_stok ON transaksi_setoran;
DROP TRIGGER IF EXISTS set_updated_at_nasabah ON nasabah;
DROP TRIGGER IF EXISTS set_updated_at_inventory ON sampah_inventory;
DROP TRIGGER IF EXISTS set_updated_at_transaksi ON transaksi_setoran;
DROP FUNCTION IF EXISTS update_saldo_dan_stok();
DROP FUNCTION IF EXISTS trigger_set_updated_at();

-- ============================================================
-- STEP 2: REVISI TABEL NASABAH
-- Hapus kolom lama yang anti-pattern, tambah yang diperlukan
-- ============================================================
ALTER TABLE nasabah
  DROP COLUMN IF EXISTS saldo,              -- anti-pattern: ganti dengan computed view
  ADD COLUMN IF NOT EXISTS no_wa VARCHAR(20),
  ADD COLUMN IF NOT EXISTS tanggal_daftar DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS rt_rw VARCHAR(10);

-- Pastikan kolom wajib ada
ALTER TABLE nasabah
  ALTER COLUMN status SET DEFAULT 'aktif';

-- ============================================================
-- STEP 3: REVISI TABEL SAMPAH_INVENTORY
-- ============================================================
ALTER TABLE sampah_inventory
  DROP COLUMN IF EXISTS stok_total,  -- stok dihitung dari transaksi
  ADD COLUMN IF NOT EXISTS deskripsi TEXT;

-- ============================================================
-- STEP 4: REVISI TABEL TRANSAKSI_SETORAN
-- ============================================================
-- Drop kolom generated dulu sebelum alter
ALTER TABLE transaksi_setoran
  DROP COLUMN IF EXISTS total_nilai,
  DROP COLUMN IF EXISTS petugas_id;

ALTER TABLE transaksi_setoran
  ADD COLUMN IF NOT EXISTS berat_kg     NUMERIC(8, 2),
  ADD COLUMN IF NOT EXISTS harga_satuan NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS potongan_kas NUMERIC(12, 2) GENERATED ALWAYS AS
    (ROUND((berat_kg * harga_satuan) * 0.10, 2)) STORED,
  ADD COLUMN IF NOT EXISTS nilai_bersih NUMERIC(12, 2) GENERATED ALWAYS AS
    (ROUND((berat_kg * harga_satuan) * 0.90, 2)) STORED,
  ADD COLUMN IF NOT EXISTS nilai_kotor  NUMERIC(12, 2) GENERATED ALWAYS AS
    (ROUND(berat_kg * harga_satuan, 2)) STORED;

-- ============================================================
-- STEP 5: TABEL HARGA_SAMPAH (Riwayat Harga - Pasar Fluktuatif)
-- Setiap perubahan harga dicatat, bukan di-overwrite
-- ============================================================
CREATE TABLE IF NOT EXISTS harga_sampah (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sampah_id       UUID NOT NULL REFERENCES sampah_inventory(id) ON DELETE RESTRICT,
  harga_per_kg    NUMERIC(10, 2) NOT NULL CHECK (harga_per_kg > 0),
  berlaku_mulai   DATE NOT NULL DEFAULT CURRENT_DATE,
  catatan         TEXT,                     -- e.g. "Naik karena permintaan pabrik"
  dibuat_oleh     TEXT,                     -- nama admin
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk query harga terbaru
CREATE INDEX IF NOT EXISTS idx_harga_sampah_berlaku
  ON harga_sampah(sampah_id, berlaku_mulai DESC);

-- ============================================================
-- STEP 6: TABEL KAS_OPERASIONAL (Transparansi Kas 10%)
-- Setiap potongan 10% tercatat sebagai entitas mandiri
-- ============================================================
CREATE TABLE IF NOT EXISTS kas_operasional (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaksi_id      UUID NOT NULL REFERENCES transaksi_setoran(id) ON DELETE RESTRICT,
  jumlah            NUMERIC(12, 2) NOT NULL,
  keterangan        TEXT NOT NULL DEFAULT 'Potongan kas 10% dari setoran',
  tanggal           DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STEP 7: TABEL TRANSAKSI_PENARIKAN_TUNAI (Pencairan Lebaran)
-- ============================================================
CREATE TABLE IF NOT EXISTS transaksi_penarikan_tunai (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode_penarikan    VARCHAR(30) UNIQUE NOT NULL,  -- e.g. "TRK-LEBARAN-2025-001"
  nasabah_id        UUID NOT NULL REFERENCES nasabah(id) ON DELETE RESTRICT,
  jumlah_diterima   NUMERIC(12, 2) NOT NULL CHECK (jumlah_diterima > 0),
  admin_saksi       TEXT NOT NULL,                -- Nama admin yang mencairkan
  periode_lebaran   VARCHAR(20) NOT NULL,         -- e.g. "Ramadan 1446H / 2025"
  catatan           TEXT,
  tanggal_pencairan DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_penarikan_nasabah
  ON transaksi_penarikan_tunai(nasabah_id);
CREATE INDEX IF NOT EXISTS idx_penarikan_periode
  ON transaksi_penarikan_tunai(periode_lebaran);

-- ============================================================
-- STEP 8: VIEW - SALDO NASABAH (Anti-Pattern Fix)
-- Saldo = total setoran (bersih) - total penarikan
-- Ini SELALU akurat, tidak bisa korup karena trigger
-- ============================================================
CREATE OR REPLACE VIEW v_saldo_nasabah AS
SELECT
  n.id,
  n.kode_nasabah,
  n.nama_lengkap,
  n.no_wa,
  n.no_hp,
  n.alamat,
  n.rt_rw,
  n.status,
  n.tanggal_daftar,
  COALESCE(SUM(ts.nilai_bersih) FILTER (WHERE ts.status = 'terverifikasi'), 0)
    AS total_setoran_bersih,
  COALESCE(SUM(tp.jumlah_diterima), 0)
    AS total_dicairkan,
  COALESCE(SUM(ts.nilai_bersih) FILTER (WHERE ts.status = 'terverifikasi'), 0)
  - COALESCE(SUM(tp.jumlah_diterima), 0)
    AS saldo_aktif,             -- Tabungan yang belum dicairkan
  COUNT(ts.id) FILTER (WHERE ts.status = 'terverifikasi')
    AS total_transaksi
FROM nasabah n
LEFT JOIN transaksi_setoran ts ON ts.nasabah_id = n.id
LEFT JOIN transaksi_penarikan_tunai tp ON tp.nasabah_id = n.id
GROUP BY n.id, n.kode_nasabah, n.nama_lengkap, n.no_wa, n.no_hp,
         n.alamat, n.rt_rw, n.status, n.tanggal_daftar;

-- ============================================================
-- STEP 9: VIEW - HARGA SAMPAH AKTIF (Harga terbaru per item)
-- ============================================================
CREATE OR REPLACE VIEW v_harga_aktif AS
SELECT DISTINCT ON (si.id)
  si.id            AS sampah_id,
  si.kode_sampah,
  si.nama_sampah,
  si.kategori,
  si.satuan,
  si.is_active,
  hs.harga_per_kg,
  hs.berlaku_mulai,
  hs.catatan       AS catatan_harga
FROM sampah_inventory si
LEFT JOIN harga_sampah hs ON hs.sampah_id = si.id
  AND hs.berlaku_mulai <= CURRENT_DATE
ORDER BY si.id, hs.berlaku_mulai DESC;

-- ============================================================
-- STEP 10: VIEW - DASHBOARD METRICS (1 query untuk semua KPI)
-- ============================================================
CREATE OR REPLACE VIEW v_dashboard_metrics AS
SELECT
  -- Total tabungan yang wajib disiapkan pengurus (liabilities)
  COALESCE(SUM(ts.nilai_bersih) FILTER (
    WHERE ts.status = 'terverifikasi'
  ), 0) - COALESCE((
    SELECT SUM(jumlah_diterima) FROM transaksi_penarikan_tunai
  ), 0) AS total_liabilities,

  -- Total sampah masuk (kg) yang terverifikasi
  COALESCE(SUM(ts.berat_kg) FILTER (
    WHERE ts.status = 'terverifikasi'
  ), 0) AS total_sampah_kg,

  -- Total kas terkumpul dari potongan 10%
  COALESCE(SUM(ts.potongan_kas) FILTER (
    WHERE ts.status = 'terverifikasi'
  ), 0) AS total_kas_terkumpul,

  -- Total transaksi hari ini
  COUNT(ts.id) FILTER (
    WHERE ts.status = 'terverifikasi'
    AND ts.tanggal_setor = CURRENT_DATE
  ) AS transaksi_hari_ini,

  -- Rata-rata setoran per transaksi
  ROUND(AVG(ts.nilai_bersih) FILTER (
    WHERE ts.status = 'terverifikasi'
  ), 0) AS rata_rata_setoran

FROM transaksi_setoran ts;

-- Nasabah aktif (query terpisah karena beda tabel)
CREATE OR REPLACE VIEW v_nasabah_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'aktif') AS nasabah_aktif,
  COUNT(*) AS total_nasabah
FROM nasabah;

-- ============================================================
-- STEP 11: FUNCTION - Auto-insert KAS saat transaksi verified
-- Hanya fungsi ini yang menggunakan trigger, scope terbatas
-- ============================================================
CREATE OR REPLACE FUNCTION fn_catat_kas_operasional()
RETURNS TRIGGER AS $$
BEGIN
  -- Jika transaksi baru terverifikasi, catat potongan kas
  IF NEW.status = 'terverifikasi' AND (OLD.status IS NULL OR OLD.status != 'terverifikasi') THEN
    INSERT INTO kas_operasional (transaksi_id, jumlah, tanggal)
    VALUES (NEW.id, NEW.potongan_kas, NEW.tanggal_setor);
  END IF;

  -- Jika dibatalkan setelah terverifikasi, hapus record kas
  IF NEW.status = 'dibatalkan' AND OLD.status = 'terverifikasi' THEN
    DELETE FROM kas_operasional WHERE transaksi_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_catat_kas
  AFTER INSERT OR UPDATE OF status ON transaksi_setoran
  FOR EACH ROW EXECUTE FUNCTION fn_catat_kas_operasional();

-- ============================================================
-- STEP 12: FUNCTION - updated_at trigger (universal)
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_nasabah
  BEFORE UPDATE ON nasabah
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER set_updated_at_transaksi
  BEFORE UPDATE ON transaksi_setoran
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER set_updated_at_inventory
  BEFORE UPDATE ON sampah_inventory
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- STEP 13: SAMPLE DATA (untuk development/testing)
-- Hapus block ini sebelum production
-- ============================================================
INSERT INTO nasabah (kode_nasabah, nama_lengkap, nik, no_hp, no_wa, alamat, rt_rw)
VALUES
  ('NSB-2025-001', 'Siti Rahayu', '3308010101800001', '08123456789', '6281234567890', 'Desa Kebonagung RT 01', '001/001'),
  ('NSB-2025-002', 'Budi Santoso', '3308010101800002', '08234567890', '6282345678901', 'Desa Kebonagung RT 02', '002/001'),
  ('NSB-2025-003', 'Dewi Lestari', '3308010101800003', '08345678901', '6283456789012', 'Desa Kebonagung RT 01', '001/002')
ON CONFLICT (kode_nasabah) DO NOTHING;

INSERT INTO sampah_inventory (kode_sampah, nama_sampah, kategori, satuan, deskripsi)
VALUES
  ('SMP-KDZ-01',  'Kardus',          'kertas',   'kg', 'Kardus bekas, kering'),
  ('SMP-PLB-01',  'Plastik Botol',   'plastik',  'kg', 'Botol plastik PET (Aqua dll)'),
  ('SMP-BHK-01',  'Besi / Baja',     'logam',    'kg', 'Besi tua, paku, plat'),
  ('SMP-KLG-01',  'Kaleng',          'logam',    'kg', 'Kaleng minuman/makanan'),
  ('SMP-SND-01',  'Sandal/Sepatu',   'lainnya',  'kg', 'Sandal dan sepatu bekas'),
  ('SMP-KCA-01',  'Kaca / Botol',    'kaca',     'kg', 'Botol kaca, pecahan kaca')
ON CONFLICT (kode_sampah) DO NOTHING;

-- Harga awal (berlaku mulai hari ini)
INSERT INTO harga_sampah (sampah_id, harga_per_kg, catatan, dibuat_oleh)
SELECT id, harga, 'Harga awal setup sistem', 'Admin'
FROM (VALUES
  ('SMP-KDZ-01', 2000),
  ('SMP-PLB-01', 3500),
  ('SMP-BHK-01', 5000),
  ('SMP-KLG-01', 4000),
  ('SMP-SND-01', 1000),
  ('SMP-KCA-01', 800)
) AS h(kode, harga)
JOIN sampah_inventory si ON si.kode_sampah = h.kode
ON CONFLICT DO NOTHING;