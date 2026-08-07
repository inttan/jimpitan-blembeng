import { formatRupiah } from "@/lib/utils";
import { APP_NAME, formatPeriodeMinggu, hitungAlokasi, labelStatus } from "@/lib/jimpitan";
import type { StatusJimpitan } from "@/lib/jimpitan";

function normalisasiNoHp(no: string): string {
  let n = no.replace(/\D/g, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  if (!n.startsWith("62")) n = "62" + n;
  return n;
}

export interface JimpitanNotifPayload {
  namaWarga: string;
  noHp: string;
  mingguKe: string;
  jumlahSetor: number;
  status: StatusJimpitan;
  potonganKas?: number;
  danaKegiatan?: number;
}

export interface ReminderNotifPayload {
  namaWarga: string;
  noHp: string;
  mingguKe?: string;
  nominal?: number;
}

/** Notifikasi setelah setoran jimpitan dicatat */
export function generateWAJimpitanLink(payload: JimpitanNotifPayload): string {
  const {
    namaWarga, noHp, mingguKe, jumlahSetor, status,
  } = payload;

  const pesan = [
    `🏘️ *${APP_NAME.toUpperCase()}*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *BUKTI SETORAN JIMPITAN*`,
    ``,
    `👤 Warga     : *${namaWarga}*`,
    `📅 Periode   : ${formatPeriodeMinggu(mingguKe)}`,
    `📌 Status    : *${labelStatus(status)}*`,
    ``,
    `💰 Setoran   : *${formatRupiah(jumlahSetor)}*`,
    ``,
    `_(Simpan pesan ini sebagai bukti.)_`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `Terima kasih atas partisipasinya 🙏`,
  ].join("\n");

  return `https://wa.me/${normalisasiNoHp(noHp)}?text=${encodeURIComponent(pesan)}`;
}

/** Reminder warga yang belum setor minggu ini */
export function generateWAReminderLink(payload: ReminderNotifPayload): string {
  const { namaWarga, noHp, mingguKe, nominal = 3500 } = payload;
  const periode = mingguKe ? formatPeriodeMinggu(mingguKe) : "minggu ini";

  const pesan = [
    `🏘️ *${APP_NAME.toUpperCase()}*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `🔔 *PENGINGAT SETORAN JIMPITAN*`,
    ``,
    `Yth. Bapak/Ibu *${namaWarga}*,`,
    ``,
    `Mohon kesediaannya untuk menyetorkan jimpitan`,
    `periode *${periode}*.`,
    ``,
    `💵 Nominal standar: *${formatRupiah(nominal)}*`,
    ``,
    `Terima kasih atas kerja samanya 🙏`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `_Pengurus ${APP_NAME}_`,
  ].join("\n");

  return `https://wa.me/${normalisasiNoHp(noHp)}?text=${encodeURIComponent(pesan)}`;
}

/** Notifikasi pengeluaran kas kegiatan */
export function generateWAKasKeluarLink(payload: {
  noHp: string;
  jumlah: number;
  keterangan: string;
  disetujuiOleh: string;
  saldoAkhir?: number;
}): string {
  const { noHp, jumlah, keterangan, disetujuiOleh, saldoAkhir } = payload;
  const tanggal = new Date().toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });

  const pesan = [
    `🏘️ *${APP_NAME.toUpperCase()}*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `📤 *PENGELUARAN KAS KEGIATAN*`,
    ``,
    `📅 Tanggal   : ${tanggal}`,
    `💰 Jumlah    : *${formatRupiah(jumlah)}*`,
    `📝 Keterangan: ${keterangan}`,
    `✅ Disetujui : ${disetujuiOleh}`,
    saldoAkhir != null ? `\n🏦 Saldo kas : ${formatRupiah(saldoAkhir)}` : "",
    ``,
    `_Pencatatan transparan untuk warga dusun._`,
  ].filter(Boolean).join("\n");

  return `https://wa.me/${normalisasiNoHp(noHp)}?text=${encodeURIComponent(pesan)}`;
}

export function kirimNotifWA(url: string): void {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
