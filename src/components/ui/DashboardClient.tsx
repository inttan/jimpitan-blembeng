"use client";
import Link from "next/link";
import { formatRupiah, formatTanggalPendek } from "@/lib/utils";
import { NOMINAL_STANDAR } from "@/lib/jimpitan";
import { useState, useRef } from "react";

interface DashboardData {
  saldoKas: number;
  saldoKasPrev: number;
  belumSetor: { id: string; nama: string; no_hp: string | null; no_rumah: string | null }[];
  totalUpahBelum: number;
  wargaAktif: number;
  totalWarga: number;
  lunasMingguIni: number;
  totalSetorMingguIni: number;
  transaksiTerbaru: {
    id: string;
    status: string;
    potongan_kas: number;
    dana_kegiatan: number;
    minggu_ke: string;
    warga: { nama: string } | null;
    jumlah_setor: number;
  }[];
  chartBulanan: { bulan: string; nilai: number; keluar?: number }[];
  chartAkumulasi: { bulan: string; akumulasi: number }[];
  mingguIni: string;
  formatPeriode: string;
}

/** ── Hero Card: Saldo Kas ── */
function HeroSaldoCard({ value, delta }: { value: string; delta: string }) {
  return (
    <div style={{
      borderRadius: "12px",
      padding: "20px 22px",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 2px 6px rgba(38,36,30,0.08), 0 8px 24px rgba(38,36,30,0.07)",
      background: "var(--paper-raised)",
      border: "1px solid var(--line)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(38,36,30,0.12), 0 16px 40px rgba(38,36,30,0.10)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 6px rgba(38,36,30,0.08), 0 8px 24px rgba(38,36,30,0.07)";
    }}>
      {/* Accent bar di kiri */}
      <div style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: "4px",
        background: "var(--green)",
        borderRadius: "12px 0 0 12px",
      }} />

      {/* Coin icon - lebih kecil & flat */}
      <div style={{
        position: "absolute",
        top: "16px",
        right: "18px",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "var(--brass)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.7,
        zIndex: 1,
      }}>
        <span style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 700,
          fontSize: "12px",
          color: "#F6F3EA",
          lineHeight: 1,
          position: "relative",
          zIndex: 1,
        }}>Rp</span>
      </div>

      <div style={{
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        color: "var(--ink-soft)",
        fontWeight: 600,
        marginBottom: "10px",
        fontFamily: "'Public Sans', sans-serif",
      }}>Saldo Kas Kegiatan</div>

      {/* Angka utama - lebih besar & hijau tua */}
      <div style={{
        fontSize: "32px",
        fontWeight: 700,
        color: "var(--green)",
        fontFamily: "'IBM Plex Mono', monospace",
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.5px",
        lineHeight: 1,
        marginBottom: "8px",
      }}>{value}</div>

      <div style={{
        fontSize: "11.5px",
        color: delta.startsWith("↑")
          ? "var(--green)"
          : delta.startsWith("↓")
          ? "var(--terracotta)"
          : "var(--ink-soft)",
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 500,
      }}>{delta}</div>
    </div>
  );
}

/** ── KPI Card ── */
function KpiCard({
  label, value, sub, warn = false,
}: {
  label: string; value: string; sub?: string; warn?: boolean;
}) {
  return (
    <div style={{
      background: "var(--paper-raised)",
      border: "1px solid var(--line)",
      borderRadius: "12px",
      padding: "18px 20px",
      boxShadow: "0 2px 6px rgba(38,36,30,0.08), 0 8px 24px rgba(38,36,30,0.07)",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.18s ease, box-shadow 0.18s ease",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(38,36,30,0.12), 0 16px 40px rgba(38,36,30,0.10)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 6px rgba(38,36,30,0.08), 0 8px 24px rgba(38,36,30,0.07)";
    }}>
      <div style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: "4px",
        background: warn ? "var(--terracotta)" : "var(--brass)",
        borderRadius: "12px 0 0 12px",
      }} />
      <div style={{
        fontSize: "11px",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "var(--ink-soft)",
        fontWeight: 600,
        marginBottom: "8px",
        fontFamily: "'Public Sans', sans-serif",
      }}>{label}</div>
      <div style={{
        fontSize: "22px",
        fontWeight: 600,
        color: warn ? "var(--terracotta)" : "var(--green)",
        fontFamily: "'IBM Plex Mono', monospace",
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.5px",
      }}>{value}</div>
      {sub && (
        <div style={{ fontSize: "11px", color: "var(--ink-soft)", marginTop: "5px" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

/** ── Bar Chart ── */
function ChartBars({ data }: { data: { bulan: string; nilai: number }[] }) {
  if (!data.length || data.every(d => d.nilai === 0)) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--ink-soft)", fontSize: "13px" }}>
        Belum ada data tren
      </div>
    );
  }
  const max = Math.max(...data.map(d => d.nilai));
  const tinggi = 100;

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      gap: "8px",
      height: `${tinggi + 24}px`,
      paddingTop: "8px",
    }}>
      {data.map((d, i) => {
        const h = max > 0 ? Math.round((d.nilai / max) * tinggi) : 0;
        const isLast = i === data.length - 1;
        return (
          <div key={d.bulan} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{
              width: "100%",
              height: `${h}px`,
              minHeight: h > 0 ? "4px" : "0",
              background: isLast
                ? "linear-gradient(180deg, var(--brass), var(--brass-soft))"
                : "linear-gradient(180deg, rgba(184,134,59,0.55), rgba(184,134,59,0.28))",
              borderRadius: "4px 4px 2px 2px",
              boxShadow: isLast ? "0 2px 6px rgba(184,134,59,0.25)" : "none",
            }} />
            <div style={{ fontSize: "10px", color: "var(--ink-soft)" }}>{d.bulan}</div>
          </div>
        );
      })}
    </div>
  );
}

