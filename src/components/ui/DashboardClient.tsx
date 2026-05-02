"use client";
import Link from "next/link";
import { useLang } from "@/components/providers/LangProvider";
import { formatRupiah, formatTanggalPendek } from "@/lib/utils";
import {
  ChartSetoranBulanan,
  ChartKomposisiSampah,
  ChartAkumulasiTabungan,
} from "@/components/ui/Charts";
import {
  Landmark, Briefcase, Recycle, Users,
  ClipboardList, TrendingUp, BarChart2,
  AlertTriangle, ArrowRight, Plus,
} from "lucide-react";

interface DashboardData {
  metrics: any;
  nasabahStats: any;
  transaksiTerbaru: any[];
  chartBulanan: any[];
  chartKomposisi: any[];
}

/* ─── Stat Card ─── */
const KPI_ICONS = [Landmark, Briefcase, Recycle, Users];

function StatCard({ label, value, sub, iconIndex = 0, accent = false }: {
  label: string; value: string; sub?: string;
  iconIndex?: number; accent?: boolean;
}) {
  const Icon = KPI_ICONS[iconIndex];
  return (
    <div style={{
      background: accent ? "var(--p)" : "var(--surf)",
      border: `1px solid ${accent ? "transparent" : "var(--bdr)"}`,
      borderRadius: "var(--r)", padding: "18px 20px",
      boxShadow: accent ? "0 4px 20px rgba(22,101,52,0.25)" : "var(--shd)",
      transition: "all 0.2s", position: "relative", overflow: "hidden",
    }}>
      {/* bg circle deco */}
      <div style={{
        position: "absolute", bottom: "-24px", right: "-24px",
        width: "88px", height: "88px", borderRadius: "50%",
        background: accent ? "rgba(255,255,255,0.06)" : "var(--p6)",
        pointerEvents: "none",
      }} />
      {/* icon */}
      <div style={{
        width: "34px", height: "34px", borderRadius: "9px",
        background: accent ? "rgba(255,255,255,0.15)" : "var(--p5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "14px",
        color: accent ? "#fff" : "var(--p)",
      }}>
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <p style={{
        fontSize: "10px", fontWeight: 600, letterSpacing: "0.7px",
        textTransform: "uppercase",
        color: accent ? "rgba(255,255,255,0.6)" : "var(--text3)",
        marginBottom: "5px",
      }}>{label}</p>
      <p style={{
        fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px",
        color: accent ? "#fff" : "var(--text)", lineHeight: 1,
      }}>{value}</p>
      {sub && (
        <p style={{
          fontSize: "11px", marginTop: "6px",
          color: accent ? "rgba(255,255,255,0.55)" : "var(--text3)",
        }}>{sub}</p>
      )}
    </div>
  );
}

/* ─── Card wrapper ─── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--surf)", border: "1px solid var(--bdr)",
      borderRadius: "var(--r)", boxShadow: "var(--shd)",
      transition: "background 0.25s", ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Card Header ─── */
