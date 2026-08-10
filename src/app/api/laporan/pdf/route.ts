import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { APP_NAME } from "@/lib/jimpitan";

function rp(n: number) {
  return Math.round(n).toLocaleString("id-ID");
}

function fmtDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = dateStr.length === 10 ? new Date(dateStr + "T00:00:00") : new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function fmtDateShort(dateStr: string) {
  if (!dateStr) return "-";
  const d = dateStr.length === 10 ? new Date(dateStr + "T00:00:00") : new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function fmtJam(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

// ── Header Surat ──────────────────────────────
function buatHeader(doc: jsPDF, judul: string, sub: string, tgl: string) {
  const W = doc.internal.pageSize.getWidth();
  let y = 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(139, 90, 43);
  doc.text(APP_NAME.toUpperCase(), W / 2, y, { align: "center" });

  y += 8;

  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text(judul, W / 2, y, { align: "center" });

  if (sub) {
    y += 6;
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(sub, W / 2, y, { align: "center" });
  }

  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  doc.text("Dicetak: " + tgl, W / 2, y, { align: "center" });

  y += 6;
  doc.setDrawColor(139, 90, 43);
  doc.setLineWidth(1);
  doc.line(14, y, W - 14, y);
  y += 12;
  doc.setTextColor(0, 0, 0);

  return y;
}

// ── Tabel Generic ──────────────────────────────
// PERBAIKAN: tambah param `colAligns` supaya kolom angka bisa rata kanan
// (sebelumnya semua kolom rata kiri, bikin kolom "Jumlah" kurang rapi dibaca).
// Lebar kolom (colWidths) juga sudah disesuaikan di tiap pemanggilan di bawah
// supaya header ("Jam", "RT", dll) tidak lagi terpotong jadi 2 baris.
function tbl(
  doc: jsPDF,
  headers: string[],
  rows: string[][],
  colWidths: number[],
  y: number,
  opts?: {
    headerColor?: [number, number, number];
    marginBottom?: number;
    colAligns?: ("left" | "center" | "right")[];
  }
): number {
  const H = doc.internal.pageSize.getHeight();
  if (y > H - 50) {
    doc.addPage();
    y = 20;
  }

  const marginBottom = opts?.marginBottom ?? 15;
  const aligns = opts?.colAligns;

  autoTable(doc, {
    startY: y,
    head: [headers],
    body: rows.length ? rows : [["-".repeat(50)]],
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 4, right: 3.5, bottom: 4, left: 3.5 },
      font: "helvetica",
      valign: "middle",
      lineColor: [225, 225, 225],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: opts?.headerColor ?? [58, 52, 43],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "left",
      cellPadding: { top: 4.5, right: 3.5, bottom: 4.5, left: 3.5 },
      // minCellHeight memastikan header selalu satu baris penuh tingginya
      // konsisten walau isi teksnya pendek (mis. "RT", "Jam")
      minCellHeight: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [35, 35, 35],
    },
    alternateRowStyles: {
      fillColor: [249, 247, 243],
    },
    margin: { left: 14, right: 14 },
    tableLineColor: [210, 205, 195],
    tableLineWidth: 0.1,
    columnStyles: Object.fromEntries(
      colWidths.map((w, i) => [
        i,
        {
          cellWidth: w,
          halign: aligns?.[i] ?? "left",
        },
      ])
    ) as Record<number, { cellWidth: number; halign: "left" | "center" | "right" }>,
  });

  return (doc as any).lastAutoTable.finalY + marginBottom;
}

