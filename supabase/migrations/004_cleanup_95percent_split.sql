-- =========================================================
-- MIGRATION 004 — Cleanup 95%/5% Split
-- Tanggal: 2026-08-10
--
-- APA YANG DIUBAH:
-- 1. Hapus kolom generated `potongan_kas` & `dana_kegiatan` dari jimpitan_transaksi
-- 2. Update trigger trg_auto_kas_masuk → insert 100% setoran ke kas
-- 3. Hapus view orphan `v_upah_belum_dibayar`
-- 4. Hapus tabel orphan `upah_penarik`
--
-- CARA: Copy semua code ini, paste ke Supabase SQL Editor, lalu Run.
-- =========================================================

-- =========================================================
-- LANGKAH 1: Hapus trigger & function lama
-- =========================================================
drop trigger if exists trg_audit_jimpitan_transaksi on jimpitan_transaksi;
drop trigger if exists trg_auto_kas_masuk on jimpitan_transaksi;
drop function if exists fn_auto_kas_masuk;
drop function if exists fn_audit_riwayat cascade;

-- =========================================================
-- LANGKAH 2: Hapus FK constraint & view yang tergantung ke tabel ini
-- =========================================================
alter table kas_kegiatan drop constraint if exists kas_kegiatan_transaksi_ref_fkey;
drop view if exists v_belum_setor_minggu_ini;

-- =========================================================
-- LANGKAH 3: Drop & Recreate tabel jimpitan_transaksi
-- (tanpa potongan_kas & dana_kegiatan)
-- CASCADE = auto hapus semua object yang bergantung
-- =========================================================
drop table if exists jimpitan_transaksi cascade;
drop view if exists v_belum_setor_minggu_ini;

create table jimpitan_transaksi (
  id          uuid primary key default gen_random_uuid(),
  warga_id    uuid references warga(id) not null,
  penarik_id  uuid references penarik(id),
  minggu_ke   date not null,
  jumlah_setor numeric(10,2) not null default 5000,
  status      text not null check (status in ('lunas','belum','nihil')),
  dicatat_oleh text,
  created_at  timestamptz default now()
);

-- Restore indexes
create index idx_jimpitan_warga   on jimpitan_transaksi(warga_id);
create index idx_jimpitan_minggu  on jimpitan_transaksi(minggu_ke);
create index idx_jimpitan_status  on jimpitan_transaksi(status);

-- Aktifkan RLS lagi (hilang karena drop table)
alter table jimpitan_transaksi enable row level security;
create policy "public read transaksi" on jimpitan_transaksi for select using (true);
create policy "admin write transaksi" on jimpitan_transaksi
  for all to authenticated using (true) with check (true);

-- Restore foreign key di kas_kegiatan (hilang karena langkah 2)
-- WARNING: nullify transaksi_ref orphan dulu karena kas_kegiatan record masih pointing
-- ke ID jimpitan_transaksi lama yang sudah tidak ada
update kas_kegiatan set transaksi_ref = null
where transaksi_ref is not null
  and transaksi_ref not in (select id from jimpitan_transaksi);

alter table kas_kegiatan
  add constraint kas_kegiatan_transaksi_ref_fkey
  foreign key (transaksi_ref) references jimpitan_transaksi(id);

-- =========================================================
-- LANGKAH 4: Recreate trigger kas masuk (100%, bukan 95%)
-- =========================================================
create function fn_auto_kas_masuk()
returns trigger as $$
begin
  if new.status = 'lunas' then
    insert into kas_kegiatan (tanggal, jenis, jumlah, keterangan, transaksi_ref)
    values (
      new.minggu_ke,
      'masuk',
      new.jumlah_setor,
      'Setoran jimpitan mingguan',
      new.id
    );
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_auto_kas_masuk
after insert on jimpitan_transaksi
for each row execute function fn_auto_kas_masuk();

-- =========================================================
-- LANGKAH 5: Recreate trigger audit trail
-- =========================================================
create function fn_audit_riwayat()
returns trigger as $$
declare
  v_record_id uuid;
  v_aksi      text;
  v_lama      jsonb;
  v_baru      jsonb;
begin
  if tg_op = 'INSERT' then
    v_aksi      := 'insert';
    v_record_id := new.id;
    v_lama      := null;
    v_baru      := to_jsonb(new);
  elsif tg_op = 'UPDATE' then
    v_aksi      := 'update';
    v_record_id := new.id;
    v_lama      := to_jsonb(old);
    v_baru      := to_jsonb(new);
  elsif tg_op = 'DELETE' then
    v_aksi      := 'delete';
    v_record_id := old.id;
    v_lama      := to_jsonb(old);
    v_baru      := null;
  end if;
  insert into riwayat_perubahan (tabel, record_id, aksi, data_lama, data_baru, diubah_oleh)
  values (
    tg_table_name, v_record_id, v_aksi, v_lama, v_baru,
    coalesce(current_setting('app.current_user', true), 'system')
  );
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_audit_jimpitan_transaksi
after insert or update or delete on jimpitan_transaksi
for each row execute function fn_audit_riwayat();

create trigger trg_audit_kas_kegiatan
after insert or update or delete on kas_kegiatan
for each row execute function fn_audit_riwayat();

-- =========================================================
-- LANGKAH 6: Hapus orphan & recreate view
-- =========================================================
drop view  if exists v_upah_belum_dibayar;
drop table if exists upah_penarik;

create view v_belum_setor_minggu_ini as
select w.id, w.nama, w.no_hp, w.no_rumah
from warga w
where w.status_aktif = true
and w.id not in (
  select warga_id from jimpitan_transaksi
  where minggu_ke = date_trunc('week', current_date)::date
  and status = 'lunas'
);

-- =========================================================
-- VERIFIKASI
-- =========================================================
-- Kolom jimpitan_transaksi (seharusnya 8 kolom)
select count(*) as total_kolom,
  string_agg(column_name, ', ' order by ordinal_position) as kolom
from information_schema.columns
where table_name = 'jimpitan_transaksi' and table_schema = 'public';

-- Trigger
select trigger_name, event_object_table, action_timing, event_manipulation
from information_schema.triggers
where trigger_schema = 'public'
order by event_object_table, trigger_name;

-- Cek orphan sudah dihapus
select 'upah_penarik' as object, exists (
  select 1 from information_schema.tables
  where table_name = 'upah_penarik' and table_schema = 'public'
) as masih_ada
union all
select 'v_upah_belum_dibayar', exists (
  select 1 from information_schema.views
  where table_name = 'v_upah_belum_dibayar' and table_schema = 'public'
);
