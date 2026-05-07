'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';

export interface TrendPoint {
  asOf: string;
  valueNum: number;
}

interface Props {
  title: string;
  unit: string;
  series: TrendPoint[];
  color?: string;
}

export function TrendChart({ title, unit, series, color = '#2563eb' }: Props) {
  if (series.length < 2) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-5">
        <h3 className="mb-2 text-sm font-semibold text-neutral-700">{title}</h3>
        <p className="text-xs text-neutral-500">暂无足够历史数据（需 ≥ 2 个时间点）</p>
      </div>
    );
  }

  const data = series.map(p => ({ asOf: p.asOf, value: p.valueNum }));
  const last = data[data.length - 1];
  const first = data[0];
  const delta = last.value - first.value;
  const pct = ((delta / first.value) * 100).toFixed(1);
  const sign = delta >= 0 ? '+' : '';

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-neutral-700">{title}</h3>
        <span className={`text-xs ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {first.asOf} → {last.asOf}: {sign}
          {pct}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="asOf" tick={{ fontSize: 11 }} stroke="#a3a3a3" />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="#a3a3a3"
            domain={['auto', 'auto']}
            tickFormatter={v => (v >= 10000 ? `${(v / 10000).toFixed(1)}万` : String(v))}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { asOf: string; value: number };
              return (
                <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm">
                  <div className="font-medium">{p.asOf}</div>
                  <div className="text-neutral-600">
                    {p.value.toLocaleString()} {unit}
                  </div>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 3 }}
            activeDot={{ r: 5 }}
          />
          <ReferenceDot x={last.asOf} y={last.value} r={5} fill={color} stroke="white" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
