-- =========================================================
-- SKEMA DATABASE: SISTEM JIMPITAN DUSUN
-- Migration 003 — jalankan di Supabase SQL Editor
-- =========================================================

-- 1. Data warga/KK
create table warga (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  no_rumah text,           -- misal "RT 02 No. 5"
  no_hp text,              -- format 62xxxxxxxxxx, buat wa.me link
  status_aktif boolean default true,
  created_at timestamptz default now()
);

-- 2. Data penarik jimpitan (bisa lebih dari 1 orang gantian)
create table penarik (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  no_hp text,
  status_aktif boolean default true,
  created_at timestamptz default now()
);

-- 3. Transaksi jimpitan mingguan
-- Catatan: SEMUA setoran lunas masuk kas 100% (tanpa potongan)
-- Upah penarik diambil bebas dari kas oleh pengurus (bukan di-potongan otomatis)
create table jimpitan_transaksi (
  id uuid primary key default gen_random_uuid(),
  warga_id uuid references warga(id) not null,
  penarik_id uuid references penarik(id),        -- siapa yang narik minggu itu
  minggu_ke date not null,                        -- tanggal awal minggu (misal tiap Senin)
  jumlah_setor numeric(10,2) not null default 5000,
  status text not null default 'lunas' check (status in ('lunas','belum','nihil')),
  dicatat_oleh text,
  created_at timestamptz default now()
);

-- 4. Ledger kas kegiatan desa (pemasukan otomatis dari jimpitan + pengeluaran manual)
create table kas_kegiatan (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null default current_date,
  jenis text not null check (jenis in ('masuk','keluar')),
  jumlah numeric(10,2) not null,
  keterangan text not null,          -- wajib diisi, misal "Acara 17 Agustus"
  nama_penarik text,                -- nama penarik (untuk penarikan upah)
  disetujui_oleh text,               -- nama kadus/pengurus yang approve
  transaksi_ref uuid references jimpitan_transaksi(id), -- null kalau pengeluaran manual
  created_at timestamptz default now()
);

-- 5. Pembayaran upah penarik (rekap per periode)
create table upah_penarik (
  id uuid primary key default gen_random_uuid(),
  penarik_id uuid references penarik(id) not null,
  periode_mulai date not null,
  periode_selesai date not null,
  total_upah numeric(10,2) not null,
  status text not null default 'belum_dibayar' check (status in ('belum_dibayar','sudah_dibayar')),
  tanggal_dibayar date,
  created_at timestamptz default now()
);

-- 6. Log perubahan (audit trail buat transparansi)
create table riwayat_perubahan (
  id uuid primary key default gen_random_uuid(),
  tabel text not null,          -- nama tabel yang diubah
  record_id uuid not null,      -- id baris yang diubah
  aksi text not null check (aksi in ('insert','update','delete')),
  data_lama jsonb,
  data_baru jsonb,
  diubah_oleh text,
  created_at timestamptz default now()
);

-- =========================================================
-- VIEW: Saldo kas kegiatan desa (real-time)
-- =========================================================
create view v_saldo_kas as
select
  coalesce(sum(case when jenis = 'masuk' then jumlah else -jumlah end), 0) as saldo_kas_kegiatan
from kas_kegiatan;

-- VIEW: Rekap belum setor minggu berjalan
-- Catatan: date_trunc('week') di Postgres = Senin (ISO)
create view v_belum_setor_minggu_ini as
select w.id, w.nama, w.no_hp, w.no_rumah
from warga w
where w.status_aktif = true
and w.id not in (
  select warga_id from jimpitan_transaksi
  where minggu_ke = date_trunc('week', current_date)::date
  and status = 'lunas'
);

-- VIEW: Total upah penarik yang belum dibayar
-- CATATAN: hanya untuk tracking -- nominal upah ditentukan bebas oleh pengurus saat menarik dari kas
create view v_upah_belum_dibayar as
select penarik_id, sum(total_upah) as total_belum_dibayar
from upah_penarik
where status = 'belum_dibayar'
group by penarik_id;

