-- =========================================================
-- MIGRATION 005 — Tambah kolom nama_penarik ke kas_kegiatan
-- Tanggal: 2026-08-10
-- =========================================================

alter table kas_kegiatan
  add column if not exists nama_penarik text;

-- Verifikasi
select column_name, data_type
from information_schema.columns
where table_name = 'kas_kegiatan' and table_schema = 'public'
order by ordinal_position;