// ── Ringkasan Box ──────────────────────────────
function ringkasanBox(
  doc: jsPDF,
  items: { label: string; value: string; highlight?: boolean }[],
  y: number
): number {
  const W = doc.internal.pageSize.getWidth();
  const boxWidth = W - 28;

  const rowHeight = 8;
  const padding = 5;

  if (y > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage();
    y = 20;
  }

  const startY = y;
  const boxHeight = padding * 2 + items.length * rowHeight + 4;

  // Latar belakang lembut supaya box lebih menonjol dari halaman putih
  doc.setFillColor(250, 247, 241);
  doc.rect(14, y, boxWidth, boxHeight, "F");

  doc.setDrawColor(139, 90, 43);
  doc.setLineWidth(0.5);
  doc.rect(14, y, boxWidth, boxHeight);

  y += padding;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(139, 90, 43);
  doc.text("RINGKASAN", 18, y);

  items.forEach((item) => {
    y += rowHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(item.label, 18, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(item.highlight ? 10 : 9);
    doc.setTextColor(item.highlight ? 139 : 30, item.highlight ? 90 : 30, item.highlight ? 43 : 30);
    // Rata kanan supaya nominal sejajar rapi, bukan menggantung di tengah
    doc.text(item.value, 14 + boxWidth - 6, y, { align: "right" });
  });

  return startY + boxHeight + 12;
}

// ── Section Title ──────────────────────────────
function sectionTitle(doc: jsPDF, title: string, y: number): number {
  const H = doc.internal.pageSize.getHeight();
  if (y > H - 55) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(139, 90, 43);
  doc.text(title.toUpperCase(), 14, y);
  y += 2;
  doc.setDrawColor(139, 90, 43);
  doc.setLineWidth(0.5);
  doc.line(14, y, 90, y);
  y += 8;
  doc.setTextColor(0, 0, 0);

  return y;
}

// ── TTD ──────────────────────────────
function buatTtd(doc: jsPDF, tgl: string) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const ttdY = H - 35;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("Blembeng, " + tgl, W - 14, ttdY, { align: "right" });
  doc.text("Pengurus Jimpitan,", W - 14, ttdY + 12, { align: "right" });
  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  doc.text("(________________________)", W - 14, ttdY + 25, { align: "right" });
}

