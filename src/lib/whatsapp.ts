import { formatRupiah } from "@/lib/utils";
import { APP_NAME, formatPeriodeMinggu, labelStatus } from "@/lib/jimpitan";
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
    `Yth. Bapak/Ibu ${namaWarga}`,
    ``,
    `Setoran jimpitan untuk periode ${formatPeriodeMinggu(mingguKe)} telah kami terima.`,
    ``,
    `Nominal: ${formatRupiah(jumlahSetor)}`,
    `Status: ${labelStatus(status)}`,
    ``,
    `Terima kasih.`,
    `${APP_NAME}`,
  ].join("\n");

  return `https://wa.me/${normalisasiNoHp(noHp)}?text=${encodeURIComponent(pesan)}`;
}

/** Reminder warga yang belum setor minggu ini */
export function generateWAReminderLink(payload: ReminderNotifPayload): string {
  const { namaWarga, noHp, mingguKe, nominal = 5000 } = payload;
  const periode = mingguKe ? formatPeriodeMinggu(mingguKe) : "minggu ini";

  const pesan = [
    `Yth. Bapak/Ibu ${namaWarga}`,
    ``,
    `Mohon kesediaannya untuk menyetorkan jimpitan periode ${periode}.`,
    `Nominal: ${formatRupiah(nominal)}`,
    ``,
    `Terima kasih.`,
    `${APP_NAME}`,
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
    `Yth. Warga ${APP_NAME}`,
    ``,
    `Pengeluaran kas kegiatan:`,
    ``,
    `Tanggal: ${tanggal}`,
    `Jumlah: ${formatRupiah(jumlah)}`,
    `Keterangan: ${keterangan}`,
    `Disetujui oleh: ${disetujuiOleh}`,
    saldoAkhir != null ? `Saldo kas: ${formatRupiah(saldoAkhir)}` : "",
  ].filter(Boolean).join("\n");

  return `https://wa.me/${normalisasiNoHp(noHp)}?text=${encodeURIComponent(pesan)}`;
}

export function kirimNotifWA(url: string): void {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
