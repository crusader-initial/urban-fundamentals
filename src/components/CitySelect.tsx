'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { City } from '@/lib/types';

export function CitySelect({
  cities,
  paramKey,
  selected,
  label,
}: {
  cities: City[];
  paramKey: string;
  selected: string;
  label: string;
}) {
  const router = useRouter();
  const search = useSearchParams();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-neutral-500">{label}</span>
      <select
        value={selected}
        onChange={e => {
          const next = new URLSearchParams(search.toString());
          next.set(paramKey, e.target.value);
          router.push(`/compare?${next.toString()}`);
        }}
        className="rounded-md border border-neutral-300 bg-white px-3 py-1.5"
      >
        <option value="">选择城市…</option>
        {cities.map(c => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
