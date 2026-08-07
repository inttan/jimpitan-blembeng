-- =========================================================
-- RLS POLICIES: Allow public write (no login required)
-- Run this in Supabase SQL Editor
-- =========================================================

-- Drop existing write policies
DROP POLICY IF EXISTS "admin write warga" ON warga;
DROP POLICY IF EXISTS "admin write penarik" ON penarik;
DROP POLICY IF EXISTS "admin write transaksi" ON jimpitan_transaksi;
DROP POLICY IF EXISTS "admin write kas" ON kas_kegiatan;
DROP POLICY IF EXISTS "admin write upah" ON upah_penarik;

-- Warga: anyone can do anything
CREATE POLICY "public write warga" ON warga
  FOR ALL USING (true) WITH CHECK (true);

-- Penarik: anyone can do anything
CREATE POLICY "public write penarik" ON penarik
  FOR ALL USING (true) WITH CHECK (true);

-- Transaksi jimpitan: anyone can INSERT/UPDATE/DELETE
CREATE POLICY "public write transaksi" ON jimpitan_transaksi
  FOR ALL USING (true) WITH CHECK (true);

-- Kas kegiatan: anyone can INSERT/UPDATE/DELETE
CREATE POLICY "public write kas" ON kas_kegiatan
  FOR ALL USING (true) WITH CHECK (true);

-- Upah penarik: anyone can do anything
CREATE POLICY "public write upah" ON upah_penarik
  FOR ALL USING (true) WITH CHECK (true);

-- Riwayat perubahan: anyone can INSERT (reads are already public)
CREATE POLICY "public write riwayat" ON riwayat_perubahan
  FOR INSERT TO authenticated WITH CHECK (true);

-- Also allow public INSERT on riwayat
DROP POLICY IF EXISTS "admin write riwayat" ON riwayat_perubahan;
CREATE POLICY "public insert riwayat" ON riwayat_perubahan
  FOR INSERT WITH CHECK (true);