/** ── Progress Bar ── */
function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "12px",
        color: "var(--ink-soft)",
        marginBottom: "8px",
      }}>
        <span>{done} / {total} KK sudah setor</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: "var(--green)" }}>{pct}%</span>
      </div>
      <div style={{
        height: "14px",
        background: "var(--surf3)",
        borderRadius: "99px",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: pct === 100
            ? "var(--green)"
            : "linear-gradient(90deg, var(--green), var(--brass))",
          borderRadius: "99px",
          transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

/** ── Avatar ── */
function Avatar({ nama }: { nama: string }) {
  const initials = nama.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: "28px", height: "28px", borderRadius: "50%",
      background: "var(--brass-soft)", color: "var(--green)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "11px", fontWeight: 700,
      fontFamily: "'Fraunces', serif",
      flexShrink: 0,
    }}>{initials}</div>
  );
}

/** ── Stamp Badge ── */
function Stamp({ status }: { status: string }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      fontFamily: "'Fraunces', serif",
      fontWeight: 700,
      fontSize: "10.5px",
      letterSpacing: "0.04em",
      padding: "4px 10px",
      borderRadius: "20px",
      border: "1.5px solid",
      transform: "rotate(-2deg)",
      textTransform: "uppercase",
      ...(status === "lunas" ? {
        color: "var(--green)", borderColor: "var(--green)", background: "rgba(31,61,43,0.06)",
      } : status === "belum" ? {
        color: "var(--terracotta)", borderColor: "var(--terracotta)", background: "var(--terracotta-soft)",
      } : {
        color: "var(--ink-soft)", borderColor: "var(--ink-soft)", background: "rgba(92,88,75,0.06)",
      }),
    }}>
      {status === "lunas" ? "Lunas" : status === "belum" ? "Belum" : "Nihil"}
    </span>
  );
}

