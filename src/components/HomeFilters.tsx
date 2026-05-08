'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  provinces: Array<{ name: string; count: number }>;
  total: number;
  filtered: number;
  hasData: number;
}

export function HomeFilters({ provinces, total, filtered, hasData }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const province = params.get('province') ?? '';
  const onlyData = params.get('only') === 'data';

  function update(next: { q?: string; province?: string; only?: string | null }) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === undefined || v === '') sp.delete(k);
      else sp.set(k, v);
    }
    const qs = sp.toString();
    router.push(qs ? `/?${qs}` : '/');
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200/80 bg-white p-3">
      <input
        defaultValue={q}
        onChange={e => {
          const v = e.target.value;
          // debounce-lite: 也可以加 setTimeout，但 SSR 跳转每次按键略多，简单起见 onBlur 提交
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') update({ q: (e.target as HTMLInputElement).value });
        }}
        onBlur={e => update({ q: e.target.value })}
        placeholder="搜城市或省份…"
        className="min-w-[180px] flex-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
      />

      <select
        value={province}
        onChange={e => update({ province: e.target.value })}
        className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm"
      >
        <option value="">所有省份</option>
        {provinces.map(p => (
          <option key={p.name} value={p.name}>
            {p.name} ({p.count})
          </option>
        ))}
      </select>

      <button
        onClick={() => update({ only: onlyData ? null : 'data' })}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          onlyData
            ? 'bg-neutral-900 text-white'
            : 'bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-100'
        }`}
        title="仅显示有详细数据的城市"
      >
        仅含详细数据 <span className="text-[10px] opacity-70">{hasData}</span>
      </button>

      {(q || province || onlyData) && (
        <Link
          href="/"
          className="text-xs text-neutral-500 hover:text-neutral-800"
        >
          清除
        </Link>
      )}

      <span className="ml-auto text-xs text-neutral-500">
        {filtered === total ? `${total} 个城市` : `${filtered} / ${total}`}
      </span>
    </div>
  );
}