// ════════════════════════════════════════════════════════
// RIWAYAT PDF - SATU TABEL KOMPLIT
// ════════════════════════════════════════════════════════
function riwayatPdf(riwayat: any[], tx: any[], kas: any[], warga: any[], penarik: any[], periode: string, tgl: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = buatHeader(doc, "BUKU RIWAYAT", "Periode: " + periode, tgl);

  const txMap = new Map(tx.map((t: any) => [t.id, t]));
  const wargaMap = new Map(warga.map((w: any) => [w.id, w]));
  const penarikMap = new Map(penarik.map((p: any) => [p.id, p]));

  const baris: string[][] = [];

  // Setoran lunas
  tx.filter((t: any) => t.status === "lunas").forEach((t: any) => {
    const w = wargaMap.get(t.warga_id);
    const p = t.penarik_id ? penarikMap.get(t.penarik_id) : null;
    baris.push([
      fmtDateShort(t.minggu_ke),
      fmtJam(t.created_at),
      "SETORAN",
      w?.nama ?? "-",
      w?.no_rumah ?? "-",
      "Rp " + rp(Number(t.jumlah_setor ?? 0)),
      "-",
      p?.nama ?? "-",
    ]);
  });

  // Kas masuk (dari setoran + manual)
  kas.filter((k: any) => k.jenis === "masuk").forEach((k: any) => {
    const txRef = k.transaksi_ref ? txMap.get(k.transaksi_ref) : null;
    const w = txRef?.warga_id ? wargaMap.get(txRef.warga_id) : null;
    baris.push([
      fmtDateShort(k.tanggal),
      fmtJam(k.created_at),
      "KAS MASUK",
      w?.nama ?? k.keterangan ?? "-",
      w?.no_rumah ?? "-",
      "Rp " + rp(Number(k.jumlah ?? 0)),
      k.transaksi_ref ? "Setoran" : "Manual",
      k.disetujui_oleh ?? "-",
    ]);
  });

  // Kas keluar
  kas.filter((k: any) => k.jenis === "keluar").forEach((k: any) => {
    baris.push([
      fmtDateShort(k.tanggal),
      fmtJam(k.created_at),
      "KAS KELUAR",
      k.nama_penarik ?? "-",
      "-",
      "Rp " + rp(Number(k.jumlah ?? 0)),
      k.keterangan ?? "-",
      k.disetujui_oleh ?? "-",
    ]);
  });

  // Edit warga
  riwayat.filter((r: any) => r.tabel === "warga").forEach((r: any) => {
    const baru = r.data_baru ?? {};
    const lama = r.data_lama ?? {};
    let aksi = r.aksi.toUpperCase();
    let detail = "-";

    if (r.aksi === "insert") {
      aksi = "TAMBAH WARGA";
      detail = `Nama: ${baru.nama ?? "-"} | RT: ${baru.no_rumah ?? "-"} | HP: ${baru.no_hp ?? "-"}`;
    } else if (r.aksi === "update") {
      if (baru.status_aktif === false) {
        aksi = "NONAKTIF";
        detail = baru.nama ?? lama?.nama ?? "-";
      } else if (baru.status_aktif === true && lama?.status_aktif === false) {
        aksi = "AKTIFKAN";
        detail = baru.nama ?? lama?.nama ?? "-";
      } else {
        aksi = "EDIT WARGA";
        const perubahan: string[] = [];
        if (lama?.nama !== baru?.nama) perubahan.push(`Nama: "${lama?.nama}" → "${baru?.nama}"`);
        if (lama?.no_rumah !== baru?.no_rumah) perubahan.push(`RT: "${lama?.no_rumah}" → "${baru?.no_rumah}"`);
        if (lama?.no_hp !== baru?.no_hp) perubahan.push(`HP: "${lama?.no_hp}" → "${baru?.no_hp}"`);
        detail = perubahan.length > 0 ? perubahan.join(" | ") : "-";
      }
    } else if (r.aksi === "delete") {
      aksi = "HAPUS WARGA";
      detail = `${lama?.nama ?? "-"} | RT: ${lama?.no_rumah ?? "-"}`;
    }

    baris.push([
      fmtDateShort(r.created_at),
      fmtJam(r.created_at),
      aksi,
      detail,
      "-",
      "-",
      baru.status_aktif === false ? "Nonaktif" : baru.nama ? "Aktif" : lama?.nama ? "Nonaktif" : "-",
      r.diubah_oleh ?? "-",
    ]);
  });

  // Sort by date descending
  baris.sort((a: string[], b: string[]) => {
    const da = new Date(a[0] + " " + a[1]);
    const db = new Date(b[0] + " " + b[1]);
    return db.getTime() - da.getTime();
  });

  // PERBAIKAN LEBAR KOLOM:
  // Sebelumnya [20,12,22,48,8,26,24,20]=180mm — kolom "Jam"(12) dan "RT"(8)
  // terlalu sempit sehingga header-nya terpotong jadi 2 baris ("Ja/m", "R/T").
  // Sekarang total disesuaikan ke 182mm (lebar efektif A4 portrait: 210-14-14),
  // dengan "Jam" dan "RT" dilebarkan secukupnya, dan "Detail" sedikit
  // dipersempit untuk mengimbangi. Kolom "Jumlah" dibuat rata kanan.
  y = tbl(doc,
    ["Tanggal", "Jam", "Kategori", "Detail", "RT", "Jumlah", "Ket.", "Oleh"],
    baris,
    [22, 15, 22, 44, 11, 27, 21, 20],
    y,
    { colAligns: ["left", "center", "left", "left", "center", "right", "left", "left"] }
  );

  buatTtd(doc, tgl);
  return doc;
}

