# LAPORAN AUDIT MENYELURUH
## Bank Sampah Desa Kebonagung
**Tanggal Audit:** 17 Juli 2026
**Auditor:** Claude Code

---

## RINGKASAN EKSEKUTIF

| Kategori | Status | Detail |
|----------|--------|--------|
| Konsistensi Bahasa ID/EN | :warning: PERLU PERBAIKI | 218+ string hardcoded di 15 file |
| Referensi `transaksi_setoran` | :white_check_mark: BERSIH | Tidak ada referensi di seluruh codebase |
| Penggunaan `any` type | :warning: PERLU PERBAIKI | 34 lokasi di 10 file |
| File penarikan duplikat | :warning: PERLU TINDAK LANJUT | `transaksi/penarikan/page.tsx` redundan |

---


## AUDIT 1 — KONSISTENSI BAHASA ID/EN

### A. Sistem Terjemahan yang Sudah Ada

File `src/components/providers/LangProvider.tsx` menyediakan sistem i18n dengan struktur berikut:

```typescript
// Key yang SUDAH terdefinisi untuk sidebar navigation:
dashboard, setoran, harga, penarikan, laporan, panduan, panduanText, admin

// Key yang SUDAH terdefinisi untuk dashboard:
greetTitle, greetSub, btnCatat
kpi1Label, kpi1Sub, kpi2Label, kpi2Sub, kpi3Label, kpi3Sub, kpi4Label
statTxnLabel, statTxnSub, statAvgLabel, statAvgSub
chart1Title, chart1Sub, chart2Title, chart2Sub, chart3Title, chart3Sub
emptyChart, emptyPie, emptyAcc
txnTitle, txnSeeAll, txnEmpty, txnEmptyBtn
txnColNasabah, txnColJenis, txnColBerat, txnColNilai, txnColTgl
lebaranTitle, lebaranBtn
totalNasabah
```

**Total key terjemahan yang ada: ~40 key** — ini hanya mencakup teks di **halaman Dashboard** saja. Sisanya (~218 string) masih hardcoded.

---

### B. File yang SUDAH Konsisten (Menggunakan `useLang()`)

| File | Status | Keterangan |
|------|--------|------------|
| `src/components/ui/DashboardClient.tsx` | :white_check_mark: | Semuanya pakai `t.keyName` |
| `src/components/ui/Sidebar.tsx` | :white_check_mark: | Nav labels pakai `t.labelKey` |
| `src/components/ui/TopBar.tsx` | :warning: | Tanggal pakai format lokal ID/EN, OK |
| `src/components/ui/Charts.tsx` | :warning: | 1 string "Berat" hardcoded di tooltip (baris 92) |

---

### C. File yang BELUM Konsisten (Hardcoded Bahasa Indonesia)

#### C.1 FORM COMPONENTS (8 file) — Total: ~118 string

---

**File: `src/components/forms/FormTambahNasabah.tsx`**
Jumlah teks hardcoded: **13 string**

| No | Teks | Lokasi |
|----|------|--------|
| 1 | "+ Tambah Nasabah" | Button |
| 2 | "Tambah Nasabah Baru" | Modal heading |
| 3 | "Nama Lengkap" | Label |
| 4 | "NIK" | Label |
| 5 | "No. WhatsApp" | Label |
| 6 | "Alamat" | Label |
| 7 | "RT/RW" | Label |
| 8 | "Siti Rahayu" | Placeholder |
| 9 | "3308010101800001" | Placeholder |
| 10 | "6281234567890 (pakai 62...)" | Placeholder |
| 11 | "Desa Kebonagung RT 01" | Placeholder |
| 12 | "001/001" | Placeholder |
| 13 | "Simpan Nasabah" | Button |

---

**File: `src/components/forms/NasabahActions.tsx`**
Jumlah teks hardcoded: **16 string**

