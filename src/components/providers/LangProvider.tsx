"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "id" | "en";

export const translations = {
  id: {
    /* sidebar */
    dashboard: "Dashboard", nasabah: "Data Nasabah",
    setoran: "Catat Setoran", harga: "Harga Sampah",
    penarikan: "Pencairan Lebaran", laporan: "Laporan",
    panduan: "Panduan",
    panduanText: "Input setoran → Kirim notif WA → Saldo terupdate otomatis.",
    /* topbar */
    admin: "Admin",
    /* dashboard page */
    greetTitle: "Selamat datang, Admin",
    greetSub: "Ringkasan Bank Sampah Desa Kebonagung hari ini.",
    btnCatat: " Catat Setoran",
    kpi1Label: "Total Tabungan Warga", kpi1Sub: "Wajib disiapkan saat lebaran",
    kpi2Label: "Kas Operasional", kpi2Sub: "Terkumpul dari potongan 10%",
    kpi3Label: "Total Sampah Masuk", kpi3Sub: "Semua kategori terverifikasi",
    kpi4Label: "Nasabah Aktif",
    statTxnLabel: "Transaksi Hari Ini", statTxnSub: "setoran masuk",
    statAvgLabel: "Rata-rata Setoran", statAvgSub: "per transaksi (bersih)",
    chart1Title: "Nilai Setoran Bulanan",
    chart1Sub: "6 bulan terakhir · nilai bersih setelah potongan kas",
    chart2Title: "Komposisi Sampah",
    chart2Sub: "Berdasarkan berat (kg)",
    chart3Title: "Akumulasi Tabungan Lebaran",
    chart3Sub: "Pertumbuhan total tabungan warga 6 bulan terakhir",
    emptyChart: "Belum ada data transaksi",
    emptyPie: "Belum ada data",
    emptyAcc: "Belum ada akumulasi tabungan.",
    txnTitle: "Setoran Terbaru",
    txnSeeAll: "Lihat semua",
    txnEmpty: "Belum ada transaksi.",
    txnEmptyBtn: "+ Catat Setoran Pertama",
    txnColNasabah: "Nasabah", txnColJenis: "Jenis Sampah",
    txnColBerat: "Berat", txnColNilai: "Nilai Bersih", txnColTgl: "Tanggal",
    lebaranTitle: "Persiapan Pencairan Lebaran",
    lebaranBtn: "Kelola Pencairan →",
    totalNasabah: "dari {n} total terdaftar",
  },
  en: {
    dashboard: "Dashboard", nasabah: "Members",
    setoran: "Record Deposit", harga: "Waste Prices",
    penarikan: "Eid Withdrawal", laporan: "Reports",
    panduan: "Guide",
    panduanText: "Record deposit → Send WA notification → Balance auto-updates.",
    admin: "Admin",
    greetTitle: "Welcome, Admin",
    greetSub: "Today's summary for Kebonagung Village Waste Bank.",
    btnCatat: "+ Record Deposit",
    kpi1Label: "Total Member Savings", kpi1Sub: "Must be prepared for Eid",
    kpi2Label: "Operational Fund", kpi2Sub: "Collected from 10% deduction",
    kpi3Label: "Total Waste In", kpi3Sub: "All verified categories",
    kpi4Label: "Active Members",
    statTxnLabel: "Today's Transactions", statTxnSub: "deposits in",
    statAvgLabel: "Average Deposit", statAvgSub: "per transaction (net)",
    chart1Title: "Monthly Deposit Value",
    chart1Sub: "Last 6 months · net value after operational deduction",
    chart2Title: "Waste Composition",
    chart2Sub: "Based on weight (kg)",
    chart3Title: "Eid Savings Accumulation",
    chart3Sub: "Total member savings growth over last 6 months",
    emptyChart: "No transaction data yet",
    emptyPie: "No data yet",
    emptyAcc: "No savings accumulated yet.",
    txnTitle: "Recent Deposits",
    txnSeeAll: "View all →",
    txnEmpty: "No transactions yet.",
    txnEmptyBtn: "+ Record First Deposit",
    txnColNasabah: "Member", txnColJenis: "Waste Type",
    txnColBerat: "Weight", txnColNilai: "Net Value", txnColTgl: "Date",
    lebaranTitle: "Eid Disbursement Preparation",
    lebaranBtn: "Manage Disbursement →",
    totalNasabah: "of {n} total registered",
  },
};

export type TKeys = keyof typeof translations.id;

type Ctx = { lang: Lang; t: typeof translations.id; setLang: (l: Lang) => void };
const LangCtx = createContext<Ctx>({ lang: "id", t: translations.id, setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("id");
  return (
    <LangCtx.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LangCtx.Provider>
  );
}

export const useLang = () => useContext(LangCtx);