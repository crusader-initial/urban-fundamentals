import Link from 'next/link';
import { listCities, getMetricForCity } from '@/lib/db';
import { computeProvinceStats, normalizeProvince } from '@/lib/province-stats';
import { TierBadge } from '@/components/TierBadge';
import { HomeMap } from '@/components/HomeMap';

const TIER_FILTERS = ['全部', '一线', '新一线', '二线'] as const;

interface CityCard {
  code: string;
  name: string;
  tier: string;
  province: string;       // 全称（normalized）
  region: string;
  gdp: number | null;
  pop: number | null;
  perCapita: number | null;
  growth: number | null;
}

function fmt(v: number | null, unit: string): string {
  if (v == null) return '—';
  if (unit === '元' && v >= 10000) return `${Math.round(v / 1000) / 10}万`;
  if (unit === '亿元' && v >= 10000) return `${(v / 10000).toFixed(2)}万亿`;
  return v.toLocaleString();
}

function buildHref(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const qs = sp.toString();
  return qs ? `/?${qs}` : '/';
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; province?: string }>;
}) {
  const { tier = '全部', province } = await searchParams;
  const all = listCities();
  const cards: CityCard[] = all.map(c => ({
    code: c.code,
    name: c.name,
    tier: c.tier,
    province: normalizeProvince(c.province),
    region: c.region,
    gdp: getMetricForCity(c.code, 'gdp')?.valueNum ?? null,
    pop: getMetricForCity(c.code, 'permanent_pop')?.valueNum ?? null,
    perCapita: getMetricForCity(c.code, 'gdp_per_capita')?.valueNum ?? null,
    growth: getMetricForCity(c.code, 'gdp_growth')?.valueNum ?? null,
  }));

  let filtered = cards;
  if (tier !== '全部') filtered = filtered.filter(c => c.tier === tier);
  if (province) filtered = filtered.filter(c => c.province === province);
  filtered.sort((a, b) => (b.gdp ?? 0) - (a.gdp ?? 0));

  const tierCounts: Record<string, number> = { 全部: cards.length };
  for (const c of cards) tierCounts[c.tier] = (tierCounts[c.tier] ?? 0) + 1;

  const provinceStats = computeProvinceStats();

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">城市基本面</h1>
          <span className="text-sm text-neutral-500">Top 50 中国城市数据</span>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
          覆盖经济、产业、人口、房价、就业、城市资源 6 大维度共 27 项指标，
          含 2020-2023 年 GDP / 人口 / 财政历史。点击地图省份或下方城市卡看详情。
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-neutral-700">
            省份分布 · 按总 GDP 着色
          </h2>
          <span className="text-xs text-neutral-400">
            悬停看省内城市，点击筛选
          </span>
        </div>
        <HomeMap data={provinceStats} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {TIER_FILTERS.map(t => {
            const active = t === tier;
            return (
              <Link
                key={t}
                href={buildHref({ tier: t === '全部' ? undefined : t, province })}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {t}
                <span
                  className={`text-[10px] ${active ? 'text-white/70' : 'text-neutral-400'}`}
                >
                  {tierCounts[t] ?? 0}
                </span>
              </Link>
            );
          })}
          {province && (
            <Link
              href={buildHref({ tier: tier === '全部' ? undefined : tier })}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200 hover:bg-amber-100"
            >
              {province}
              <span aria-hidden className="text-[14px] leading-none">×</span>
            </Link>
          )}
          <span className="ml-auto text-xs text-neutral-500">{filtered.length} 个城市</span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map(c => (
          <Link
            key={c.code}
            href={`/city/${c.code}`}
            className="group flex flex-col rounded-xl border border-neutral-200/80 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{c.name}</h3>
                <div className="mt-0.5 text-[11px] text-neutral-500">
                  {c.region} · {c.province}
                </div>
              </div>
              <TierBadge tier={c.tier} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-400">GDP</div>
                <div className="font-semibold tabular-nums">
                  {fmt(c.gdp, '亿元')}
                  <span className="ml-0.5 text-[10px] font-normal text-neutral-400">亿元</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-400">人口</div>
                <div className="font-semibold tabular-nums">
                  {c.pop ? c.pop.toLocaleString() : '—'}
                  <span className="ml-0.5 text-[10px] font-normal text-neutral-400">万</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-400">人均</div>
                <div className="font-semibold tabular-nums">
                  {fmt(c.perCapita, '元')}
                  <span className="ml-0.5 text-[10px] font-normal text-neutral-400">元</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-400">增速</div>
                <div
                  className={`font-semibold tabular-nums ${
                    c.growth != null
                      ? c.growth >= 5
                        ? 'text-emerald-600'
                        : c.growth >= 3
                        ? 'text-neutral-700'
                        : 'text-amber-600'
                      : ''
                  }`}
                >
                  {c.growth != null ? `${c.growth.toFixed(1)}%` : '—'}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
            没有符合筛选条件的城市
          </div>
        )}
      </section>
    </div>
  );
}