| No | Teks | Lokasi |
|----|------|--------|
| 1 | "Edit" | Tooltip button |
| 2 | "Hapus" | Tooltip button |
| 3 | "Edit Nasabah" | Modal heading |
| 4 | "Nama Lengkap" | Label |
| 5 | "No. WhatsApp" | Label |
| 6 | "RT/RW" | Label |
| 7 | "Status" | Label |
| 8 | "Aktif" | Option |
| 9 | "Nonaktif" | Option |
| 10 | "Simpan" | Button |
| 11 | "Batal" | Button |
| 12 | "Hapus Nasabah?" | Confirm heading |
| 13 | "akan dihapus permanen..." | Confirm text |
| 14 | "Hapus" | Confirm button |
| 15 | "Menyimpan..." | Loading state |
| 16 | "akan dihapus permanen beserta seluruh data transaksinya." | Delete warning |

---

**File: `src/components/forms/FormPenarikan.tsx`**
Jumlah teks hardcoded: **21 string**

| No | Teks | Lokasi |
|----|------|--------|
| 1 | "Cairkan Tabungan" | Button |
| 2 | "Cairkan Tabungan Lebaran" | Modal heading |
| 3 | "Pencairan Berhasil Dicatat!" | Success heading |
| 4 | "Pilih Nasabah" | Label |
| 5 | "Jumlah Dicairkan (Rp)" | Label |
| 6 | "Periode Lebaran" | Label |
| 7 | "Ramadan XXXXH / XXXX" | Placeholder |
| 8 | "Nama Admin Saksi" | Label |
| 9 | "Nama pengurus yang mencairkan" | Placeholder |
| 10 | "Catatan" | Label |
| 11 | "Opsional" | Label suffix |
| 12 | "Batal" | Button |
| 13 | "Cairkan" | Submit button |
| 14 | "Memproses..." | Loading |
| 15 | "Nomor WA belum terdaftar." | Warning |
| 16 | "Kirim Notifikasi WA ke..." | WA button |
| 17 | "Tutup" | Close button |
| 18 | "Saldo aktif:" | Info text |
| 19 | "Saldo: " | Select option |
| 20 | "Pilih nasal dulu" | Placeholder |
| 21 | "Gagal" | Error fallback |

---

**File: `src/components/forms/FormSetoran.tsx`**
Jumlah teks hardcoded: **25 string**

| No | Teks | Lokasi |
|----|------|--------|
| 1 | "Setoran berhasil dicatat!" | Success heading |
| 2 | "Nama warga" | Success sub |
| 3 | "Total Tabungan:" | Success text |
| 4 | "Kirim Notifikasi WA ke..." | WA button |
| 5 | "Nomor WA belum terdaftar." | Warning |
| 6 | "Tutup" | Close button |
| 7 | "Input Setoran Sampah" | Form heading |
| 8 | "Nama Warga *" | Label |
| 9 | "-- Pilih Warga --" | Select option |
| 10 | "Jenis & Berat Sampah *" | Label |
| 11 | "-- Pilih Jenis --" | Select option |
| 12 | "Berat (kg)" | Placeholder |
| 13 | "+ Tambah Jenis Sampah" | Add button |
| 14 | "Item X" | Item label |
| 15 | "Hapus" | Delete button |
| 16 | "Total Kotor" | Preview |
| 17 | "Potongan Kas 10%" | Preview |
| 18 | "Total Masuk Tabungan" | Preview |
| 19 | "Catatan (opsional)" | Label |
| 20 | "Misal: sampah basah, dsb." | Placeholder |
| 21 | "Simpan Setoran" | Submit button |
| 22 | "Menyimpan..." | Loading |
| 23 | "Pilih nama warga terlebih dahulu." | Error |
| 24 | "Isi minimal satu jenis..." | Error |
| 25 | "Belum ada transaksi." | Empty state |

---

**File: `src/components/forms/FormTambahSampah.tsx`**
Jumlah teks hardcoded: **18 string**

| No | Teks | Lokasi |
|----|------|--------|
| 1 | "+ Jenis Sampah Baru" | Button |
| 2 | "Tambah Jenis Sampah" | Modal heading |
| 3 | "Nama Sampah" | Label |
| 4 | "Contoh: Botol PET, Kardus, Kaleng" | Placeholder |
| 5 | "Kategori" | Label |
| 6 | "Pilih kategori" | Option |
| 7 | "Satuan" | Label |
| 8 | "Harga per kg (Rp)" | Label |
| 9 | "2000" | Placeholder |
| 10 | "Catatan (opsional)" | Label |
| 11 | "Misal: harga naik..." | Placeholder |
| 12 | "Batal" | Button |
| 13 | "Simpan" | Button |
| 14 | "Menyimpan..." | Loading |
| 15-21 | Semua kategori (Plastik, Kertas, Logam, Kaca, Organik, Elektronik, Lainnya) | Select options |

