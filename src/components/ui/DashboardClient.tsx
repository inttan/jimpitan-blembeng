"use client";
import Link from "next/link";
import { useLang } from "@/components/providers/LangProvider";
import { formatRupiah, formatTanggalPendek } from "@/lib/utils";
import {
  ChartSetoranBulanan,
  ChartKomposisiSampah,
  ChartAkumulasiTabungan,
} from "@/components/ui/Charts";

/* ─── Types ─── */
interface DashboardData {
  metrics: any;
  nasabahStats: any;
  transaksiTerbaru: any[];
  chartBulanan: any[];
  chartKomposisi: any[];
}

/* ─── Stat Card ─── */
function StatCard({
  label, value, sub, icon, accent = false,
}: {
  label: string; value: string; sub?: string;
  icon: string; accent?: boolean;
}) {
  return (
    <div style={{
      background: accent ? "var(--p)" : "var(--surf)",
      border: `1px solid ${accent ? "transparent" : "var(--bdr)"}`,
      borderRadius: "var(--r)", padding: "18px",
      boxShadow: "var(--shd)", transition: "all 0.2s",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "-16px", right: "-16px",
        width: "72px", height: "72px", borderRadius: "50%",
        background: accent ? "rgba(255,255,255,0.08)" : "var(--p6)",
      }} />
      <div style={{
        width: "36px", height: "36px", borderRadius: "10px",
        background: accent ? "rgba(255,255,255,0.15)" : "var(--p6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "18px", marginBottom: "12px",
      }}>{icon}</div>
      <p style={{
        fontSize: "10px", fontWeight: 600, letterSpacing: "0.6px",
        textTransform: "uppercase",
        color: accent ? "rgba(255,255,255,0.65)" : "var(--text3)",
        marginBottom: "4px",
      }}>{label}</p>
      <p style={{
        fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px",
        color: accent ? "#fff" : "var(--text)", lineHeight: 1,
      }}>{value}</p>
      {sub && (
        <p style={{
          fontSize: "11px", marginTop: "5px",
          color: accent ? "rgba(255,255,255,0.55)" : "var(--text3)",
        }}>{sub}</p>
      )}
    </div>
  );
}

/* ─── Section Card ─── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--surf)", border: "1px solid var(--bdr)",
      borderRadius: "var(--r)", boxShadow: "var(--shd)",
      transition: "background 0.3s", ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Section Header ─── */
function CardHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      padding: "18px 20px", borderBottom: "1px solid var(--bdr)",
    }}>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{title}</p>
        {sub && <p style={{ fontSize: "11px", color: "var(--text3)", marginTop: "3px" }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ─── Empty State ─── */
function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{
      height: "180px", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "8px",
    }}>
      <div style={{
        width: "48px", height: "48px", borderRadius: "14px",
        background: "var(--surf3)", display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: "22px",
      }}>{icon}</div>
      <p style={{ fontSize: "12px", color: "var(--text3)" }}>{text}</p>
    </div>
  );
}

