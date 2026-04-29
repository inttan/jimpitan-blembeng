import { formatRupiah } from "@/lib/utils";

export interface SetoranNotifPayload {
  namaНасabah: string; namaСampah: string; beratKg: number;
  nilaiKotor: number; potonganKas: number; nilaiBersih: number;
  saldoAktif: number; tanggal: string; noWa: string;
  periodeTabungan?: string;
}

export interface PenarikanNotifPayload {
  namaNasabah: string; jumlahDiterima: number; periodeLebaran: string;
  adminSaksi: string; noWa: string; sisaSaldo: number;
}

export function generateWASetoranLink(payload: SetoranNotifPayload): string {
  const { namaНасabah, namaСampah, beratKg, nilaiKotor, potonganKas, nilaiBersih, saldoAktif, tanggal, noWa, periodeTabungan } = payload;
  const periode = periodeTabungan ?? new Date().getFullYear().toString();
  const pesan = [
    `🌿 *BANK SAMPAH DESA KEBONAGUNG*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *BUKTI SETORAN SAMPAH*`,
    ``,
    `👤 Nasabah   : *${namaНасabah}*`,
    `📅 Tanggal   : ${tanggal}`,
    ``,
    `♻️ *DETAIL SAMPAH*`,
    `   Jenis     : ${namaСampah}`,
    `   Berat     : *${beratKg.toFixed(2)} kg*`,
    ``,
    `💰 *RINCIAN NILAI*`,
    `   Nilai Kotor    : ${formatRupiah(nilaiKotor)}`,
    `   Potongan Kas   : -${formatRupiah(potonganKas)} (10%)`,
    `   ─────────────────────`,
    `   Masuk Tabungan : *${formatRupiah(nilaiBersih)}*`,
    ``,
    `🏦 *TOTAL TABUNGAN LEBARAN ${periode.toUpperCase()}*`,
    `   *${formatRupiah(saldoAktif)}*`,
    ``,
    `_Tabungan dicairkan tunai menjelang Lebaran._`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `Terima kasih sudah menabung sampah! 🙏`,
  ].join("\n");
  const nomorBersih = noWa.replace(/\D/g, "");
  return `https://wa.me/${nomorBersih}?text=${encodeURIComponent(pesan)}`;
}

export function generateWAPenarikanLink(payload: PenarikanNotifPayload): string {
  const { namaNasabah, jumlahDiterima, periodeLebaran, adminSaksi, noWa, sisaSaldo } = payload;
  const tanggal = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const pesan = [
    `🎉 *BANK SAMPAH DESA KEBONAGUNG*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `💵 *PENCAIRAN TABUNGAN LEBARAN*`,
    ``,
    `👤 Nasabah   : *${namaNasabah}*`,
    `📅 Tanggal   : ${tanggal}`,
    `🕌 Periode   : ${periodeLebaran}`,
    ``,
    `💰 *NOMINAL DITERIMA*`,
    `   *${formatRupiah(jumlahDiterima)}*`,
    ``,
    `📊 Sisa Saldo : ${formatRupiah(sisaSaldo)}`,
    ``,
    `✅ Disaksikan oleh: *${adminSaksi}*`,
    ``,
    `_Simpan pesan ini sebagai bukti pencairan._`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `Selamat Hari Raya! Minal Aidin Wal Faizin 🌙`,
  ].join("\n");
  const nomorBersih = noWa.replace(/\D/g, "");
  return `https://wa.me/${nomorBersih}?text=${encodeURIComponent(pesan)}`;
}

export function kirimNotifWA(url: string): void {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}