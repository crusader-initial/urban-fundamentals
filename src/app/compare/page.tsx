import { listCities, getCityWithMetrics, metricRange } from '@/lib/db';
import { METRIC_DEFS, CATEGORY_LABELS, type MetricCategory } from '@/lib/types';
import { formatMetric } from '@/components/MetricRow';
import { CitySelect } from '@/components/CitySelect';
import { CompareChart, type CompareChartRow } from '@/components/CompareChart';

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { a = '', b = '' } = await searchParams;
  const cities = listCities();
  const cityA = a ? getCityWithMetrics(a) : null;
  const cityB = b ? getCityWithMetrics(b) : null;
  const categories = Array.from(new Set(METRIC_DEFS.map(m => m.category))) as MetricCategory[];

  function winner(key: string): 'a' | 'b' | null {
    if (!cityA || !cityB) return null;
    const meta = METRIC_DEFS.find(d => d.key === key);
    if (!meta || meta.higherIsBetter === undefined) return null;
    const va = cityA.metrics[key]?.valueNum;
    const vb = cityB.metrics[key]?.valueNum;
    if (va == null || vb == null || va === vb) return null;
    const aWins = meta.higherIsBetter ? va > vb : va < vb;
    return aWins ? 'a' : 'b';
  }

  function buildChartRows(cat: MetricCategory): CompareChartRow[] {
    if (!cityA || !cityB) return [];
    return METRIC_DEFS.filter(m => m.category === cat)
      .filter(m => cityA.metrics[m.key]?.valueNum != null || cityB.metrics[m.key]?.valueNum != null)
      .map(m => {
        const range = metricRange(m.key);
        const rawA = cityA.metrics[m.key]?.valueNum ?? null;
        const rawB = cityB.metrics[m.key]?.valueNum ?? null;
        const norm = (v: number | null) => {
          if (v == null || !range || range.max === range.min) return 0;
          return ((v - range.min) / (range.max - range.min)) * 100;
        };
        return {
          label: m.label,
          rawA,
          rawB,
          normA: norm(rawA),
          normB: norm(rawB),
          unit: m.unit,
        };
      });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">城市对比</h1>
        <div className="flex flex-wrap gap-4">
          <CitySelect cities={cities} paramKey="a" selected={a} label="城市 A" />
          <CitySelect cities={cities} paramKey="b" selected={b} label="城市 B" />
        </div>
      </section>

      {!cityA || !cityB ? (
        <p className="rounded-md border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
          请选择两个城市开始对比。绿色高亮表示该指标在&ldquo;越高越好&rdquo;或&ldquo;越低越好&rdquo;维度上胜出方。条形图把每项指标按 50 城范围归一化到 0–100，便于看相对位置。
        </p>
      ) : (
        <section className="space-y-6">
          {categories.map(cat => {
            const defs = METRIC_DEFS.filter(m => m.category === cat);
            const chartRows = buildChartRows(cat);
            return (
              <div key={cat} className="space-y-3">
                {chartRows.length > 0 && (
                  <CompareChart
                    title={CATEGORY_LABELS[cat]}
                    cityA={cityA.name}
                    cityB={cityB.name}
                    rows={chartRows}
                  />
                )}
                <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-2 text-xs font-semibold text-neutral-600">
                    {CATEGORY_LABELS[cat]} · 明细
                  </div>
                  <table className="w-full text-sm">
                    <thead className="text-xs text-neutral-500">
                      <tr>
                        <th className="w-1/3 px-5 py-2 text-left font-normal">指标</th>
                        <th className="px-5 py-2 text-right font-normal">{cityA.name}</th>
                        <th className="px-5 py-2 text-right font-normal">{cityB.name}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defs.map(d => {
                        const w = winner(d.key);
                        return (
                          <tr key={d.key} className="border-t border-neutral-100">
                            <td className="px-5 py-2 text-neutral-500">{d.label}</td>
                            <td
                              className={`px-5 py-2 text-right font-medium ${w === 'a' ? 'text-emerald-600' : ''}`}
                            >
                              {formatMetric(cityA.metrics[d.key])}
                            </td>
                            <td
                              className={`px-5 py-2 text-right font-medium ${w === 'b' ? 'text-emerald-600' : ''}`}
                            >
                              {formatMetric(cityB.metrics[d.key])}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