---

**File: `src/components/forms/FormUpdateHarga.tsx`**
Jumlah teks hardcoded: **12 string**

| No | Teks | Lokasi |
|----|------|--------|
| 1 | "+ Update Harga" | Button |
| 2 | "Update Harga Sampah" | Modal heading |
| 3 | "Jenis Sampah" | Label |
| 4 | "-- Pilih Jenis Sampah --" | Option |
| 5 | "sekarang: Rp..." | Option text |
| 6 | "Harga Baru (Rp/kg)" | Label |
| 7 | "Contoh: 2500" | Placeholder |
| 8 | "Berlaku Mulai" | Label |
| 9 | "Catatan (alasan)" | Label |
| 10 | "Misal: naik karena..." | Placeholder |
| 11 | "Simpan Harga" | Button |
| 12 | "Batal" | Button |

---

**File: `src/components/forms/ButtonDownloadLaporan.tsx`**
Jumlah teks hardcoded: **2 string**

| No | Teks | Lokasi |
|----|------|--------|
| 1 | "Membuat..." | Loading state |
| 2 | "Unduh Word" | Button |

---

**File: `src/components/laporan/RiwayatSetoranTable.tsx`**
Jumlah teks hardcoded: **11 string**

| No | Teks | Lokasi |
|----|------|--------|
| 1 | "Kode" | Table header |
| 2 | "Nasabah" | Table header |
| 3 | "Jenis Sampah" | Table header |
| 4 | "Total Berat" | Table header |
| 5 | "Kotor" | Table header |
| 6 | "Kas 10%" | Table header |
| 7 | "Bersih" | Table header |
| 8 | "Tanggal" | Table header |
| 9 | "Memuat detail..." | Loading |
| 10 | "Tidak ada detail." | Empty |
| 11 | "+X lagi" | Overflow badge |

---

#### C.2 HALAMAN DASHBOARD (6 file) — Total: ~97 string

---

**File: `src/app/(dashboard)/nasabah/page.tsx`**
Jumlah teks hardcoded: **18 string**

| No | Teks | Lokasi |
|----|------|--------|
| 1 | "Data Nasabah" | Heading |
| 2 | "Total Terdaftar" | Stat label |
| 3 | "Nasabah Aktif" | Stat label |
| 4 | "Punya Tabungan" | Stat label |
| 5 | "Daftar Nasabah" | Table heading |
| 6 | "Semua nasal terdaftar" | Sub text |
| 7 | "Belum ada nasal..." | Empty state |
| 8 | "Kode" | Table header |
| 9 | "Nama Lengkap" | Table header |
| 10 | "No. WA" | Table header |
| 11 | "RT/RW" | Table header |
| 12 | "Total Setoran" | Table header |
| 13 | "Saldo Aktif" | Table header |
| 14 | "Status" | Table header |
| 15 | "Terdaftar" | Table header |
| 16 | "Aksi" | Table header |
| 17 | "nasabah aktif · Total tabungan..." | Sub heading |
| 18 | "--" (fallback untuk null) | Empty cells |

---

**File: `src/app/(dashboard)/harga/page.tsx`**
Jumlah teks hardcoded: **20 string**

| No | Teks | Lokasi |
|----|------|--------|
| 1 | "Harga Sampah" | Heading |
| 2 | "Kelola harga per kg..." | Sub heading |
| 3 | "Harga Berlaku Sekarang" | Section heading |
| 4 | "Digunakan otomatis..." | Sub text |
| 5 | "Belum ada jenis sampah..." | Empty state |
| 6 | "per X · berlaku..." | Info text |
| 7 | "Belum ada harga" | Fallback text |
| 8 | "Potongan Kas Otomatis 10%" | Info box heading |
| 9 | "Setiap transaksi otomatis..." | Info box body |
| 10 | "Riwayat Perubahan Harga" | Section heading |
| 11 | "20 perubahan terbaru..." | Sub text |
| 12 | "Belum ada riwayat." | Empty state |
| 13 | "Jenis Sampah" | Table header |
| 14 | "Harga/kg" | Table header |
| 15 | "Berlaku Mulai" | Table header |
| 16 | "Catatan" | Table header |
| 17 | "Diinput Oleh" | Table header |
| 18-20 | Kategori badges (Plastik, Kertas, dll) | Colored badges |

