import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
} from "docx";

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatTgl(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borderGray = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const bordersGray = { top: borderGray, bottom: borderGray, left: borderGray, right: borderGray };
const cellMargins = { top: 80, bottom: 80, left: 100, right: 100 };

const colWidths = [400, 1400, 1300, 1300, 650, 950, 850, 1000, 1176];
const totalWidth = colWidths.reduce((a, b) => a + b, 0);

function headerCell(text: string, width: number) {
  return new TableCell({
    borders, margins: cellMargins,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 16, font: "Arial" })],
    })],
  });
}

function dataCell(
  text: string, width: number,
  opts: {
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    bold?: boolean;
    shading?: any;
    borders?: any;
  } = {}
) {
  return new TableCell({
    borders: opts.borders ?? borders,
    margins: cellMargins,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ?? { fill: "FFFFFF", type: ShadingType.CLEAR },
    children: [new Paragraph({
      alignment: opts.align ?? AlignmentType.LEFT,
      children: [new TextRun({
        text, size: 16, font: "Arial", bold: opts.bold ?? false,
      })],
    })],
  });
}

function detailRow(item: any) {
  const shade = { fill: "F7F7F7", type: ShadingType.CLEAR };
  return new TableRow({
    children: [
      dataCell("", colWidths[0], { shading: shade, borders: bordersGray }),
      dataCell("", colWidths[1], { shading: shade, borders: bordersGray }),
      dataCell("", colWidths[2], { shading: shade, borders: bordersGray }),
      dataCell(`  - ${item.nama_sampah ?? "-"}`, colWidths[3], { shading: shade, borders: bordersGray }),
      dataCell(`${item.berat_kg ?? 0} kg`, colWidths[4], { align: AlignmentType.CENTER, shading: shade, borders: bordersGray }),
      dataCell(formatRp(item.nilai_kotor ?? 0), colWidths[5], { align: AlignmentType.RIGHT, shading: shade, borders: bordersGray }),
      dataCell(formatRp(item.potongan_kas ?? 0), colWidths[6], { align: AlignmentType.RIGHT, shading: shade, borders: bordersGray }),
      dataCell(formatRp(item.nilai_bersih ?? 0), colWidths[7], { align: AlignmentType.RIGHT, shading: shade, borders: bordersGray }),
      dataCell("", colWidths[8], { shading: shade, borders: bordersGray }),
    ],
  });
}

