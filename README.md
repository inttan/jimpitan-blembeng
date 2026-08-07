# Jimpitan Daven Blembeng

## 🌍 Overview
Sistem kas kegiatan dan jimpitan mingguan untuk kesejahteraan warga Daven Blembeng, Purwojadi. Aplikasi web-based yang membantu pengelolaan kas dusun secara transparan dan akuntabel.

---

## ✨ Fitur
- 🔐 **Autentikasi** - Login aman untuk Pengurus Daven
- 💰 **Kas Kegiatan** - Kelola kas masuk dan kas keluar dusun
- 👥 **Data Warga** - Manajemen warga Daven Blembeng
- 💵 **Jimpitan Mingguan** - Catat setoran jimpitan warga per minggu
- 👷 **Upah Penarik** - Kelola upah penarik jimpitan
- 📊 **Dashboard** - Ringkasan statistik dan progres setoran
- 📋 **Laporan** - Laporan kas kegiatan dalam format PDF
- 🌐 **Website Daven** - Halaman publik untuk warga

---

## 💰 Alur Jimpitan
1. Warga menyetor jimpitan mingguan (default Rp 3.500)
2. 95% masuk ke **Kas Kegiatan** dusun
3. 5% masuk ke **Upah Penarik**
4. Kas kegiatan digunakan untuk program kerja dusun
5. Transparansi penuh - warga bisa lihat laporan

---

## 🛠 Tech Stack
- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Deployment**: Vercel

---

## ⚙️ Instalasi

```bash
# Clone repository
git clone https://github.com/inttan/jimpitan-blembeng.git
cd jimpitan-blembeng

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan credentials Supabase

# Run development server
npm run dev
```

---

## 📁 Struktur Database

### Tabel Utama
- `warga` - Data warga Daven
- `penarik` - Data penarik jimpitan
- `jimpitan_transaksi` - Transaksi setoran jimpitan
- `kas_kegiatan` - Ledger kas masuk dan keluar
- `upah_penarik` - Upah penarik per periode
- `riwayat_perubahan` - Audit trail

### View
- `v_saldo_kas` - Saldo kas kegiatan real-time
- `v_belum_setor_minggu_ini` - Warga belum setor
- `v_upah_belum_dibayar` - Total upah belum dibayar

---

## 📍 Lokasi
Daven Blembeng, Purwojadi, Indonesia

---

## 📜 License
MIT License