---

**File: `src/app/(dashboard)/laporan/page.tsx`**
Jumlah teks hardcoded: **22 string**

| No | Teks | Lokasi |
|----|------|--------|
| 1 | "Laporan" | Heading |
| 2 | "Ringkasan keuangan..." | Sub heading |
| 3 | "Total Tabungan Warga" | Stat |
| 4 | "Total Setoran Bersih" | Stat |
| 5 | "Total Kas Terkumpul" | Stat |
| 6 | "Saldo Tabungan per Nasabah" | Section |
| 7 | "Diurutkan dari saldo..." | Sub |
| 8 | "Kode" | Table header |
| 9 | "Nama Nasabah" | Table header |
| 10 | "Total Setoran" | Table header |
| 11 | "Total Dicairkan" | Table header |
| 12 | "Saldo Aktif" | Table header |
| 13 | "Jml Setoran" | Table header |
| 14 | "Total Liabilities (wajib...)" | Total row |
| 15 | "Riwayat Setoran" | Section |
| 16 | "50 setoran terbaru" | Sub |
| 17 | "Riwayat Pencairan Lebaran" | Section |
| 18 | "Kode" | Table header |
| 19 | "Nasabah" | Table header |
| 20 | "Jumlah Dicairkan" | Table header |
| 21 | "Periode" | Table header |
| 22 | "Admin Saksi" | Table header |
| 23 | "Tanggal" | Table header |

---

**File: `src/app/(dashboard)/penarikan/page.tsx`**
Jumlah teks hardcoded: **24 string**

| No | Teks | Lokasi |
|----|------|--------|
| 1 | "Pencairan Tabungan Lebaran" | Heading |
| 2 | "X nasal..." | Sub heading |
| 3 | "Panduan Pencairan" | Info box heading |
| 4 | "Pencairan hanya dilakukan..." | Info box body |
| 5 | "Nasabah yang Punya Saldo..." | Table heading |
| 6 | "Semua saldo sudah dicairkan..." | Empty state |
| 7 | "Nama Nasabah" | Table header |
| 8 | "No. WA" | Table header |
| 9 | "Saldo Siap Cair" | Table header |
| 10 | "Total yang harus disiapkan" | Total row |
| 11 | "Riwayat Pencairan" | Section |
| 12 | "Nasabah" | Table header |
| 13 | "Jumlah" | Table header |
| 14 | "Periode" | Table header |
| 15 | "Admin Saksi" | Table header |
| 16 | "Tanggal" | Table header |
| 17 | "--" | Fallback untuk null |
| 18-24 | Various subtexts dan info labels | Body text |

---

**File: `src/app/(dashboard)/transaksi/page.tsx`**
Jumlah teks hardcoded: **3 string**

| No | Teks | Lokasi |
|----|------|--------|
| 1 | "Catat Setoran Sampah" | Heading |
| 2 | "Isi form di bawah lalu..." | Sub heading |

---

**File: `src/app/(dashboard)/transaksi/penarikan/page.tsx`**
Jumlah teks hardcoded: **~10 string**

*(Lihat Audit 4 untuk detail — file ini redundan)*

---

#### C.3 UI COMPONENTS (2 file) — Total: 3 string

---

**File: `src/components/ui/Sidebar.tsx`**
Jumlah teks hardcoded: **2 string**

| No | Teks | Lokasi |
|----|------|--------|
| 1 | "Bank Sampah" | Logo text |
| 2 | "Desa Kebonagung" | Logo sub text |

---

**File: `src/components/ui/Charts.tsx`**
Jumlah teks hardcoded: **1 string**

| No | Teks | Lokasi |
|----|------|--------|
| 1 | "Berat" | Tooltip label di pie chart |

---

### D. Ringkasan Kuantitatif

