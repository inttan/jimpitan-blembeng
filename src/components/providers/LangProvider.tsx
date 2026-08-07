"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "id" | "en";

export const translations = {
  id: {
    dashboard: "Dashboard",
    warga: "Data Warga",
    setoran: "Catat Setor",
    kas: "Kas & Upah",
    laporan: "Laporan",
    panduan: "Panduan",
    panduanText: "Catat jimpitan → 5% upah penarik · 95% kas kegiatan.",
    admin: "Admin",
    greetTitle: "Selamat datang",
    greetSub: "Ringkasan Jimpitan Dusun Blembeng.",
    btnCatat: "Catat Jimpitan",
    kpi1Label: "Saldo Kas Kegiatan",
    kpi1Sub: "Real-time dari ledger kas",
    kpi2Label: "Belum Setor Minggu Ini",
    kpi2Sub: "Warga aktif yang belum lunas",
    kpi3Label: "Upah Belum Dibayar",
    kpi3Sub: "Total kewajiban ke penarik",
    kpi4Label: "Warga Aktif",
    statTxnLabel: "Setoran Lunas Minggu Ini",
    statTxnSub: "transaksi lunas",
    statAvgLabel: "Total Masuk Minggu Ini",
    statAvgSub: "dana kegiatan + upah",
    chart1Title: "Tren Kas per Bulan",
    chart1Sub: "6 bulan terakhir · pemasukan kas kegiatan dari jimpitan",
    chart2Title: "Masuk vs Keluar Kas",
    chart2Sub: "Agregat kas kegiatan",
    chart3Title: "Akumulasi Kas Kegiatan",
    chart3Sub: "Pertumbuhan saldo kas 6 bulan terakhir",
    emptyChart: "Belum ada data tren",
    emptyPie: "Belum ada data",
    emptyAcc: "Belum ada akumulasi kas.",
    txnTitle: "Transaksi Terbaru",
    txnSeeAll: "Lihat semua",
    txnEmpty: "Belum ada transaksi jimpitan.",
    txnEmptyBtn: "+ Catat Jimpitan Pertama",
    txnColNasabah: "Warga",
    txnColJenis: "Status",
    txnColBerat: "Upah 5%",
    txnColNilai: "Kas 95%",
    txnColTgl: "Minggu",
    lebaranTitle: "Warga Belum Setor Minggu Ini",
    lebaranBtn: "Lihat & Kirim WA →",
    totalNasabah: "dari {n} total terdaftar",
  },
  en: {
    dashboard: "Dashboard",
    warga: "Residents",
    setoran: "Record",
    kas: "Fund & Wages",
    laporan: "Reports",
    panduan: "Guide",
    panduanText: "Record jimpitan → 5% collector · 95% village fund.",
    admin: "Admin",
    greetTitle: "Welcome",
    greetSub: "Jimpitan Dusun Blembeng summary.",
    btnCatat: "Record Jimpitan",
    kpi1Label: "Village Fund Balance",
    kpi1Sub: "Real-time from cash ledger",
    kpi2Label: "Unpaid This Week",
    kpi2Sub: "Active residents not yet paid",
    kpi3Label: "Unpaid Collector Wages",
    kpi3Sub: "Total owed to collectors",
    kpi4Label: "Active Residents",
    statTxnLabel: "Paid This Week",
    statTxnSub: "paid transactions",
    statAvgLabel: "Total In This Week",
    statAvgSub: "activity fund + wages",
    chart1Title: "Monthly Cash Trend",
    chart1Sub: "Last 6 months · jimpitan fund inflows",
    chart2Title: "In vs Out",
    chart2Sub: "Village fund aggregate",
    chart3Title: "Fund Accumulation",
    chart3Sub: "Fund balance growth over 6 months",
    emptyChart: "No trend data yet",
    emptyPie: "No data yet",
    emptyAcc: "No fund accumulated yet.",
    txnTitle: "Recent Transactions",
    txnSeeAll: "View all →",
    txnEmpty: "No jimpitan transactions yet.",
    txnEmptyBtn: "+ Record First Jimpitan",
    txnColNasabah: "Resident",
    txnColJenis: "Status",
    txnColBerat: "Wage 5%",
    txnColNilai: "Fund 95%",
    txnColTgl: "Week",
    lebaranTitle: "Unpaid Residents This Week",
    lebaranBtn: "View & Send WA →",
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