function CardHeader({ title, sub, action }: {
  title: string; sub?: string; action?: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 20px", borderBottom: "1px solid var(--bdr)",
    }}>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.1px" }}>
          {title}
        </p>
        {sub && (
          <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px" }}>{sub}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ─── Empty State ─── */
function Empty({ Icon, text }: { Icon: React.ElementType; text: string }) {
  return (
    <div style={{
      height: "180px", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "10px",
    }}>
      <div style={{
        width: "48px", height: "48px", borderRadius: "14px",
        background: "var(--surf3)", display: "flex",
        alignItems: "center", justifyContent: "center",
        color: "var(--text3)",
      }}>
        <Icon size={22} strokeWidth={1.5} />
      </div>
      <p style={{ fontSize: "12px", color: "var(--text3)" }}>{text}</p>
    </div>
  );
}

/* ─── Main ─── */
export default function DashboardClient({
  metrics, nasabahStats, transaksiTerbaru, chartBulanan, chartKomposisi,
}: DashboardData) {
  const { t, lang } = useLang();

  const totalNasabahSub = t.totalNasabah.replace("{n}", String(nasabahStats?.total_nasabah ?? 0));

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* ── Hero ── */}
      <Card style={{ padding: "20px 24px" }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "46px", height: "46px", borderRadius: "13px",
              background: "var(--p5)", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "var(--p)",
            }}>
              <Recycle size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{
                fontSize: "18px", fontWeight: 800, color: "var(--text)",
                letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: "6px",
              }}>
                {t.greetTitle}
                <span style={{ fontSize: "16px" }}>👋</span>
              </h1>
              <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "3px" }}>
                {t.greetSub}
              </p>
            </div>
          </div>
          <Link href="/transaksi" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "var(--p)", color: "#fff",
            borderRadius: "9px", padding: "10px 18px",
            fontSize: "13px", fontWeight: 700, textDecoration: "none",
            boxShadow: "0 4px 14px rgba(22,101,52,0.28)",
            transition: "opacity 0.2s",
          }}>
            <Plus size={15} strokeWidth={2.5} />
            {t.btnCatat}
          </Link>
        </div>
      </Card>

      {/* ── KPI Grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
        gap: "12px",
      }}>
        <StatCard accent iconIndex={0} label={t.kpi1Label}
          value={formatRupiah(metrics?.total_liabilities ?? 0)} sub={t.kpi1Sub} />
        <StatCard iconIndex={1} label={t.kpi2Label}
          value={formatRupiah(metrics?.total_kas_terkumpul ?? 0)} sub={t.kpi2Sub} />
        <StatCard iconIndex={2} label={t.kpi3Label}
          value={`${(metrics?.total_sampah_kg ?? 0).toFixed(1)} kg`} sub={t.kpi3Sub} />
        <StatCard iconIndex={3} label={t.kpi4Label}
          value={String(nasabahStats?.nasabah_aktif ?? 0)} sub={totalNasabahSub} />
      </div>

      {/* ── Secondary Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Card style={{ padding: "16px 20px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px",
          }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "7px",
              background: "var(--p5)", display: "flex",
              alignItems: "center", justifyContent: "center", color: "var(--p)",
            }}>
              <ClipboardList size={14} strokeWidth={2.5} />
            </div>
            <p style={{
              fontSize: "10px", fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "0.7px", color: "var(--text3)",
            }}>{t.statTxnLabel}</p>
          </div>
          <p style={{
            fontSize: "38px", fontWeight: 800, color: "var(--text)",
            lineHeight: 1, letterSpacing: "-1px", margin: "0 0 4px",
          }}>
            {metrics?.transaksi_hari_ini ?? 0}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text3)" }}>{t.statTxnSub}</p>
        </Card>

        <Card style={{ padding: "16px 20px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px",
          }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "7px",
              background: "var(--p5)", display: "flex",
              alignItems: "center", justifyContent: "center", color: "var(--p)",
            }}>
              <TrendingUp size={14} strokeWidth={2.5} />
            </div>
            <p style={{
              fontSize: "10px", fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "0.7px", color: "var(--text3)",
            }}>{t.statAvgLabel}</p>
          </div>
          <p style={{
            fontSize: "26px", fontWeight: 800, color: "var(--text)",
            lineHeight: 1, letterSpacing: "-0.5px", margin: "0 0 4px",
          }}>
            {formatRupiah(metrics?.rata_rata_setoran ?? 0)}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text3)" }}>{t.statAvgSub}</p>
        </Card>
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
        <Card>
          <CardHeader title={t.chart1Title} sub={t.chart1Sub} />
          <div style={{ padding: "16px 20px" }}>
            {chartBulanan.some(d => d.nilai > 0)
              ? <ChartSetoranBulanan data={chartBulanan} />
              : <Empty Icon={BarChart2} text={t.emptyChart} />}
          </div>
        </Card>

        <Card>
          <CardHeader title={t.chart2Title} sub={t.chart2Sub} />
          <div style={{ padding: "16px 20px" }}>
            {chartKomposisi.length > 0
              ? <ChartKomposisiSampah data={chartKomposisi} />
              : <Empty Icon={Recycle} text={t.emptyPie} />}
          </div>
        </Card>
      </div>

      {/* ── Area Chart ── */}
      <Card>
        <CardHeader title={t.chart3Title} sub={t.chart3Sub} />
        <div style={{ padding: "16px 20px" }}>
          {chartBulanan.some(d => d.akumulasi > 0)
            ? <ChartAkumulasiTabungan data={chartBulanan} />
            : <Empty Icon={TrendingUp} text={t.emptyAcc} />}
        </div>
      </Card>

      {/* ── Transaksi Terbaru ── */}
      <Card>
        <CardHeader
          title={t.txnTitle}
          action={
            <Link href="/laporan" style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              fontSize: "12px", fontWeight: 600,
              color: "var(--p)", textDecoration: "none",
            }}>
              {t.txnSeeAll}
              <ArrowRight size={12} strokeWidth={2.5} />
            </Link>
          }
        />
        {transaksiTerbaru.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px",
              background: "var(--surf3)", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "var(--text3)", margin: "0 auto 12px",
            }}>
              <ClipboardList size={24} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: "13px", color: "var(--text3)", marginBottom: "14px" }}>
              {t.txnEmpty}
            </p>
            <Link href="/transaksi" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "var(--p)", color: "#fff",
              borderRadius: "8px", padding: "8px 16px",
              fontSize: "12px", fontWeight: 700, textDecoration: "none",
            }}>
              <Plus size={14} strokeWidth={2.5} />
              {t.txnEmptyBtn}
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--bdr)" }}>
                  {[t.txnColNasabah, t.txnColJenis, t.txnColBerat, t.txnColNilai, t.txnColTgl].map((h, i) => (
                    <th key={i} style={{
                      padding: "10px 16px",
                      textAlign: i > 1 ? "right" : "left",
                      fontSize: "10px", fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: "0.7px",
                      color: "var(--text3)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transaksiTerbaru.map((t2: any, i: number) => (
                  <tr key={t2.id} style={{
                    borderBottom: i < transaksiTerbaru.length - 1
                      ? "1px solid var(--bdr)" : "none",
                  }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text)" }}>
                      {t2.nasabah?.nama_lengkap ?? "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        background: "var(--p5)", color: "var(--p)",
                        borderRadius: "6px", padding: "3px 9px",
                        fontSize: "11px", fontWeight: 600,
                      }}>{t2.sampah?.nama_sampah ?? "—"}</span>
                    </td>
                    <td style={{
                      padding: "12px 16px", textAlign: "right",
                      color: "var(--text2)", fontWeight: 500,
                    }}>
                      {t2.berat_kg} kg
                    </td>
                    <td style={{
                      padding: "12px 16px", textAlign: "right",
                      fontWeight: 700, color: "var(--p)",
                    }}>
                      {formatRupiah(t2.nilai_bersih)}
                    </td>
                    <td style={{
                      padding: "12px 16px", textAlign: "right",
                      fontSize: "11px", color: "var(--text3)",
                    }}>
                      {formatTanggalPendek(t2.tanggal_setor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Lebaran Alert ── */}
      {(metrics?.total_liabilities ?? 0) > 0 && (
        <div style={{
          background: "var(--acc2)",
          border: "1px solid rgba(217,119,6,0.2)",
          borderRadius: "var(--r)", padding: "18px 20px",
          display: "flex", gap: "14px", alignItems: "flex-start",
          transition: "background 0.25s",
        }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "11px",
            background: "rgba(217,119,6,0.12)", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--acc)",
          }}>
            <AlertTriangle size={18} strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: "var(--acc)", fontSize: "14px" }}>
              {t.lebaranTitle}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text2)", marginTop: "5px", lineHeight: 1.65 }}>
              Total{" "}
              <strong style={{ color: "var(--acc)" }}>
                {formatRupiah(metrics?.total_liabilities ?? 0)}
              </strong>{" "}
              {lang === "en"
                ? "must be prepared for Eid disbursement. Ensure sufficient physical cash."
                : "harus disiapkan untuk pencairan lebaran. Pastikan kas fisik sudah mencukupi."}
            </p>
            <Link href="/penarikan" style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              marginTop: "12px", background: "var(--acc)", color: "#fff",
              borderRadius: "8px", padding: "7px 14px",
              fontSize: "12px", fontWeight: 700, textDecoration: "none",
            }}>
              {t.lebaranBtn}
              <ArrowRight size={12} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}