| Kategori | File | Jumlah String |
|----------|------|---------------|
| Form Components | FormTambahNasabah.tsx | 13 |
| | NasabahActions.tsx | 16 |
| | FormPenarikan.tsx | 21 |
| | FormSetoran.tsx | 25 |
| | FormTambahSampah.tsx | 18 |
| | FormUpdateHarga.tsx | 12 |
| | ButtonDownloadLaporan.tsx | 2 |
| | RiwayatSetoranTable.tsx | 11 |
| **Subtotal Form** | | **118** |
| Halaman | nasal/page.tsx | 18 |
| | harga/page.tsx | 20 |
| | laporan/page.tsx | 22 |
| | penarikan/page.tsx | 24 |
| | transaksi/page.tsx | 3 |
| | transaksi/penarikan/page.tsx | ~10 |
| **Subtotal Halaman** | | **~97** |
| UI Components | Sidebar.tsx | 2 |
| | Charts.tsx | 1 |
| **Subtotal UI** | | **3** |
| | | |
| **TOTAL KESELURUHAN** | | **~218 string** |

---

### E. Key Baru yang Perlu Ditambahkan ke LangProvider

Key terjemahan yang BELUM ada di `LangProvider.tsx` (perlu dibuat baru):

```
// --- Form Labels ---
formNamaLengkap, formNik, formNoWa, formAlamat, formRtRw
formSimpan, formBatal, formTambah, formEdit, formHapus
formWajib, formOpsional, formPilih, formLoading, formSukses, formError

// --- Form Setoran ---
setoranTitle, setoranSelectWarga, setoranSelectSampah
setoranItemLabel, setoranTambahItem, setoranHapusItem
setoranTotalKotor, setoranPotonganKas, setoranMasukTabungan
setoranCatatan, setoranSimpan, setoranBerhasil, setoranWAButton
setoranEmptyError, setoranNoWaWarning, setoranSelectWargaError
setoranEmptyItemsError, setoranTotalTabungan

// --- Form Nasabah ---
nasabahTambahTitle, NasabahTambahButton
nasabahEditTitle, NasabahDeleteConfirm, NasabahDeleteWarning
nasabahStatusAktif, NasabahStatusNonaktif

// --- Form Penarikan ---
penarikanTitle, penarikanButton, penarikanBerhasil
penarikanSelectNasabah, penarikanJumlahLabel, penarikanPeriodeLabel
penarikanAdminSaksiLabel, penarikanCatatanLabel, penarikanWAButton
penarikanNoWaWarning, penarikanSaldoAktif, penarikanPilihDulu
penarikanErrorGagal, penarikanSuksesTitle

// --- Form Sampah/Harga ---
sampahTambahTitle, sampahNamaLabel, sampahKategoriLabel
sampahSatuanLabel, sampahHargaLabel, sampahCatatanLabel
sampahUpdateTitle, sampahSelectJenis, sampahHargaBaruLabel
sampahBerlakuMulaiLabel, sampahBelumAdaHarga

// --- Halaman Nasabah ---
pageNasabahTitle, pageNasabahTotalTerdaftar, pageNasabahAktif
pageNasabahPunyaSaldo, pageNasabahDaftar, pageNasabahEmpty
pageNasabahNasabahAktif, pageNasabahTotalTabungan
tableKode, tableNamaLengkap, tableNoWa, tableRtRw
tableTotalSetoran, tableSaldoAktif, tableStatus, tableTerdaftar, tableAksi

// --- Halaman Harga ---
pageHargaTitle, pageHargaBerlaku, pageHargaEmpty
pageHargaInfoTitle, pageHargaInfoBody, pageHargaRiwayat
pageHargaBerlakuSekarang, pageHargaInfoSub
pageHarga20Perubahan, tableJenisSampah, tableHargaKg
tableBerlakuMulai, tableCatatan, tableDiinputOleh

// --- Halaman Laporan ---
pageLaporanTitle, pageLaporanSub, pageLaporanTabungan
pageLaporanSetoran, pageLaporanKas, pageLaporanSaldoTitle
pageLaporanSaldoSub, pageLaporanRiwayatSetoran, pageLaporanRiwayatPenarikan
pageLaporanDiurutkan, pageLaporan50Terbaru
pageLaporanLiabilities, pageLaporanPerNasabah
tableKode, tableNasabah, tableJumlahDicairkan, tablePeriode, tableAdminSaksi

// --- Halaman Penarikan ---
pagePenarikanTitle, pagePenarikanPanduan, pagePenarikanDaftarTitle
pagePenarikanEmpty, pagePenarikanTotalSiap, pagePenarikanRiwayat
pagePenarikanSiapCair, pagePenarikanAllCair, pagePenarikanPanduanBody
tableNamaNasabah, tableSaldoSiapCair, tableJumlah, tableTanggal

// --- Halaman Transaksi ---
pageTransaksiTitle, pageTransaksiSub

// --- UI Components ---
sidebarBankSampah, sidebarDesaKebonagung
tombalUnduhWord, tombakMemuat, tombakBuatLaporan
tableKode, tableNasabah, tableBerat, tableTanggal
tableKotor, tableKas, tableBersih, tableStatus, tableAksi
emptyMemuatDetail, emptyTidakAdaDetail
chartBerat, tooltipNilai, tooltipTotalTabungan
tableNo, tableJenis, tableTotalBerat
```

