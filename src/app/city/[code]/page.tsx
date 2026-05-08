import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCityWithMetrics, getMetricSeries } from '@/lib/db';
import { METRIC_DEFS, CATEGORY_LABELS, type MetricCategory } from '@/lib/types';
import { MetricRow } from '@/components/MetricRow';
import { TrendChart } from '@/components/TrendChart';
import { TierBadge } from '@/components/TierBadge';

// 367 城全部 SSR；不用 generateStaticParams（避免首次构建预渲染 367 页）

const TREND_METRICS: Array<{ key: string; title: string; unit: string; color: string }> = [
  { key: 'gdp', title: 'GDP 趋势', unit: '亿元', color: '#2563eb' },
  { key: 'permanent_pop', title: '常住人口趋势', unit: '万人', color: '#10b981' },
  { key: 'public_revenue', title: '一般公共预算收入趋势', unit: '亿元', color: '#f59e0b' },
];

interface KeyStat {
  label: string;
  value: string;
  unit: string;
  hint?: string;
}

function formatNumber(v: number | null | undefined, unit: string): KeyStat['value'] {
  if (v == null) return '—';
  if (unit === '亿元' && v >= 10000) return `${(v / 10000).toFixed(2)}`;
  if (unit === '元' && v >= 10000) return `${(v / 10000).toFixed(1)}`;
  return v.toLocaleString();
}

export default async function CityPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const city = getCityWithMetrics(code);
  if (!city) notFound();

  const categories = Array.from(new Set(METRIC_DEFS.map(m => m.category))) as MetricCategory[];
  const sources = Array.from(
    new Set(Object.values(city.metrics).map(m => `${m.source}（${m.asOf}）`)),
  );
  const trends = TREND_METRICS.map(t => ({ ...t, series: getMetricSeries(code, t.key) }));

  const gdp = city.metrics.gdp;
  const pop = city.metrics.permanent_pop;
  const perCapita = city.metrics.gdp_per_capita;
  const fiscal = city.metrics.public_revenue;
  const growth = city.metrics.gdp_growth;

  const keyStats: KeyStat[] = [
    {
      label: 'GDP',
      value:
        gdp?.valueNum != null && gdp.valueNum >= 10000
          ? `${(gdp.valueNum / 10000).toFixed(2)}`
          : formatNumber(gdp?.valueNum, '亿元'),
      unit: gdp?.valueNum != null && gdp.valueNum >= 10000 ? '万亿元' : '亿元',
      hint: growth?.valueNum != null ? `增速 ${growth.valueNum.toFixed(1)}%` : undefined,
    },
    {
      label: '常住人口',
      value: formatNumber(pop?.valueNum, '万人'),
      unit: '万人',
    },
    {
      label: '人均 GDP',
      value: formatNumber(perCapita?.valueNum, '元'),
      unit: perCapita?.valueNum != null && perCapita.valueNum >= 10000 ? '万元' : '元',
    },
    {
      label: '一般公共预算',
      value: formatNumber(fiscal?.valueNum, '亿元'),
      unit: fiscal?.valueNum != null && fiscal.valueNum >= 10000 ? '万亿元' : '亿元',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero card */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-white to-neutral-50">
        <div className="px-6 pt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Link href="/" className="hover:text-neutral-700">
                  ← 返回城市列表
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-semibold tracking-tight">{city.name}</h1>
                <TierBadge tier={city.tier} size="md" />
              </div>
              <div className="text-sm text-neutral-500">
                {city.region} · {city.province}
              </div>
            </div>
            <Link
              href={`/compare?a=${city.code}`}
              className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-700"
            >
              与其他城市对比 →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-neutral-200/70 sm:grid-cols-4 mt-6">
          {keyStats.map(s => (
            <div key={s.label} className="bg-white px-6 py-5">
              <div className="text-[11px] uppercase tracking-wider text-neutral-500">
                {s.label}
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-semibold tabular-nums tracking-tight">
                  {s.value}
                </span>
                <span className="text-xs text-neutral-500">{s.unit}</span>
              </div>
              {s.hint && (
                <div className="mt-1 text-[11px] text-neutral-400">{s.hint}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {trends.map(t => (
          <TrendChart
            key={t.key}
            title={t.title}
            unit={t.unit}
            series={t.series}
            color={t.color}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {categories.map(cat => {
          const defs = METRIC_DEFS.filter(m => m.category === cat);
          return (
            <div
              key={cat}
              className="rounded-xl border border-neutral-200/80 bg-white p-5"
            >
              <h2 className="mb-3 text-sm font-semibold text-neutral-700">
                {CATEGORY_LABELS[cat]}
              </h2>
              <div>
                {defs.map(d => (
                  <MetricRow key={d.key} metricKey={d.key} metric={city.metrics[d.key]} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-xl border border-neutral-200/80 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">数据来源</h2>
        <ul className="grid grid-cols-1 gap-1 text-xs text-neutral-500 sm:grid-cols-2">
          {sources.map(s => (
            <li key={s} className="truncate" title={s}>
              · {s}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