/* ─── Main Component ─── */
export default function DashboardClient({
  metrics, nasabahStats, transaksiTerbaru, chartBulanan, chartKomposisi,
}: DashboardData) {
  const { t, lang } = useLang();

  const totalNasabahSub = t.totalNasabah.replace(
    "{n}", String(nasabahStats?.total_nasabah ?? 0)
  );

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── Hero Header ── */}
      <div style={{
        background: "var(--surf)", border: "1px solid var(--bdr)",
        borderRadius: "var(--r)", padding: "20px 24px",
        boxShadow: "var(--shd)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "14px",
            background: "var(--p5)", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "24px",
          }}>♻</div>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.3px" }}>
              {t.greetTitle} 👋
            </h1>
            <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "3px" }}>{t.greetSub}</p>
          </div>
        </div>
        <Link href="/transaksi" style={{
          background: "var(--p)", color: "#fff", borderRadius: "10px",
          padding: "10px 18px", fontSize: "13px", fontWeight: 700,
          textDecoration: "none", transition: "opacity 0.2s",
          boxShadow: "0 4px 12px rgba(30,92,58,0.3)",
        }}>
          {t.btnCatat}
        </Link>
      </div>

      {/* ── KPI Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
        <StatCard accent label={t.kpi1Label} icon="🏦"
          value={formatRupiah(metrics?.total_liabilities ?? 0)}
          sub={t.kpi1Sub} />
        <StatCard label={t.kpi2Label} icon="💼"
          value={formatRupiah(metrics?.total_kas_terkumpul ?? 0)}
          sub={t.kpi2Sub} />
        <StatCard label={t.kpi3Label} icon="♻️"
          value={`${(metrics?.total_sampah_kg ?? 0).toFixed(1)} kg`}
          sub={t.kpi3Sub} />
        <StatCard label={t.kpi4Label} icon="👥"
          value={String(nasabahStats?.nasabah_aktif ?? 0)}
          sub={totalNasabahSub} />
      </div>

      {/* ── Secondary Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Card style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--text3)" }}>
            {t.statTxnLabel}
          </p>
          <p style={{ fontSize: "36px", fontWeight: 800, color: "var(--text)", lineHeight: 1.1, margin: "6px 0 2px" }}>
            {metrics?.transaksi_hari_ini ?? 0}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text3)" }}>{t.statTxnSub}</p>
        </Card>
        <Card style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--text3)" }}>
            {t.statAvgLabel}
          </p>
          <p style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)", lineHeight: 1.1, margin: "6px 0 2px" }}>
            {formatRupiah(metrics?.rata_rata_setoran ?? 0)}
          </p>
          <p style={{ fontSize: "11px", color: "var(--text3)" }}>{t.statAvgSub}</p>
        </Card>
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }} className="lg-grid-3">
        <Card style={{ gridColumn: "span 2" }}>
          <CardHeader title={t.chart1Title} sub={t.chart1Sub} />
          <div style={{ padding: "16px 20px" }}>
            {chartBulanan.some(d => d.nilai > 0)
              ? <ChartSetoranBulanan data={chartBulanan} />
              : <Empty icon="📊" text={t.emptyChart} />}
          </div>
        </Card>

        <Card>
          <CardHeader title={t.chart2Title} sub={t.chart2Sub} />
          <div style={{ padding: "16px 20px" }}>
            {chartKomposisi.length > 0
              ? <ChartKomposisiSampah data={chartKomposisi} />
              : <Empty icon="♻️" text={t.emptyPie} />}
          </div>
        </Card>
      </div>

      {/* ── Area Chart ── */}
      <Card>
        <CardHeader title={t.chart3Title} sub={t.chart3Sub} />
        <div style={{ padding: "16px 20px" }}>
          {chartBulanan.some(d => d.akumulasi > 0)
            ? <ChartAkumulasiTabungan data={chartBulanan} />
            : <Empty icon="📈" text={t.emptyAcc} />}
        </div>
      </Card>

      {/* ── Transaksi Terbaru ── */}
      <Card>
        <CardHeader
          title={t.txnTitle}
          action={
            <Link href="/transaksi" style={{
              fontSize: "12px", fontWeight: 600, color: "var(--p)", textDecoration: "none",
            }}>{t.txnSeeAll}</Link>
          }
        />
        {transaksiTerbaru.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px",
              background: "var(--surf3)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "26px", margin: "0 auto 12px",
            }}>📋</div>
            <p style={{ fontSize: "13px", color: "var(--text3)", marginBottom: "12px" }}>{t.txnEmpty}</p>
            <Link href="/transaksi" style={{
              background: "var(--p)", color: "#fff", borderRadius: "8px",
              padding: "8px 16px", fontSize: "12px", fontWeight: 700,
              textDecoration: "none",
            }}>{t.txnEmptyBtn}</Link>
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
                      textTransform: "uppercase", letterSpacing: "0.6px",
                      color: "var(--text3)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transaksiTerbaru.map((t2: any, i: number) => (
                  <tr key={t2.id} style={{
                    borderBottom: i < transaksiTerbaru.length - 1 ? "1px solid var(--bdr)" : "none",
                    transition: "background 0.15s",
                  }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text)" }}>
                      {t2.nasabah?.nama_lengkap ?? "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        background: "var(--p5)", color: "var(--p)",
                        borderRadius: "6px", padding: "3px 8px",
                        fontSize: "11px", fontWeight: 600,
                      }}>{t2.sampah?.nama_sampah ?? "—"}</span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--text2)" }}>
                      {t2.berat_kg} kg
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--p)" }}>
                      {formatRupiah(t2.nilai_bersih)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "11px", color: "var(--text3)" }}>
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
          background: "var(--acc2)", border: "1px solid rgba(232,160,32,0.3)",
          borderRadius: "var(--r)", padding: "18px 20px",
          display: "flex", gap: "14px", alignItems: "flex-start",
          transition: "background 0.3s",
        }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: "rgba(232,160,32,0.15)", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
          }}>🕌</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: "var(--acc)", fontSize: "14px" }}>{t.lebaranTitle}</p>
            <p style={{ fontSize: "12px", color: "var(--text2)", marginTop: "4px", lineHeight: 1.6 }}>
              Total <strong style={{ color: "var(--acc)" }}>{formatRupiah(metrics?.total_liabilities ?? 0)}</strong>{" "}
              {lang === "en"
                ? "must be prepared for Eid disbursement. Ensure sufficient physical cash."
                : "harus disiapkan untuk pencairan lebaran. Pastikan kas fisik sudah mencukupi."}
            </p>
            <Link href="/penarikan" style={{
              display: "inline-block", marginTop: "10px",
              background: "var(--acc)", color: "#fff",
              borderRadius: "8px", padding: "7px 14px",
              fontSize: "12px", fontWeight: 700, textDecoration: "none",
            }}>{t.lebaranBtn}</Link>
          </div>
        </div>
      )}
    </div>
  );
}