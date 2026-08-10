/** Konstanta & helper Jimpitan Dusun Blembeng */

export const APP_NAME = "Jimpitan Dusun Blembeng";
export const DUSUN_NAME = "Blembeng";

/** Nominal standar jimpitan per KK per minggu (Rp) */
export const NOMINAL_STANDAR = 5000;

export type StatusJimpitan = "lunas" | "belum" | "nihil";

/**
 * Awal minggu (Senin) dalam timezone lokal — cocok dengan
 * Postgres date_trunc('week', ...) yang memakai ISO week (Senin).
 */
export function getMingguKe(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Min … 6=Sab
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return toDateString(d);
}

/** Akhir minggu (Minggu) dari tanggal Senin minggu_ke */
export function getAkhirMinggu(mingguKe: string): string {
  const d = new Date(mingguKe + "T00:00:00");
  d.setDate(d.getDate() + 6);
  return toDateString(d);
}

export function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function labelStatus(status: StatusJimpitan): string {
  if (status === "lunas") return "Lunas";
  if (status === "belum") return "Belum";
  return "Nihil";
}

export function formatPeriodeMinggu(mingguKe: string): string {
  const mulai = new Date(mingguKe + "T00:00:00");
  const selesai = new Date(mingguKe + "T00:00:00");
  selesai.setDate(selesai.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  return `${fmt(mulai)} – ${fmt(selesai)}`;
}