export default function DashboardClient(props: DashboardData) {
  const {
    saldoKas, saldoKasPrev, belumSetor, totalUpahBelum, wargaAktif, totalWarga,
    lunasMingguIni, totalSetorMingguIni, transaksiTerbaru, chartBulanan, chartAkumulasi,
    mingguIni, formatPeriode,
  } = props;

  const delta = saldoKas - saldoKasPrev;
  const deltaStr = delta >= 0
    ? `↑ ${formatRupiah(delta)} dari minggu lalu`
    : `↓ ${formatRupiah(Math.abs(delta))} dari minggu lalu`;

  const belumCount = belumSetor.length;
  const lunasCount = wargaAktif - belumCount;

  return (
    <div style={{ padding: "28px 34px 50px", maxHeight: "100vh", overflowY: "auto" }}>

      {/* ── Topbar ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "26px",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "24px",
            fontWeight: 600,
            color: "var(--green)",
            margin: 0,
            lineHeight: 1.1,
          }}>Dashboard</h1>
          <div style={{ fontSize: "12.5px", color: "var(--ink-soft)", marginTop: "3px" }}>
            Ringkasan minggu berjalan — {formatPeriode}
          </div>
        </div>
        <div style={{
          background: "var(--paper-raised)",
          border: "1px solid var(--line)",
          borderRadius: "20px",
          padding: "6px 14px",
          fontSize: "12.5px",
          color: "var(--ink-soft)",
          fontWeight: 500,
          boxShadow: "var(--shd)",
        }}>
          Minggu ke-{mingguIni}
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: "16px",
        marginBottom: "32px",
        alignItems: "stretch",
      }}>
        <HeroSaldoCard value={formatRupiah(saldoKas)} delta={deltaStr} />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <KpiCard
            label="Belum Setor Minggu Ini"
            value={`${belumCount} KK`}
            warn={belumCount > 0}
            sub={`${lunasCount} dari ${wargaAktif} warga aktif`}
          />
          <KpiCard
            label="Transaksi Minggu Ini"
            value={`${lunasMingguIni} setoran`}
            sub={`Total: ${formatRupiah(totalSetorMingguIni)}`}
          />
        </div>
      </div>

      {/* ── Progress Setoran ── */}
      <div style={{
        background: "var(--paper-raised)",
        border: "1px solid var(--line)",
        borderRadius: "12px",
        padding: "16px 20px",
        boxShadow: "var(--shd)",
        marginBottom: "20px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "15.5px",
            fontWeight: 600,
            color: "var(--green)",
            margin: 0,
          }}>Progress Setoran Minggu Ini</h2>
          <Link href="/transaksi" style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--brass)",
            textDecoration: "none",
          }}>Lihat detail →</Link>
        </div>
        <ProgressBar done={lunasCount} total={wargaAktif} />
      </div>

      {/* ── Belum Setor ── */}
      {belumCount > 0 && (
        <div style={{
          background: "var(--paper-raised)",
          border: "1px solid var(--line)",
          borderRadius: "12px",
          padding: "16px 20px",
          boxShadow: "var(--shd)",
          marginBottom: "20px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "15.5px",
              fontWeight: 600,
              color: "var(--terracotta)",
              margin: 0,
            }}>Belum Setor Minggu Ini</h2>
            <span style={{
              background: "var(--terracotta-soft)",
              color: "var(--terracotta)",
              fontSize: "11px",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "20px",
            }}>{belumCount}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {belumSetor.slice(0, 6).map((w) => (
              <div key={w.id} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "6px 0",
                borderBottom: "1px solid var(--line)",
              }}>
                <Avatar nama={w.nama} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--ink)" }}>{w.nama}</div>
                  <div style={{ fontSize: "11px", color: "var(--ink-soft)" }}>{w.no_rumah ?? "—"}</div>
                </div>
              </div>
            ))}
            {belumCount > 6 && (
              <Link href="/transaksi" style={{ fontSize: "12px", color: "var(--brass)", fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
                +{belumCount - 6} lainnya →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Chart ── */}
      <div style={{
        background: "var(--paper-raised)",
        border: "1px solid var(--line)",
        borderRadius: "12px",
        padding: "20px 22px",
        boxShadow: "var(--shd)",
        marginBottom: "20px",
      }}>
        <h2 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "15.5px",
          fontWeight: 600,
          color: "var(--green)",
          margin: "0 0 16px",
        }}>Tren Kas 6 Bulan Terakhir</h2>
        <ChartBars data={chartBulanan} />
      </div>

      {/* ── Transaksi Terbaru ── */}
      <div style={{
        background: "var(--paper-raised)",
        border: "1px solid var(--line)",
        borderRadius: "12px",
        boxShadow: "var(--shd)",
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 22px",
          borderBottom: "1px solid var(--line)",
        }}>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "15.5px",
            fontWeight: 600,
            color: "var(--green)",
            margin: 0,
          }}>Transaksi Terbaru</h2>
          <Link href="/transaksi" style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--brass)",
            textDecoration: "none",
          }}>Lihat semua →</Link>
        </div>

        {transaksiTerbaru.length === 0 ? (
          <div style={{ padding: "36px 20px", textAlign: "center", color: "var(--ink-soft)", fontSize: "13px" }}>
            Belum ada transaksi minggu ini.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--line)" }}>
                  {["Warga", "Status", "Nominal", "Tanggal"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left",
                      padding: "8px 22px",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--ink-soft)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transaksiTerbaru.map((row, i) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: i < transaksiTerbaru.length - 1 ? "1px solid var(--line)" : "none",
                    }}
                  >
                    <td style={{ padding: "11px 22px", fontWeight: 600, color: "var(--ink)" }}>
                      {row.warga?.nama ?? "—"}
                    </td>
                    <td style={{ padding: "11px 22px" }}>
                      <Stamp status={row.status} />
                    </td>
                    <td style={{
                      padding: "11px 22px",
                      textAlign: "right",
                      fontFamily: "'IBM Plex Mono', monospace",
                      color: "var(--ink-soft)",
                    }}>
                      {row.status === "nihil" ? "—" : formatRupiah(row.jumlah_setor)}
                    </td>
                    <td style={{
                      padding: "11px 22px",
                      fontSize: "12px",
                      color: "var(--ink-soft)",
                      whiteSpace: "nowrap",
                    }}>
                      {formatTanggalPendek(row.minggu_ke)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
