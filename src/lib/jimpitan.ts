/** Konstanta & helper Jimpitan Dusun Blembeng */

export const APP_NAME = "Jimpitan Dusun Blembeng";
export const DUSUN_NAME = "Blembeng";

/** Nominal standar jimpitan per KK per minggu (Rp) */
export const NOMINAL_STANDAR = 5000;

/** Upah per penarik per minggu (Rp) - total 2 penarik = 50.000 */
export const UPAH_PER_PENARIK_PER_MINGGU = 25000;
export const UPAH_TOTAL_2_PENARIK = 50000; // 2 penarik × 25.000

/** 95% masuk kas kegiatan desa */
export const PERSENTASE_KAS = 0.95;

export type StatusJimpitan = "lunas" | "belum" | "nihil";

/** Hitung potongan & dana kegiatan (mirror generated columns di DB) */
export function hitungAlokasi(jumlahSetor: number) {
  const dana_kegiatan = Math.round(jumlahSetor * PERSENTASE_KAS * 100) / 100;
  // Potongan dari upah penarik (fixed Rp 50.000/minggu/orang)
  const { per_orang } = hitungUpahPenarik(1);
  const potongan_kas = per_orang;
  return { potongan_kas, dana_kegiatan };
}

/** Hitung total upah penarik per minggu berdasarkan jumlah penarik */
export function hitungUpahPenarik(jumlahPenarik: number = 1) {
  const total_upah = UPAH_PER_PENARIK_PER_MINGGU * jumlahPenarik;
  return { total_upah, per_orang: UPAH_PER_PENARIK_PER_MINGGU };
}

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
