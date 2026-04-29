"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  Area, AreaChart,
} from "recharts";
import { formatRupiah } from "@/lib/utils";
import { useLang } from "@/components/providers/LangProvider";

/* ─── Shared tooltip style ─── */
const tooltipStyle: React.CSSProperties = {
  borderRadius: 10,
  border: "1px solid var(--bdr)",
  background: "var(--surf)",
  color: "var(--text)",
  fontSize: 12,
  boxShadow: "var(--shd)",
};

const tickStyle = { fontSize: 11, fill: "var(--text3)" };
const gridColor = "var(--bdr)";

const COLORS = [
  "#52B788", "#3B82F6", "#E8A020",
  "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16",
];

/* ─── Bar Chart: Setoran per Bulan ─── */
export function ChartSetoranBulanan({ data }: {
  data: { bulan: string; nilai: number; berat: number }[];
}) {
  const { t } = useLang();

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="bulan"
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}rb`}
        />
        <Tooltip
          formatter={(value: any) => [formatRupiah(value), t.txnColNilai]}
          contentStyle={tooltipStyle}
          cursor={{ fill: "var(--surf3)", radius: 6 }}
        />
        <Bar
          dataKey="nilai"
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        >
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={i === data.length - 1 ? "var(--p)" : "var(--p4)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ─── Pie Chart: Komposisi Sampah ─── */
export function ChartKomposisiSampah({ data }: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="45%"
          innerRadius={52} outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any) => [`${Number(value).toFixed(1)} kg`, "Berat"]}
          contentStyle={tooltipStyle}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(val) => (
            <span style={{ color: "var(--text2)", fontWeight: 500 }}>{val}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ─── Area Chart: Akumulasi Tabungan ─── */
export function ChartAkumulasiTabungan({ data }: {
  data: { bulan: string; akumulasi: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradTabungan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--p3)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--p3)" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="bulan"
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}rb`}
        />
        <Tooltip
          formatter={(value: any) => [formatRupiah(value), "Total Tabungan"]}
          contentStyle={tooltipStyle}
        />
        <Area
          type="monotone"
          dataKey="akumulasi"
          stroke="var(--p3)"
          strokeWidth={2.5}
          fill="url(#gradTabungan)"
          dot={{ fill: "var(--p)", r: 3, strokeWidth: 0 }}
          activeDot={{ fill: "var(--p)", r: 5, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}