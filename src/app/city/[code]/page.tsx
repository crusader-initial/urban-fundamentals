import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCityWithMetrics, getMetricSeries, listCities } from '@/lib/db';
import { METRIC_DEFS, CATEGORY_LABELS, type MetricCategory } from '@/lib/types';
import { MetricRow } from '@/components/MetricRow';
import { TrendChart } from '@/components/TrendChart';

export function generateStaticParams() {
  return listCities().map(c => ({ code: c.code }));
}

const TREND_METRICS: Array<{ key: string; title: string; unit: string; color: string }> = [
  { key: 'gdp', title: 'GDP 趋势', unit: '亿元', color: '#2563eb' },
  { key: 'permanent_pop', title: '常住人口趋势', unit: '万人', color: '#10b981' },
  { key: 'public_revenue', title: '一般公共预算收入趋势', unit: '亿元', color: '#f59e0b' },
];

export default async function CityPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const city = getCityWithMetrics(code);
  if (!city) notFound();

  const categories = Array.from(new Set(METRIC_DEFS.map(m => m.category))) as MetricCategory[];
  const sources = Array.from(
    new Set(Object.values(city.metrics).map(m => `${m.source}（${m.asOf}）`)),
  );
  const trends = TREND_METRICS.map(t => ({ ...t, series: getMetricSeries(code, t.key) }));

  return (
    <div className="space-y-8">
      <section className="flex items-baseline justify-between">
        <div>
          <div className="text-xs text-neutral-500">{city.region} · {city.province} · {city.tier}</div>
          <h1 className="text-3xl font-semibold tracking-tight">{city.name}</h1>
        </div>
        <Link
          href={`/compare?a=${city.code}`}
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:border-neutral-500"
        >
          与其他城市对比 →
        </Link>
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
            <div key={cat} className="rounded-lg border border-neutral-200 bg-white p-5">
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

      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">数据来源</h2>
        <ul className="space-y-1 text-xs text-neutral-500">
          {sources.map(s => (
            <li key={s}>· {s}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