-- =========================================================
-- Trigger: otomatis masuk ke kas_kegiatan tiap ada transaksi jimpitan lunas (100%)
-- =========================================================
create or replace function fn_auto_kas_masuk()
returns trigger as $$
begin
  if new.status = 'lunas' then
    insert into kas_kegiatan (tanggal, jenis, jumlah, keterangan, transaksi_ref)
    values (new.minggu_ke, 'masuk', new.jumlah_setor, 'Setoran jimpitan mingguan', new.id);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_auto_kas_masuk
after insert on jimpitan_transaksi
for each row execute function fn_auto_kas_masuk();

-- =========================================================
-- Trigger: audit trail ke riwayat_perubahan
-- (jimpitan_transaksi & kas_kegiatan — insert/update/delete)
-- =========================================================
create or replace function fn_audit_riwayat()
returns trigger as $$
declare
  v_record_id uuid;
  v_aksi text;
  v_lama jsonb;
  v_baru jsonb;
begin
  if tg_op = 'INSERT' then
    v_aksi := 'insert';
    v_record_id := new.id;
    v_lama := null;
    v_baru := to_jsonb(new);
  elsif tg_op = 'UPDATE' then
    v_aksi := 'update';
    v_record_id := new.id;
    v_lama := to_jsonb(old);
    v_baru := to_jsonb(new);
  elsif tg_op = 'DELETE' then
    v_aksi := 'delete';
    v_record_id := old.id;
    v_lama := to_jsonb(old);
    v_baru := null;
  end if;

  insert into riwayat_perubahan (tabel, record_id, aksi, data_lama, data_baru, diubah_oleh)
  values (
    tg_table_name,
    v_record_id,
    v_aksi,
    v_lama,
    v_baru,
    coalesce(current_setting('app.current_user', true), 'system')
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
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
-- Index untuk performa query umum
-- =========================================================
create index idx_jimpitan_warga on jimpitan_transaksi(warga_id);
create index idx_jimpitan_minggu on jimpitan_transaksi(minggu_ke);
create index idx_jimpitan_status on jimpitan_transaksi(status);
create index idx_kas_tanggal on kas_kegiatan(tanggal);
create index idx_kas_jenis on kas_kegiatan(jenis);
create index idx_upah_penarik on upah_penarik(penarik_id);
create index idx_upah_status on upah_penarik(status);
create index idx_riwayat_tabel_record on riwayat_perubahan(tabel, record_id);

-- =========================================================
-- Row Level Security (RLS)
-- =========================================================
alter table warga enable row level security;
alter table penarik enable row level security;
alter table jimpitan_transaksi enable row level security;
alter table kas_kegiatan enable row level security;
alter table upah_penarik enable row level security;
alter table riwayat_perubahan enable row level security;

-- Publik (anon) bisa baca
create policy "public read warga" on warga for select using (true);
create policy "public read penarik" on penarik for select using (true);
create policy "public read transaksi" on jimpitan_transaksi for select using (true);
create policy "public read kas" on kas_kegiatan for select using (true);
create policy "public read upah" on upah_penarik for select using (true);
create policy "public read riwayat" on riwayat_perubahan for select using (true);

-- Admin (authenticated) bisa tulis
create policy "admin write warga" on warga
  for all to authenticated using (true) with check (true);
create policy "admin write penarik" on penarik
  for all to authenticated using (true) with check (true);
create policy "admin write transaksi" on jimpitan_transaksi
  for all to authenticated using (true) with check (true);
create policy "admin write kas" on kas_kegiatan
  for all to authenticated using (true) with check (true);
create policy "admin write upah" on upah_penarik
  for all to authenticated using (true) with check (true);
create policy "admin write riwayat" on riwayat_perubahan
  for insert to authenticated with check (true);
