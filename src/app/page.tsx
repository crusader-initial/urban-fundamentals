import Link from 'next/link';
import { listCities, getMetricForCity } from '@/lib/db';
import {
  computePrefectureStats,
  listProvinces,
  aggregateByProvince,
} from '@/lib/prefecture-stats';
import { normalizeProvince } from '@/lib/province-stats';
import { TierBadge } from '@/components/TierBadge';
import { MapTabs } from '@/components/MapTabs';
import { HomeFilters } from '@/components/HomeFilters';

const DEFAULT_LIMIT = 60;

interface CityCard {
  code: string;
  name: string;
  tier: string;
  province: string;
  region: string;
  gdp: number | null;
  pop: number | null;
  hasFullData: boolean;
}

function fmt(v: number | null, unit: '亿元' | '万人'): string {
  if (v == null) return '—';
  if (unit === '亿元' && v >= 10000) return `${(v / 10000).toFixed(2)}万亿`;
  return v.toLocaleString();
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; province?: string; only?: string }>;
}) {
  const { q = '', province = '', only } = await searchParams;

  const allDbCities = listCities();
  const cards: CityCard[] = allDbCities.map(c => {
    const gdp = getMetricForCity(c.code, 'gdp')?.valueNum ?? null;
    const pop = getMetricForCity(c.code, 'permanent_pop')?.valueNum ?? null;
    return {
      code: c.code,
      name: c.name,
      tier: c.tier,
      province: normalizeProvince(c.province),
      region: c.region,
      gdp,
      pop,
      hasFullData: c.tier !== '其他',
    };
  });

  const total = cards.length;
  const hasDataCount = cards.filter(c => c.hasFullData).length;

  let filtered = cards;
  if (q) {
    const qq = q.toLowerCase();
    filtered = filtered.filter(
      c =>
        c.name.includes(q) ||
        c.code.toLowerCase().includes(qq) ||
        c.province.includes(q),
    );
  }
  if (province) filtered = filtered.filter(c => c.province === province);
  if (only === 'data') filtered = filtered.filter(c => c.hasFullData);

  // 排序：有完整数据的优先；其次按 GDP；空 GDP 排尾
  filtered.sort((a, b) => {
    if (a.hasFullData !== b.hasFullData) return a.hasFullData ? -1 : 1;
    return (b.gdp ?? -Infinity) - (a.gdp ?? -Infinity);
  });

  const filterActive = !!(q || province || only === 'data');
  const display = filterActive ? filtered : filtered.slice(0, DEFAULT_LIMIT);
  const hiddenCount = filterActive ? 0 : Math.max(0, filtered.length - DEFAULT_LIMIT);

  const prefStats = computePrefectureStats();
  const provinces = listProvinces();
  const provinceAgg = aggregateByProvince(prefStats).map(p => ({
    name: p.name,
    prefectureCount: p.prefectureCount,
    hasDataCount: p.hasDataCount,
    totalGdp: p.totalGdp,
  }));

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">城市基本面</h1>
          <span className="text-sm text-neutral-500">
            全国 {total} 个地级行政区，{hasDataCount} 个详细数据
          </span>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
          覆盖中国全部地级市/自治州/盟。Top 50 重点城市有 27 项指标 + 4
          年趋势；其余城市仅含名称/省份等基础信息，待补。
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-neutral-700">
            地理分布 · 按 GDP 着色
          </h2>
          <span className="text-xs text-neutral-400">
            两种视图：全国直连 · 省份钻取
          </span>
        </div>
        <MapTabs prefectures={prefStats} provinces={provinceAgg} />
      </section>

      <section className="space-y-3">
        <HomeFilters
          provinces={provinces}
          total={total}
          filtered={filtered.length}
          hasData={hasDataCount}
        />

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {display.map(c => (
            <Link
              key={c.code}
              href={`/city/${c.code}`}
              className={`group flex flex-col rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                c.hasFullData
                  ? 'border-neutral-200/80 bg-white hover:border-neutral-400'
                  : 'border-dashed border-neutral-200 bg-neutral-50/60 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold tracking-tight">{c.name}</h3>
                  <div className="mt-0.5 text-[11px] text-neutral-500">
                    {c.region} · {c.province}
                  </div>
                </div>
                {c.hasFullData ? (
                  <TierBadge tier={c.tier} />
                ) : (
                  <span className="text-[10px] text-neutral-400">基础</span>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400">GDP</div>
                  <div className="font-semibold tabular-nums">
                    {fmt(c.gdp, '亿元')}
                    {c.gdp != null && (
                      <span className="ml-0.5 text-[10px] font-normal text-neutral-400">亿元</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400">人口</div>
                  <div className="font-semibold tabular-nums">
                    {fmt(c.pop, '万人')}
                    {c.pop != null && (
                      <span className="ml-0.5 text-[10px] font-normal text-neutral-400">万</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {display.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
              没有符合筛选条件的城市
            </div>
          )}
        </section>

        {hiddenCount > 0 && (
          <p className="text-center text-xs text-neutral-500">
            还有 {hiddenCount} 个城市未显示，使用上方搜索/筛选查看。
          </p>
        )}
      </section>
    </div>
  );
}
