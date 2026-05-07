import Link from 'next/link';
import { listCities, getMetricForCity } from '@/lib/db';

export default function Home() {
  const cities = listCities();
  const cards = cities.map(c => {
    const gdp = getMetricForCity(c.code, 'gdp');
    const pop = getMetricForCity(c.code, 'permanent_pop');
    return { ...c, gdp, pop };
  });

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">城市基本面分析</h1>
        <p className="text-sm text-neutral-600">
          覆盖经济、产业、人口、房价、就业、城市资源 6 大维度。点击城市查看详情，或前往
          <Link href="/compare" className="mx-1 text-blue-600 hover:underline">对比</Link>
          /
          <Link href="/chat" className="mx-1 text-blue-600 hover:underline">问答</Link>。
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map(c => (
          <Link
            key={c.code}
            href={`/city/${c.code}`}
            className="rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold">{c.name}</span>
              <span className="text-xs text-neutral-500">{c.tier}</span>
            </div>
            <div className="mt-1 text-xs text-neutral-500">{c.region} · {c.province}</div>
            <div className="mt-3 space-y-1 text-sm">
              {c.gdp && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">GDP</span>
                  <span className="font-medium">
                    {c.gdp.valueNum?.toLocaleString()} {c.gdp.unit}
                  </span>
                </div>
              )}
              {c.pop && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">人口</span>
                  <span className="font-medium">
                    {c.pop.valueNum?.toLocaleString()} {c.pop.unit}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
