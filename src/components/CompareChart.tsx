'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export interface CompareChartRow {
  label: string;
  rawA: number | null;
  rawB: number | null;
  normA: number;
  normB: number;
  unit: string;
}

interface Props {
  title: string;
  cityA: string;
  cityB: string;
  rows: CompareChartRow[];
}

export function CompareChart({ title, cityA, cityB, rows }: Props) {
  const data = rows.map(r => ({
    label: r.label,
    [cityA]: r.normA,
    [cityB]: r.normB,
    rawA: r.rawA,
    rawB: r.rawB,
    unit: r.unit,
  }));

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-neutral-700">{title}</h3>
        <span className="text-xs text-neutral-400">归一化到 0–100（基于 50 城范围）</span>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(200, rows.length * 38)}>
        <BarChart layout="vertical" data={data} margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e5e5" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#a3a3a3" />
          <YAxis
            type="category"
            dataKey="label"
            width={110}
            tick={{ fontSize: 11 }}
            stroke="#a3a3a3"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as typeof data[number];
              const fmt = (v: number | null) =>
                v == null ? '—' : `${v.toLocaleString()} ${p.unit}`.trim();
              return (
                <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm">
                  <div className="font-medium">{p.label}</div>
                  <div className="text-neutral-600">{cityA}: {fmt(p.rawA)}</div>
                  <div className="text-neutral-600">{cityB}: {fmt(p.rawB)}</div>
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey={cityA} fill="#2563eb" radius={[0, 3, 3, 0]} />
          <Bar dataKey={cityB} fill="#f59e0b" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