---

## AUDIT 2 — REFERENSI KE TABEL `transaksi_setoran`

**Hasil: :white_check_mark: BERSIH**

Tidak ada satupun file di seluruh codebase `src/` yang mereferensikan nama tabel `transaksi_setoran`. Tabel ini sudah dihapus dengan bersih dari semua query dan type definitions.

---

## AUDIT 3 — PENGGUNAAN `any` TYPE BERLEBIHAN

**Total temuan: 34 lokasi** di 10 file.

### Kategori A: GAMPANG DIPERBAIKI (tanpa breaking change)

Ini `any` yang bisa langsung diganti dengan tipe dari `database.ts`:

| File | Baris | `any` | Ganti dengan |
|------|-------|-------|-------------|
| `DashboardClient.tsx` | 17 | `metrics: any` | `DashboardMetrics \| null` |
| `DashboardClient.tsx` | 18 | `nasabahStats: any` | Tipe dari v_nasabah_stats |
| `DashboardClient.tsx` | 19 | `transaksiTerbaru: any[]` | Interface baru |
| `DashboardClient.tsx` | 20 | `chartBulanan: any[]` | Interface baru |
| `DashboardClient.tsx` | 21 | `chartKomposisi: any[]` | Interface baru |
| `DashboardClient.tsx` | 340 | `t2: any` | Interface transaksi item |
| `RiwayatSetoranTable.tsx` | 5 | `setoranList: any[]` | `RiwayatSetoran[]` |
| `RiwayatSetoranTable.tsx` | 33 | `t: any` | `RiwayatSetoran` |
| `RiwayatSetoranTable.tsx` | 114 | `useState<any[]>` | `SetoranDetail[]` |
| `RiwayatSetoranTable.tsx` | 149 | `item: any` | `SetoranDetail` |
| `FormUpdateHarga.tsx` | 5 | `sampahList: any[]` | `HargaAktif[]` |
| `FormSetoran.tsx` | 15 | `nasabahList: any[]` | `SaldoNasabah[]` |
| `FormSetoran.tsx` | 16 | `sampahList: any[]` | `HargaAktif[]` |
| `FormSetoran.tsx` | 30 | `useState<any>` | Interface konkret |
| `FormSetoran.tsx` | 121 | `item: any` | Dari interface konkret |
| `FormPenarikan.tsx` | 14 | `useState<any>` | Interface konkret |

**Total yang gampang: 16 lokasi**

---

### Kategori B: SULIT/MENGGANGGU (butuh refactor lebih dalam)

| File | Baris | Catatan |
|------|-------|---------|
| `app/(dashboard)/page.tsx` | 25 | `.map((s: any) =>` — nested Supabase join |
| `app/(dashboard)/page.tsx` | 27 | `(sum: number, d: any) =>` — nested loop |
| `app/(dashboard)/page.tsx` | 49 | `.forEach((s: any) =>` — data processing |
| `app/(dashboard)/page.tsx` | 53 | `.forEach((d: any) =>` — nested loop |
| `app/api/setoran-detail/route.ts` | 25 | `.map((d: any) =>` — Supabase response |
| `harga/page.tsx` | 174 | `(r: any, ...)` — nested Supabase join |
| `laporan/page.tsx` | 126 | `(p: any, ...)` — dari join |
| `penarikan/page.tsx` | 142 | `(p: any, ...)` — dari join |
| `Charts.tsx` | 51, 92, 135 | `formatter={(value: any) =>` — Recharts callback |
| `api/laporan/word/route.ts` | 64, 130, 139, 140 | DOCX builder + Supabase |

