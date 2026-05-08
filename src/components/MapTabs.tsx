'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChinaMap, type PrefecturePayload } from './ChinaMap';
import { DrillDownMap, type ProvincePayload } from './DrillDownMap';

interface Props {
  prefectures: PrefecturePayload[];
  provinces: ProvincePayload[];
}

export function MapTabs({ prefectures, provinces }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const view = params.get('view') === 'drill' ? 'drill' : 'full';
  const selectedProvince = params.get('province');

  function update(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === '') sp.delete(k);
      else sp.set(k, v);
    }
    const qs = sp.toString();
    router.push(qs ? `/?${qs}` : '/');
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1 text-xs w-fit">
        <button
          type="button"
          onClick={() => update({ view: null })}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            view === 'full'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          全国地级市
        </button>
        <button
          type="button"
          onClick={() => update({ view: 'drill' })}
          className={`rounded-md px-3 py-1.5 transition-colors ${
            view === 'drill'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          省份钻取
        </button>
      </div>

      {view === 'full' ? (
        <ChinaMap
          data={prefectures}
          onSelect={code => {
            if (code) router.push(`/city/${code}`);
          }}
        />
      ) : (
        <DrillDownMap
          prefectures={prefectures}
          provinceData={provinces}
          selectedProvince={selectedProvince}
          onSelectProvince={name => update({ province: name })}
          onSelectCity={code => router.push(`/city/${code}`)}
        />
      )}
    </div>
  );
}
