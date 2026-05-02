"use client";
import React, { useState } from "react";
import { formatRupiah, formatTanggal } from "@/lib/utils";

export default function RiwayatSetoranTable({ setoranList }: { setoranList: any[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--bdr)" }}>
            {["Kode", "Nasabah", "Jenis Sampah", "Total Berat", "Kotor", "Kas 10%", "Bersih", "Tanggal"].map((h, i) => (
              <th key={h} style={{
                padding: "10px 16px",
                textAlign: i >= 3 ? "right" : "left",
                fontSize: "10px", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.7px",
                color: "var(--text3)",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {setoranList.map((t: any, i: number) => {
            const rowKey = t.id ?? t.setoran_id ?? String(i);
            const isOpen = expanded.has(rowKey);
            const isLast = i === setoranList.length - 1;
            const sampahList: string[] = t.nama_sampah_list ?? [];

            return (
              <React.Fragment key={rowKey}>
                {/* ── Baris utama setoran ── */}
                <tr
                  onClick={() => toggle(rowKey)}
                  style={{
                    borderBottom: !isOpen && !isLast ? "1px solid var(--bdr)" : "none",
                    cursor: "pointer",
                    background: isOpen ? "var(--p5)" : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text3)" }}>
                      {t.kode ?? t.kode_setoran}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", fontWeight: 600, color: "var(--text)" }}>
                    {t.nama_lengkap}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {sampahList.slice(0, 2).map((nama) => (
                        <span key={nama} style={{
                          background: "var(--p5)", color: "var(--p)",
                          borderRadius: "6px", padding: "2px 8px",
                          fontSize: "11px", fontWeight: 600,
                        }}>{nama}</span>
                      ))}
                      {sampahList.length > 2 && (
                        <span style={{
                          background: "var(--surf2)", color: "var(--text3)",
                          borderRadius: "6px", padding: "2px 8px", fontSize: "11px",
                        }}>+{sampahList.length - 2} lagi</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "11px 16px", textAlign: "right", color: "var(--text2)" }}>
                    {Number(t.total_berat_kg ?? 0).toFixed(1)} kg
                  </td>
                  <td style={{ padding: "11px 16px", textAlign: "right", color: "var(--text3)" }}>
                    {formatRupiah(t.total_kotor)}
                  </td>
                  <td style={{ padding: "11px 16px", textAlign: "right", color: "var(--red)", fontSize: "11px" }}>
                    {formatRupiah(t.total_potongan_kas)}
                  </td>
                  <td style={{ padding: "11px 16px", textAlign: "right", fontWeight: 700, color: "var(--p)" }}>
                    {formatRupiah(t.total_nilai_bersih)}
                  </td>
                  <td style={{ padding: "11px 16px", textAlign: "right", fontSize: "11px", color: "var(--text3)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                      {formatTanggal(t.created_at)}
                      <span style={{ fontSize: "10px", opacity: 0.6 }}>
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </div>
                  </td>
                </tr>

                {/* ── Baris expand: detail per jenis sampah ── */}
                {isOpen && (
                  <tr style={{ borderBottom: !isLast ? "1px solid var(--bdr)" : "none" }}>
                    <td colSpan={8} style={{ padding: "0 16px 12px 40px", background: "var(--p5)" }}>
                      <DetailSetoran setoranId={rowKey} isLegacy={!t.setoran_id && !!t.id} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DetailSetoran({ setoranId, isLegacy }: { setoranId: string; isLegacy: boolean }) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLoading(true);
    const endpoint = isLegacy
      ? `/api/setoran-detail?legacy_id=${setoranId}`
      : `/api/setoran-detail?id=${setoranId}`;
    fetch(endpoint)
      .then((r) => r.json())
      .then((d) => setData(d.items ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [setoranId, isLegacy]);

  if (loading) return (
    <p style={{ fontSize: "12px", color: "var(--text3)", padding: "8px 0" }}>Memuat detail...</p>
  );
  if (!data?.length) return (
    <p style={{ fontSize: "12px", color: "var(--text3)", padding: "8px 0" }}>Tidak ada detail.</p>
  );

  return (
    <table style={{ fontSize: "12px", borderCollapse: "collapse", marginTop: "6px" }}>
      <thead>
        <tr>
          {["Jenis Sampah", "Berat", "Harga/kg", "Kotor", "Kas", "Bersih"].map((h, i) => (
            <th key={h} style={{
              padding: "4px 12px 4px 0",
              textAlign: i >= 1 ? "right" : "left",
              fontSize: "10px", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.5px",
              color: "var(--text3)",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item: any, i: number) => (
          <tr key={i}>
            <td style={{ padding: "4px 12px 4px 0", fontWeight: 600, color: "var(--text)" }}>
              {item.nama_sampah}
            </td>
            <td style={{ padding: "4px 12px 4px 0", textAlign: "right", color: "var(--text2)" }}>
              {item.berat_kg} kg
            </td>
            <td style={{ padding: "4px 12px 4px 0", textAlign: "right", color: "var(--text3)" }}>
              {formatRupiah(item.harga_satuan)}
            </td>
            <td style={{ padding: "4px 12px 4px 0", textAlign: "right", color: "var(--text3)" }}>
              {formatRupiah(item.nilai_kotor)}
            </td>
            <td style={{ padding: "4px 12px 4px 0", textAlign: "right", color: "var(--red)" }}>
              -{formatRupiah(item.potongan_kas)}
            </td>
            <td style={{ padding: "4px 12px 4px 0", textAlign: "right", fontWeight: 700, color: "var(--p)" }}>
              {formatRupiah(item.nilai_bersih)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}