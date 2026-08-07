-- =========================================================
-- FIX: Correct minggu_ke dates that were stored wrong
-- due to UTC timezone bug in toISOString() calculation
--
-- Bug: d.toISOString().split("T")[0] returns UTC date,
-- which is 1 day earlier than local date in WIB (UTC+7)
--
-- This script shifts wrong dates to the correct Monday.
-- =========================================================

-- Show what will be changed (preview)
SELECT
  id,
  warga_id,
  minggu_ke AS stored_wrong,
  CASE
    WHEN EXTRACT(DOW FROM minggu_ke) = 0  -- Sunday → shift to next Monday
      THEN minggu_ke + INTERVAL '1 day'
    WHEN EXTRACT(DOW FROM minggu_ke) = 6  -- Saturday → shift to next Monday (+2 days)
      THEN minggu_ke + INTERVAL '2 days'
    ELSE minggu_ke  -- Already Monday (shouldn't happen, but safe)
  END AS correct_date,
  status
FROM jimpitan_transaksi
WHERE
  EXTRACT(DOW FROM minggu_ke) IN (0, 6)  -- Only Sunday (0) or Saturday (6)
ORDER BY minggu_ke;

-- =========================================================
-- ACTUAL FIX: Update the wrong dates
-- =========================================================
UPDATE jimpitan_transaksi
SET minggu_ke = CASE
    WHEN EXTRACT(DOW FROM minggu_ke) = 0
      THEN minggu_ke + INTERVAL '1 day'
    WHEN EXTRACT(DOW FROM minggu_ke) = 6
      THEN minggu_ke + INTERVAL '2 days'
    ELSE minggu_ke
  END
WHERE EXTRACT(DOW FROM minggu_ke) IN (0, 6);

-- =========================================================
-- Also fix kas_kegiatan entries that were auto-created
-- by the trigger with the wrong date
-- =========================================================

-- Preview kas_kegiatan that will be fixed
SELECT
  k.id,
  k.tanggal AS stored_wrong,
  CASE
    WHEN EXTRACT(DOW FROM k.tanggal) = 0
      THEN k.tanggal + INTERVAL '1 day'
    WHEN EXTRACT(DOW FROM k.tanggal) = 6
      THEN k.tanggal + INTERVAL '2 days'
    ELSE k.t.tanggal
  END AS correct_date,
  k.jenis,
  k.transaksi_ref
FROM kas_kegiatan k
JOIN jimpitan_transaksi t ON t.id = k.transaksi_ref
WHERE
  EXTRACT(DOW FROM k.tanggal) IN (0, 6)
  AND k.transaksi_ref IS NOT NULL  -- Only auto-created entries
ORDER BY k.tanggal;

-- Fix kas_kegiatan dates
UPDATE kas_kegiatan
SET tanggal = CASE
    WHEN EXTRACT(DOW FROM tanggal) = 0
      THEN tanggal + INTERVAL '1 day'
    WHEN EXTRACT(DOW FROM tanggal) = 6
      THEN tanggal + INTERVAL '2 days'
    ELSE tanggal
  END
WHERE
  EXTRACT(DOW FROM tanggal) IN (0, 6)
  AND transaksi_ref IS NOT NULL;

-- =========================================================
-- Verify: count rows affected
-- =========================================================
SELECT
  'jimpitan_transaksi' AS table_name,
  COUNT(*) AS rows_checked,
  SUM(CASE WHEN EXTRACT(DOW FROM minggu_ke) IN (0, 6) THEN 1 ELSE 0 END) AS should_be_zero_now
FROM jimpitan_transaksi;

SELECT
  'kas_kegiatan (auto entries)' AS table_name,
  COUNT(*) AS rows_checked,
  SUM(CASE WHEN EXTRACT(DOW FROM tanggal) IN (0, 6) THEN 1 ELSE 0 END) AS should_be_zero_now
FROM kas_kegiatan
WHERE transaksi_ref IS NOT NULL;
