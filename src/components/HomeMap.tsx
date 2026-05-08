'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChinaMap, type ProvincePayload } from './ChinaMap';

export function HomeMap({ data }: { data: ProvincePayload[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const selected = params.get('province') ?? undefined;

  const onSelect = (province: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (province) next.set('province', province);
    else next.delete('province');
    const qs = next.toString();
    router.push(qs ? `/?${qs}` : '/');
  };

  return <ChinaMap data={data} selected={selected} onSelect={onSelect} />;
}