// ════════════════════════════════════════════════════════
// LAPORAN PDF - SETORAN + KAS MASUK DIGABUNG
// ════════════════════════════════════════════════════════
function laporanPdf(tx: any[], kas: any[], saldo: number, periode: string, tgl: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = buatHeader(doc, "LAPORAN KAS", "Periode: " + periode, tgl);

  // Ringkasan
  const totSetor = tx.filter((t: any) => t.status === "lunas").reduce((s: number, t: any) => s + Number(t.jumlah_setor ?? 0), 0);
  const totMskKas = kas.filter((k: any) => k.jenis === "masuk").reduce((s: number, k: any) => s + Number(k.jumlah ?? 0), 0);
  const totKlir = kas.filter((k: any) => k.jenis === "keluar").reduce((s: number, k: any) => s + Number(k.jumlah ?? 0), 0);

  y = ringkasanBox(doc, [
    { label: "Total Setoran", value: "Rp " + rp(totSetor) },
    { label: "Total Kas Masuk", value: "Rp " + rp(totMskKas) },
    { label: "Total Kas Keluar", value: "Rp " + rp(totKlir) },
    { label: "Saldo Kas", value: "Rp " + rp(saldo), highlight: true },
  ], y);

  // ── PEMASUKAN (Setoran + Kas Masuk) ─────────────────────
  y = sectionTitle(doc, "Pemasukan", y);

  const txMap = new Map(tx.map((t: any) => [t.id, t]));
  const wargaMap = new Map(tx.filter((t: any) => t.warga).map((t: any) => [t.warga_id, t.warga]));

  const rowsPemasukan: string[][] = [];

  // Setoran lunas
  tx.filter((t: any) => t.status === "lunas").forEach((t: any) => {
    rowsPemasukan.push([
      fmtDateShort(t.minggu_ke),
      t.minggu_ke,
      t.warga?.nama ?? "-",
      t.warga?.no_rumah ?? "-",
      "Setoran",
      "Rp " + rp(Number(t.jumlah_setor ?? 0)),
    ]);
  });

  // Kas masuk manual
  kas.filter((k: any) => k.jenis === "masuk" && !k.transaksi_ref).forEach((k: any) => {
    rowsPemasukan.push([
      fmtDateShort(k.tanggal),
      "-",
      k.keterangan ?? "Kas Masuk",
      "-",
      "Manual",
      "Rp " + rp(Number(k.jumlah ?? 0)),
    ]);
  });

  // Sort by date desc
  rowsPemasukan.sort((a: string[], b: string[]) => {
    const da = new Date(a[0]);
    const db = new Date(b[0]);
    return db.getTime() - da.getTime();
  });

  // PERBAIKAN: kolom "RT" dilebarkan sedikit (10→12) dan "Jumlah" rata kanan
  y = tbl(doc,
    ["Tanggal", "Minggu Ke", "Nama / Keterangan", "RT", "Jenis", "Jumlah"],
    rowsPemasukan,
    [24, 26, 56, 12, 18, 28],
    y,
    { colAligns: ["left", "left", "left", "center", "center", "right"] }
  );

  // ── PENGELUARAN ───────────────────────────────────────────
  const rowsKlir = kas.filter((k: any) => k.jenis === "keluar").map((k: any) => [
    fmtDateShort(k.tanggal),
    k.nama_penarik ?? "-",
    k.keterangan ?? "-",
    "Rp " + rp(Number(k.jumlah ?? 0)),
    k.disetujui_oleh ?? "-",
  ]);

  if (rowsKlir.length > 0) {
    y = sectionTitle(doc, "Pengeluaran", y);

    y = tbl(doc,
      ["Tanggal", "Penarik", "Keperluan", "Jumlah", "Disetujui"],
      rowsKlir,
      [26, 42, 56, 30, 26],
      y,
      { headerColor: [161, 61, 61], colAligns: ["left", "left", "left", "right", "left"] }
    );
  }

  buatTtd(doc, tgl);
  return doc;
}

