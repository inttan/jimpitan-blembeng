import { formatRupiah } from "@/lib/utils";

// ── Tipe ──────────────────────────────────────────────────────────────
export interface ItemSetoranNotif {
  nama_sampah: string;
  berat_kg: number;
  nilai_kotor: number;
  potongan_kas: number;
  nilai_bersih: number;
}

export interface SetoranNotifPayload {
  namaNasabah: string;
  items: ItemSetoranNotif[];         // ← ganti dari single field
  totalKotor: number;
  totalPotongan: number;
  totalBersih: number;
  saldoAktif: number;
  tanggal: string;
  noWa: string;
  periodeTabungan?: string;
}

export interface PenarikanNotifPayload {
  namaNasabah: string;
  jumlahDiterima: number;
  periodeLebaran: string;
  adminSaksi: string;
  noWa: string;
  sisaSaldo: number;
}

// ── Generate WA Setoran ───────────────────────────────────────────────
export function generateWASetoranLink(payload: SetoranNotifPayload): string {
  const {
    namaNasabah, items, totalKotor, totalPotongan,
    totalBersih, saldoAktif, tanggal, noWa, periodeTabungan,
  } = payload;

  const periode = periodeTabungan ?? new Date().getFullYear().toString();

  // Baris detail tiap jenis sampah
  const detailSampah = items.map((item, idx) =>
    [
      `   ${idx + 1}. ${item.nama_sampah}`,
      `      Berat  : ${item.berat_kg.toFixed(2)} kg`,
      `      Nilai  : ${formatRupiah(item.nilai_bersih)}`,
    ].join("\n")
  ).join("\n");

  const pesan = [
    `🌿 *BANK SAMPAH DESA KEBONAGUNG*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *BUKTI SETORAN SAMPAH*`,
    ``,
    `👤 Nasabah   : *${namaNasabah}*`,
    `📅 Tanggal   : ${tanggal}`,
    ``,
    `♻️ *DETAIL SAMPAH*`,
    detailSampah,
    ``,
    `💰 *RINCIAN NILAI*`,
    `   Nilai Kotor    : ${formatRupiah(totalKotor)}`,
    `   Potongan Kas   : -${formatRupiah(totalPotongan)} (10%)`,
    `   ─────────────────────`,
    `   Masuk Tabungan : *${formatRupiah(totalBersih)}*`,
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

// ── Generate WA Penarikan (tidak berubah) ────────────────────────────
export function generateWAPenarikanLink(payload: PenarikanNotifPayload): string {
  const { namaNasabah, jumlahDiterima, periodeLebaran, adminSaksi, noWa, sisaSaldo } = payload;
  const tanggal = new Date().toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
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