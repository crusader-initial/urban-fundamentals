'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { METRIC_DEFS, CATEGORY_LABELS, type MetricCategory } from '@/lib/types';

interface RankRow {
  code: string;
  name: string;
  valueNum: number;
  unit: string;
  asOf: string;
}

interface RankResponse {
  metric_key: string;
  label: string;
  unit: string;
  order: 'asc' | 'desc';
  results: RankRow[];
}

const RANKABLE = METRIC_DEFS.filter(m => m.key !== 'pillar_industries');

export default function RankPage() {
  const [metric, setMetric] = useState('gdp');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [limit, setLimit] = useState(15);
  const [data, setData] = useState<RankResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const meta = useMemo(() => RANKABLE.find(m => m.key === metric), [metric]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/rank?metric=${metric}&order=${order}&limit=${limit}`)
      .then(r => r.json())
      .then((d: RankResponse) => setData(d))
      .finally(() => setLoading(false));
  }, [metric, order, limit]);

  const grouped = useMemo(() => {
    const out: Record<MetricCategory, typeof RANKABLE> = {
      economy: [],
      industry: [],
      population: [],
      housing: [],
      jobs: [],
      resources: [],
    };
    for (const m of RANKABLE) out[m.category].push(m);
    return out;
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [];
    return [...data.results].reverse().map(r => ({
      name: r.name,
      value: r.valueNum,
      unit: r.unit,
    }));
  }, [data]);

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">城市排名</h1>
        <p className="text-sm text-neutral-600">
          挑一个指标看 50 城里的排名分布。指标含义和单位见
          <a href="/" className="mx-1 text-blue-600 hover:underline">城市</a>页详情。
        </p>
      </header>

      <section className="flex flex-wrap items-end gap-4 rounded-lg border border-neutral-200 bg-white p-4">
        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          指标
          <select
            value={metric}
            onChange={e => setMetric(e.target.value)}
            className="min-w-[200px] rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
          >
            {(Object.keys(grouped) as MetricCategory[]).map(cat => (
              <optgroup key={cat} label={CATEGORY_LABELS[cat]}>
                {grouped[cat].map(m => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          排序
          <select
            value={order}
            onChange={e => setOrder(e.target.value as 'asc' | 'desc')}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="desc">从高到低</option>
            <option value="asc">从低到高</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-neutral-500">
          数量
          <select
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
            <option value={30}>Top 30</option>
            <option value={50}>全部 50</option>
          </select>
        </label>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-neutral-700">
            {meta?.label} {meta?.higherIsBetter === false ? '（越低越好）' : ''}
          </h2>
          <span className="text-xs text-neutral-400">
            {data?.results[0]?.asOf ? `数据时间 ${data.results[0].asOf}` : ''}
          </span>
        </div>

        {loading || !data ? (
          <div className="py-12 text-center text-sm text-neutral-500">加载中…</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 28)}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ left: 8, right: 60, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e5e5" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#a3a3a3" />
              <YAxis
                type="category"
                dataKey="name"
                width={70}
                tick={{ fontSize: 12 }}
                stroke="#525252"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as { name: string; value: number; unit: string };
                  return (
                    <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-neutral-600">
                        {p.value.toLocaleString()} {p.unit}
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" fill="#2563eb" radius={[0, 3, 3, 0]}>
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v) => (typeof v === 'number' ? v.toLocaleString() : '')}
                  style={{ fontSize: 11, fill: '#525252' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