// ════════════════════════════════════════════════════════
// GET HANDLER
// ════════════════════════════════════════════════════════
export async function GET(req: Request) {
  try {
    const sb = await createClient();
    const p = new URL(req.url).searchParams;
    const type = p.get("type") ?? "riwayat";
    const dari = p.get("dari");
    const sampai = p.get("sampai");
    const bulan = p.get("bulan");
    const tahun = p.get("tahun") ?? String(new Date().getFullYear());
    const tgl = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    // ── RIWAYAT ──────────────────────────────────────────────
    if (type === "riwayat") {
      let riwayatQuery = sb.from("riwayat_perubahan").select("*").order("created_at", { ascending: false }).limit(2000);
      if (dari) riwayatQuery = riwayatQuery.gte("created_at", dari + "T00:00:00");
      if (sampai) riwayatQuery = riwayatQuery.lte("created_at", sampai + "T23:59:59");

      const [txR, kasR, wargaR, penarikR, riwayatR] = await Promise.all([
        sb.from("jimpitan_transaksi").select("*, warga:warga_id (id, nama, no_rumah)").order("created_at", { ascending: false }).limit(2000),
        sb.from("kas_kegiatan").select("*").order("created_at", { ascending: false }).limit(2000),
        sb.from("warga").select("*").order("created_at", { ascending: false }).limit(2000),
        sb.from("penarik").select("*").order("created_at", { ascending: false }).limit(2000),
        riwayatQuery,
      ]);

      const txData = (txR.data ?? []).filter((t: any) => {
        if (dari && t.created_at < dari + "T00:00:00") return false;
        if (sampai && t.created_at > sampai + "T23:59:59") return false;
        return true;
      });

      const kasData = (kasR.data ?? []).filter((k: any) => {
        if (dari && k.created_at < dari + "T00:00:00") return false;
        if (sampai && k.created_at > sampai + "T23:59:59") return false;
        return true;
      });

      const dateLabel = dari && sampai
        ? `${fmtDate(dari)} s/d ${fmtDate(sampai)}`
        : dari ? `dari ${fmtDate(dari)}` : sampai ? `sampai ${fmtDate(sampai)}` : "Semua Periode";

      const doc = riwayatPdf(
        riwayatR.data ?? [],
        txData,
        kasData,
        wargaR.data ?? [],
        penarikR.data ?? [],
        dateLabel,
        tgl
      );

      const fn = `Buku_Riwayat_${new Date().toISOString().slice(0, 10)}.pdf`;
      return new NextResponse(Buffer.from(doc.output("arraybuffer")), {
        status: 200,
        headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=" + fn },
      });
    }

    // ── LAPORAN ──────────────────────────────────────────────
    let s = "";
    let e = "";

    if (bulan) {
      const y2 = bulan.slice(0, 4);
      const m = bulan.slice(5);
      s = y2 + "-" + m + "-01";
      const last = new Date(Number(y2), Number(m) - 1, 0).getDate();
      e = y2 + "-" + m + "-" + String(last).padStart(2, "0");
    } else {
      s = tahun + "-01-01";
      e = tahun + "-12-31";
    }

    const [txR, kasR, salR] = await Promise.all([
      sb.from("jimpitan_transaksi").select("*, warga:warga_id (nama, no_rumah)").gte("minggu_ke", s).lte("minggu_ke", e).order("minggu_ke", { ascending: true }).limit(2000),
      sb.from("kas_kegiatan").select("*").gte("tanggal", s).lte("tanggal", e).order("tanggal", { ascending: true }).limit(2000),
      sb.from("v_saldo_kas").select("saldo_kas_kegiatan").single(),
    ]);

    const lbl = bulan ? fmtDate(s) : "Tahun " + tahun;
    const doc = laporanPdf(txR.data ?? [], kasR.data ?? [], Number(salR.data?.saldo_kas_kegiatan ?? 0), lbl, tgl);
    const fn = `Laporan_${tahun}.pdf`;
    return new NextResponse(Buffer.from(doc.output("arraybuffer")), {
      status: 200,
      headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=" + fn },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? "Gagal" }, { status: 500 });
  }
}