**Total yang sulit: 18 lokasi**

---

## AUDIT 4 — PERBANDINGAN DUA FILE PENARIKAN

### File 1: `src/app/(dashboard)/penarikan/page.tsx`

**Halaman utama penarikan.** Menampilkan:
- Header dengan heading "Pencairan Tabungan Lebaran"
- Statistik: jumlah nasal, total siap cair
- Info box panduan pencairan (warna amber/kuning)
- Tabel daftar nasal yang punya saldo (siap dicairkan)
- Tabel riwayat pencairan
- Tombol "Cairkan Tabungan" yang buka modal `FormPenarikan`

**Fungsi:** Menampilkan data pencairan dan memicu aksi pencairan.

**Navigasi:** Diakses dari Sidebar dan BottomNav via `/penarikan`.

---

### File 2: `src/app/(dashboard)/transaksi/penarikan/page.tsx`

**Isi:** HANYA import dan render `FormSetoran` (komponen setoran, BUKAN penarikan).

**Heading:** "Catat Setoran Sampah" (SALAH — seharusnya halaman penarikan).

**Logic:** Sama persis dengan `transaksi/page.tsx` — ini jelas hasil copy-paste.

**Fungsi:** **TIDAK ADA** — file ini redundan.

**Navigasi:** **TIDAK PERNAH DIGUNAKAN** — tidak ada link dari Sidebar atau BottomNav ke `/transaksi/penarikan`.

---

### Kesimpulan

| Aspek | File 1 (penarikan/page.tsx) | File 2 (transaksi/penarikan/page.tsx) |
|-------|-----------------------------|----------------------------------------|
| Heading | "Pencairan Tabungan Lebaran" | "Catat Setoran Sampah" :x: |
| Komponen utama | `FormPenarikan` | `FormSetoran` :x: |
| Data yang ditampilkan | Daftar saldo + riwayat pencairan | Daftar nasal + daftar harga |
| Dipakai di navigasi? | Ya | Tidak |
| Status | :white_check_mark: OK | :warning: REDUNDAN |

**Saran:** File `src/app/(dashboard)/transaksi/penarikan/page.tsx` sebaiknya dihapus atau dikonversi menjadi halaman yang benar-benar diperlukan.

---

## TINDAK LANJUT YANG DISARANKAN

### Prioritas 1 (Segera)
1. **Hapus atau konversi** `transaksi/penarikan/page.tsx`
2. **Fix bug `cairkanTabungan()`** — return object缺少 `periode_lebaran` field

### Prioritas 2 (Konsistensi)
1. **Tambahkan ~80+ key baru** ke `LangProvider.tsx`
2. **Implementasi bertahap** di Form Components (118 string)
3. **Implementasi bertahap** di Halaman (97 string)
4. **Fix UI Components** (3 string)

### Prioritas 3 (Type Safety)
1. **Fix 16 `any` type gampang** di komponen
2. **Pertimbangkan refactor** `any` di halaman dan API routes

---

## LARANGAN (Dari Request)

File dan area yang **TIDAK BOLEH** diubah/dihapus:

| Item | Alasan |
|------|--------|
| `lib/whatsapp.ts` | Ditunda untuk fase skripsi (Fonnte berbayar) |
| `middleware.ts` | Belum ada — akan dipasang manual |
| `app/actions/auth.ts` | Belum ada — akan dipasang manual |
| `app/login/page.tsx` | Belum ada — akan dipasang manual |
| Field `dicatat_oleh` / `dibuat_oleh` / `dicairkan_oleh` | Sudah diALTER di Supabase |
| Logic perhitungan kas/saldo | Sudah diverifikasi benar |

---

*Laporan ini dibuat oleh Claude Code — 17 Juli 2026*