type RowNormal = {
  kode: string;
  nama_lengkap: string;
  tanggal: string;
  total_kotor: number;
  total_potongan_kas: number;
  total_nilai_bersih: number;
  total_berat: number;
  items: { nama_sampah: string; berat_kg: number; nilai_kotor: number; potongan_kas: number; nilai_bersih: number }[];
};

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const bulan = searchParams.get("bulan");

  let startDate = "";
  let endDate = "";
  if (bulan) {
    const [tahun, bln] = bulan.split("-");
    startDate = `${tahun}-${bln}-01`;
    const lastDay = new Date(Number(tahun), Number(bln), 0).getDate();
    endDate = `${tahun}-${bln}-${String(lastDay).padStart(2, "0")}`;
  }

  // ── Query: data dari tabel setoran (normalized schema) ─────────────────
  let setoranQuery = supabase
    .from("setoran")
    .select(`
      setoran_id, kode_setoran, created_at,
      total_kotor, total_potongan_kas, total_nilai_bersih,
      nasabah:nasabah_id (nama_lengkap),
      setoran_detail (
        berat_kg, nilai_kotor, potongan_kas, nilai_bersih,
        sampah:sampah_id (nama_sampah)
      )
    `)
    .eq("status", "terverifikasi")
    .order("created_at", { ascending: false })
    .limit(500);

  if (bulan) {
    setoranQuery = setoranQuery.gte("created_at", startDate).lte("created_at", endDate);
  }

  const setoranRes = await setoranQuery;
  if (setoranRes.error) return NextResponse.json({ error: setoranRes.error.message }, { status: 500 });

  // ── Normalisasi ────────────────────────────────────────────────────────
  const rows: RowNormal[] = (setoranRes.data ?? []).map((s: any) => {
    const details = s.setoran_detail ?? [];
    return {
      kode: s.kode_setoran ?? "-",
      nama_lengkap: s.nasabah?.nama_lengkap ?? "-",
      tanggal: s.created_at,
      total_kotor: s.total_kotor ?? 0,
      total_potongan_kas: s.total_potongan_kas ?? 0,
      total_nilai_bersih: s.total_nilai_bersih ?? 0,
      total_berat: details.reduce((ss: number, d: any) => ss + (d.berat_kg ?? 0), 0),
      items: details.map((d: any) => ({
        nama_sampah: d.sampah?.nama_sampah ?? "-",
        berat_kg: d.berat_kg ?? 0,
        nilai_kotor: d.nilai_kotor ?? 0,
        potongan_kas: d.potongan_kas ?? 0,
        nilai_bersih: d.nilai_bersih ?? 0,
      })),
    };
  }).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  // ── Hitung total ──────────────────────────────────────────────────────
  const totalBeratAll  = rows.reduce((s, r) => s + r.total_berat, 0);
  const totalKotorAll  = rows.reduce((s, r) => s + r.total_kotor, 0);
  const totalKasAll    = rows.reduce((s, r) => s + r.total_potongan_kas, 0);
  const totalBersihAll = rows.reduce((s, r) => s + r.total_nilai_bersih, 0);

  const periodeLabel = bulan
    ? new Date(bulan + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : "Semua Periode";

  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });

  const summaryColW = Math.floor(totalWidth / 4);

  // ── Build detail rows ─────────────────────────────────────────────────
  const detailRows: TableRow[] = [];
  rows.forEach((s, i) => {
    const shade = i % 2 === 1
      ? { fill: "F7F7F7", type: ShadingType.CLEAR }
      : { fill: "FFFFFF", type: ShadingType.CLEAR };

    detailRows.push(new TableRow({
      children: [
        dataCell(String(i + 1), colWidths[0], { align: AlignmentType.CENTER, shading: shade }),
        dataCell(s.kode, colWidths[1], { shading: shade }),
        dataCell(s.nama_lengkap, colWidths[2], { bold: true, shading: shade }),
        dataCell(`${s.items.length} jenis`, colWidths[3], { shading: shade }),
        dataCell(`${s.total_berat.toFixed(1)} kg`, colWidths[4], { align: AlignmentType.CENTER, shading: shade }),
        dataCell(formatRp(s.total_kotor), colWidths[5], { align: AlignmentType.RIGHT, shading: shade }),
        dataCell(formatRp(s.total_potongan_kas), colWidths[6], { align: AlignmentType.RIGHT, shading: shade }),
        dataCell(formatRp(s.total_nilai_bersih), colWidths[7], { align: AlignmentType.RIGHT, bold: true, shading: shade }),
        dataCell(formatTgl(s.tanggal), colWidths[8], { shading: shade }),
      ],
    }));

    // Sub-baris per item
    s.items.forEach((item) => detailRows.push(detailRow(item)));
  });

  // ── Build dokumen ─────────────────────────────────────────────────────
  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 20 } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 60 },
          children: [new TextRun({ text: "BANK SAMPAH DESA KEBONAGUNG", bold: true, size: 28, font: "Arial" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 60 },
          children: [new TextRun({ text: "Laporan Rekap Setoran Sampah", size: 22, font: "Arial" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 60 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
          children: [new TextRun({ text: `Periode: ${periodeLabel}`, size: 20, font: "Arial" })],
        }),

        // Ringkasan
        new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: "Ringkasan", bold: true, size: 22, font: "Arial" })],
        }),
        new Table({
          width: { size: totalWidth, type: WidthType.DXA },
          columnWidths: [summaryColW, summaryColW, summaryColW, totalWidth - summaryColW * 3],
          rows: [new TableRow({
            children: [
              new TableCell({
                borders, margins: cellMargins,
                width: { size: summaryColW, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "Total Setoran", size: 16, font: "Arial" })] }),
                  new Paragraph({ children: [new TextRun({ text: `${rows.length} setoran`, bold: true, size: 22, font: "Arial" })] }),
                ],
              }),
              new TableCell({
                borders, margins: cellMargins,
                width: { size: summaryColW, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "Total Berat", size: 16, font: "Arial" })] }),
                  new Paragraph({ children: [new TextRun({ text: `${totalBeratAll.toFixed(1)} kg`, bold: true, size: 22, font: "Arial" })] }),
                ],
              }),
              new TableCell({
                borders, margins: cellMargins,
                width: { size: summaryColW, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "Total Tabungan Warga", size: 16, font: "Arial" })] }),
                  new Paragraph({ children: [new TextRun({ text: formatRp(totalBersihAll), bold: true, size: 22, font: "Arial" })] }),
                ],
              }),
              new TableCell({
                borders, margins: cellMargins,
                width: { size: totalWidth - summaryColW * 3, type: WidthType.DXA },
                shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
                children: [
                  new Paragraph({ children: [new TextRun({ text: "Total Kas 10%", size: 16, font: "Arial" })] }),
                  new Paragraph({ children: [new TextRun({ text: formatRp(totalKasAll), bold: true, size: 22, font: "Arial" })] }),
                ],
              }),
            ],
          })],
        }),

        // Tabel Detail
        new Paragraph({
          spacing: { before: 240, after: 100 },
          children: [new TextRun({ text: "Detail Setoran", bold: true, size: 22, font: "Arial" })],
        }),
        new Table({
          width: { size: totalWidth, type: WidthType.DXA },
          columnWidths: colWidths,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                headerCell("No.", colWidths[0]),
                headerCell("Kode", colWidths[1]),
                headerCell("Nasabah", colWidths[2]),
                headerCell("Jenis Sampah", colWidths[3]),
                headerCell("Berat", colWidths[4]),
                headerCell("Kotor (Rp)", colWidths[5]),
                headerCell("Kas 10%", colWidths[6]),
                headerCell("Tabungan (Rp)", colWidths[7]),
                headerCell("Tanggal", colWidths[8]),
              ],
            }),
            ...detailRows,
            new TableRow({
              children: [
                new TableCell({
                  borders, columnSpan: 4, margins: cellMargins,
                  width: { size: colWidths[0]+colWidths[1]+colWidths[2]+colWidths[3], type: WidthType.DXA },
                  shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
                  children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "TOTAL", bold: true, size: 18, font: "Arial" })] })],
                }),
                new TableCell({
                  borders, margins: cellMargins,
                  width: { size: colWidths[4], type: WidthType.DXA },
                  shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${totalBeratAll.toFixed(1)} kg`, bold: true, size: 18, font: "Arial" })] })],
                }),
                new TableCell({
                  borders, margins: cellMargins,
                  width: { size: colWidths[5], type: WidthType.DXA },
                  shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
                  children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRp(totalKotorAll), bold: true, size: 18, font: "Arial" })] })],
                }),
                new TableCell({
                  borders, margins: cellMargins,
                  width: { size: colWidths[6], type: WidthType.DXA },
                  shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
                  children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRp(totalKasAll), bold: true, size: 18, font: "Arial" })] })],
                }),
                new TableCell({
                  borders, margins: cellMargins,
                  width: { size: colWidths[7], type: WidthType.DXA },
                  shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
                  children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRp(totalBersihAll), bold: true, size: 18, font: "Arial" })] })],
                }),
                new TableCell({
                  borders, margins: cellMargins,
                  width: { size: colWidths[8], type: WidthType.DXA },
                  shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
                  children: [new Paragraph({ children: [new TextRun({ text: "" })] })],
                }),
              ],
            }),
          ],
        }),

        // TTD
        new Paragraph({ spacing: { before: 400, after: 0 }, children: [new TextRun({ text: "" })] }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: `Kebonagung, ${today}`, size: 20, font: "Arial" })],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "Petugas Bank Sampah,", size: 20, font: "Arial" })],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 800, after: 0 },
          children: [new TextRun({ text: "(________________________)", size: 20, font: "Arial" })],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const filename = `Laporan_BankSampah_${periodeLabel.replace(/\s/g, "_")}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}