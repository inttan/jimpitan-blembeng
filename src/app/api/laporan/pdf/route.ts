import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { APP_NAME, formatPeriodeMinggu, getAkhirMinggu, getMingguKe } from "@/lib/jimpitan";

function formatRp(n: number) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

function formatTgl(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr + (dateStr.length === 10 ? "T00:00:00" : "")).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildAuditPDF(riwayatData: any[], saldo: number, today: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(APP_NAME.toUpperCase(), pageW / 2, y, { align: "center" });
  y += 7;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Laporan Riwayat Perubahan / Audit Trail", pageW / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(10);
  doc.text(`Dicetak: ${today}`, pageW / 2, y, { align: "center" });
  y += 4;
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(14, y, pageW - 14, y);
  y += 8;

  const total = (riwayatData ?? []).length;
  const byAksi = { insert: 0, update: 0, delete: 0 };
  (riwayatData ?? []).forEach((r: any) => {
    if (byAksi.hasOwnProperty(r.aksi)) byAksi[r.aksi as keyof typeof byAksi]++;
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Ringkasan", 14, y);
  y += 2;

  autoTable(doc, {
    startY: y,
    head: [["Metrik", "Nilai"]],
    body: [
      ["Total Perubahan", String(total)],
      ["Tambah (Insert)", String(byAksi.insert)],
      ["Ubah (Update)", String(byAksi.update)],
      ["Hapus (Delete)", String(byAksi.delete)],
      ["Saldo Kas Kegiatan", formatRp(saldo)],
    ],
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [220, 220, 220], textColor: [30, 30, 30] },
    columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 70, halign: "right" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Detail Riwayat Perubahan", 14, y);
  y += 2;

  const aksiLabel: Record<string, string> = { insert: "TAMBAH", update: "UBAH", delete: "HAPUS" };

  const rows = (riwayatData ?? []).map((r: any, i: number) => [
    String(i + 1),
    formatTgl(r.created_at),
    aksiLabel[r.aksi] ?? r.aksi.toUpperCase(),
    r.tabel ?? "-",
    r.diubah_oleh ?? "Sistem",
    r.data_lama ? "Ya" : "-",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["No", "Waktu", "Aksi", "Tabel", "Oleh", "Data Lama"]],
    body: rows.length ? rows : [["-", "Tidak ada data", "-", "-", "-", "-"]],
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [220, 220, 220], textColor: [30, 30, 30] },
    margin: { left: 14, right: 14 },
    columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 32 }, 2: { cellWidth: 24 }, 5: { cellWidth: 20 } },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Blembeng, ${today}`, pageW - 14, y, { align: "right" });
  y += 6;
  doc.text("Pengurus Jimpitan,", pageW - 14, y, { align: "right" });
  y += 20;
  doc.text("(________________________)", pageW - 14, y, { align: "right" });

  return doc;
}

function buildRekapPDF(
  txData: any[],
  kasData: any[],
  saldoAkhir: number,
  belumSetor: any[],
  mode: string,
  startDate: string,
  endDate: string,
  periodeLabel: string,
  today: string
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 16;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("LAPORAN KAS JIMPITAN", pageW / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(12);
  doc.text("Dusun Blembeng", pageW / 2, y, { align: "center" });
  y += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Periode: ${periodeLabel}`, pageW / 2, y, { align: "center" });
  y += 4;
  doc.setFontSize(9);
  doc.text(`Dicetak: ${today}`, pageW / 2, y, { align: "center" });
  y += 8;
  doc.setLineWidth(0.5);
  doc.line(14, y, pageW - 14, y);
  y += 8;

  // Ringkasan
  const totalSetor = (txData ?? []).filter((t: any) => t.status === "lunas").reduce((s: number, t: any) => s + Number(t.jumlah_setor ?? 0), 0);
  const kasMasuk = (kasData ?? []).filter((k: any) => k.jenis === "masuk");
  const kasKeluar = (kasData ?? []).filter((k: any) => k.jenis === "keluar");
  const totalMasuk = kasMasuk.reduce((s: number, k: any) => s + Number(k.jumlah ?? 0), 0);
  const totalKeluar = kasKeluar.reduce((s: number, k: any) => s + Number(k.jumlah ?? 0), 0);
  const lunasCount = (txData ?? []).filter((t: any) => t.status === "lunas").length;

  // Ringkasan box
  autoTable(doc, {
    startY: y,
    body: [
      ["Total Setoran", formatRp(totalSetor)],
      ["Kas Masuk (Setoran)", formatRp(totalMasuk)],
      ["Kas Keluar (Penarikan)", formatRp(totalKeluar)],
      ["SALDO AKHIR", formatRp(saldoAkhir)],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold" }, 1: { halign: "right" } },
    margin: { left: 14, right: 14 },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.3,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Kas Masuk ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("KAS MASUK (Setoran Jimpitan)", 14, y);
  y += 2;

  const masukRows = kasMasuk.map((k: any, i: number) => [
    String(i + 1),
    formatTgl(k.tanggal),
    formatRp(Number(k.jumlah)),
    k.keterangan ?? "-",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["No", "Tanggal", "Jumlah", "Keterangan"]],
    body: masukRows.length ? masukRows : [["-", "Tidak ada kas masuk", "-", "-"]],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [34, 139, 34], textColor: 255, fontStyle: "bold" },
    margin: { left: 14, right: 14 },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.2,
    alternateRowStyles: { fillColor: [240, 255, 240] },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Kas Keluar ──
  if (y > 220) { doc.addPage(); y = 16; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("KAS KELUAR (Penarikan / Pengeluaran)", 14, y);
  y += 2;

  const keluarRows = kasKeluar.map((k: any, i: number) => [
    String(i + 1),
    formatTgl(k.tanggal),
    formatRp(Number(k.jumlah)),
    k.keterangan ?? "-",
    k.disetujui_oleh ?? "-",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["No", "Tanggal", "Jumlah", "Keterangan", "Disetujui"]],
    body: keluarRows.length ? keluarRows : [["-", "Tidak ada kas keluar", "-", "-", "-"]],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [220, 53, 69], textColor: 255, fontStyle: "bold" },
    margin: { left: 14, right: 14 },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.2,
    alternateRowStyles: { fillColor: [255, 245, 245] },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Daftar Transaksi ──
  if (y > 200) { doc.addPage(); y = 16; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Daftar Setoran per Warga", 14, y);
  y += 2;

  const txRows = (txData ?? []).map((t: any, i: number) => [
    String(i + 1),
    t.warga?.nama ?? "-",
    formatRp(Number(t.jumlah_setor ?? 0)),
    t.status === "lunas" ? "Lunas" : t.status === "belum" ? "Belum" : "Nihil",
    formatTgl(t.minggu_ke),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["No", "Nama", "Jumlah", "Status", "Tanggal"]],
    body: txRows.length ? txRows : [["-", "Tidak ada transaksi", "-", "-", "-"]],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [100, 100, 100], textColor: 255, fontStyle: "bold" },
    margin: { left: 14, right: 14 },
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.2,
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // TTD
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Blembeng, ${today}`, pageW - 14, y, { align: "right" });
  y += 15;
  doc.text("Pengurus Jimpitan,", pageW - 14, y, { align: "right" });
  y += 15;
  doc.text("________________________", pageW - 14, y, { align: "right" });

  return doc;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "mingguan";
    const minggu = searchParams.get("minggu") || getMingguKe();
    const bulan = searchParams.get("bulan");
    const tahun = searchParams.get("tahun") || String(new Date().getFullYear());
    const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    let doc: jsPDF;
    let filename: string;

    if (mode === "riwayat") {
      const { data: riwayatData } = await supabase.from("riwayat_perubahan").select("*").order("created_at", { ascending: false }).limit(200);
      const { data: saldoRow } = await supabase.from("v_saldo_kas").select("saldo_kas_kegiatan").maybeSingle();
      doc = buildAuditPDF(riwayatData ?? [], Number(saldoRow?.saldo_kas_kegiatan ?? 0), today);
      filename = `Laporan_Riwayat_Perubahan_${new Date().toISOString().slice(0, 10)}.pdf`;
    } else {
      let startDate = "";
      let endDate = "";
      let periodeLabel = "";

      if (mode === "mingguan") {
        startDate = minggu;
        endDate = getAkhirMinggu(minggu);
        periodeLabel = `Minggu ${formatPeriodeMinggu(minggu)}`;
      } else if (mode === "bulanan" && bulan) {
        const [y2, m] = bulan.split("-");
        startDate = `${y2}-${m}-01`;
        const lastDay = new Date(Number(y2), Number(m), 0).getDate();
        endDate = `${y2}-${m}-${String(lastDay).padStart(2, "0")}`;
        periodeLabel = new Date(bulan + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" });
      } else {
        startDate = `${tahun}-01-01`;
        endDate = `${tahun}-12-31`;
        periodeLabel = `Tahun ${tahun}`;
      }

      const { data: txData, error: txErr } = await supabase
        .from("jimpitan_transaksi")
        .select("*, warga:warga_id (nama, no_rumah, no_hp)")
        .gte("minggu_ke", startDate)
        .lte("minggu_ke", endDate)
        .order("minggu_ke", { ascending: true })
        .limit(1000);

      if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 });

      const { data: kasData, error: kasErr } = await supabase
        .from("kas_kegiatan")
        .select("*")
        .gte("tanggal", startDate)
        .lte("tanggal", endDate)
        .order("tanggal", { ascending: true })
        .limit(1000);

      if (kasErr) return NextResponse.json({ error: kasErr.message }, { status: 500 });

      let belumSetor: any[] = [];
      if (mode === "mingguan") {
        const { data: wargaAll } = await supabase.from("warga").select("id, nama, no_rumah, no_hp").eq("status_aktif", true);
        const lunasIds = new Set((txData ?? []).filter((t: any) => t.status === "lunas" && t.minggu_ke === minggu).map((t: any) => t.warga_id));
        belumSetor = (wargaAll ?? []).filter((w: any) => !lunasIds.has(w.id)).map((w: any) => ({ nama: w.nama, no_rumah: w.no_rumah, no_hp: w.no_hp }));
      }

      const { data: saldoRow } = await supabase.from("v_saldo_kas").select("saldo_kas_kegiatan").maybeSingle();
      doc = buildRekapPDF(txData ?? [], kasData ?? [], Number(saldoRow?.saldo_kas_kegiatan ?? 0), belumSetor, mode, startDate, endDate, periodeLabel, today);
      const safeLabel = periodeLabel.replace(/\s+/g, "_").replace(/[–—]/g, "-").replace(/[^a-zA-Z0-9_\-]/g, "");
      filename = `Laporan_Jimpitan_Blembeng_${mode}_${safeLabel}.pdf`;
    }

    const buffer = Buffer.from(doc.output("arraybuffer"));
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("PDF export error:", err);
    return NextResponse.json(
      { error: err?.message || "Gagal membuat PDF. Cek koneksi database." },
      { status: 500 }
    );
  }
}
