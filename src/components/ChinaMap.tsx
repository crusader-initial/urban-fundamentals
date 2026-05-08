'use client';

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import { MapChart, type MapSeriesOption } from 'echarts/charts';
import {
  TooltipComponent,
  VisualMapComponent,
  TitleComponent,
  GeoComponent,
  type TooltipComponentOption,
  type VisualMapComponentOption,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  MapChart,
  TooltipComponent,
  VisualMapComponent,
  TitleComponent,
  GeoComponent,
  CanvasRenderer,
]);

type Option = echarts.ComposeOption<
  MapSeriesOption | TooltipComponentOption | VisualMapComponentOption
>;

export interface ProvincePayload {
  name: string;
  cityCount: number;
  totalGdp: number;
  cities: Array<{ code: string; name: string; tier: string; gdp: number | null }>;
}

interface Props {
  data: ProvincePayload[];
  selected?: string;
  onSelect: (province: string | null) => void;
}

let geoRegistered: Promise<void> | null = null;

async function ensureGeoRegistered(): Promise<void> {
  if (geoRegistered) return geoRegistered;
  geoRegistered = (async () => {
    const resp = await fetch('/geo/china.json');
    if (!resp.ok) throw new Error(`/geo/china.json HTTP ${resp.status}`);
    const json = await resp.json();
    echarts.registerMap('china', json);
  })();
  return geoRegistered;
}

function buildOption(
  data: ProvincePayload[],
  selected: string | undefined,
): Option {
  const byName = new Map(data.map(d => [d.name, d] as const));
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e5e5e5',
      textStyle: { fontSize: 12, color: '#171717' },
      formatter: raw => {
        const params = raw as { name: string };
        const stat = byName.get(params.name);
        if (!stat)
          return `<b>${params.name}</b><br/><span style="color:#999">暂无覆盖城市</span>`;
        const cityLines = stat.cities
          .slice(0, 8)
          .map(
            c =>
              `<div style="display:flex;justify-content:space-between;gap:12px;font-size:11px"><span>${c.name}</span><span style="color:#737373;font-variant-numeric:tabular-nums">${c.gdp != null ? c.gdp.toLocaleString() + ' 亿' : '—'}</span></div>`,
          )
          .join('');
        const more =
          stat.cities.length > 8
            ? `<div style="font-size:11px;color:#999">+${stat.cities.length - 8} 个城市…</div>`
            : '';
        return `
          <div style="min-width:180px">
            <div style="font-weight:600;margin-bottom:4px">${stat.name}</div>
            <div style="font-size:11px;color:#737373;margin-bottom:6px">
              覆盖 ${stat.cityCount} 城 · 总 GDP ${(stat.totalGdp / 10000).toFixed(2)} 万亿
            </div>
            ${cityLines}${more}
            <div style="font-size:10px;color:#a3a3a3;margin-top:6px">点击筛选该省城市</div>
          </div>
        `;
      },
    },
    visualMap: {
      type: 'continuous',
      min: 0,
      max: Math.max(...data.map(d => d.totalGdp), 50000),
      text: ['总 GDP 高', '低'],
      textStyle: { fontSize: 10, color: '#737373' },
      inRange: {
        color: ['#f1f5f9', '#dbeafe', '#93c5fd', '#3b82f6', '#1e3a8a'],
      },
      outOfRange: { color: ['#fafafa'] },
      left: 12,
      bottom: 12,
      itemWidth: 10,
      itemHeight: 80,
      calculable: false,
    },
    series: [
      {
        name: '省份 GDP',
        type: 'map',
        map: 'china',
        roam: false,
        aspectScale: 0.85,
        zoom: 1.2,
        label: { show: false },
        itemStyle: {
          borderColor: '#ffffff',
          borderWidth: 0.6,
        },
        emphasis: {
          label: { show: true, fontSize: 11, color: '#171717' },
          itemStyle: { areaColor: '#fcd34d' },
        },
        select: {
          label: { show: true, fontSize: 12, fontWeight: 'bold', color: '#171717' },
          itemStyle: { areaColor: '#f59e0b', borderColor: '#92400e', borderWidth: 1.2 },
        },
        selectedMode: 'single',
        data: data.map(d => ({
          name: d.name,
          value: d.totalGdp,
          selected: selected === d.name,
        })),
      },
    ],
  };
}

export function ChinaMap({ data, selected, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const instRef = useRef<echarts.ECharts | null>(null);
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(selected);
  onSelectRef.current = onSelect;
  selectedRef.current = selected;

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Init once: load geo, create instance, wire click + resize.
  useEffect(() => {
    let cancelled = false;
    let resizeObs: ResizeObserver | null = null;

    (async () => {
      try {
        await ensureGeoRegistered();
        if (cancelled || !ref.current) return;
        const inst = echarts.init(ref.current);
        instRef.current = inst;

        inst.on('click', params => {
          if (params.componentType !== 'series') return;
          const name = String((params as { name: string }).name);
          onSelectRef.current(selectedRef.current === name ? null : name);
        });

        resizeObs = new ResizeObserver(() => inst.resize());
        resizeObs.observe(ref.current);

        setReady(true);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();

    return () => {
      cancelled = true;
      resizeObs?.disconnect();
      instRef.current?.dispose();
      instRef.current = null;
    };
  }, []);

  // Render whenever data/selected change OR after init completes.
  useEffect(() => {
    if (!ready) return;
    const inst = instRef.current;
    if (!inst) return;
    inst.setOption(buildOption(data, selected), { notMerge: true });
  }, [ready, data, selected]);

  return (
    <div className="relative">
      <div
        ref={ref}
        className="h-[420px] w-full rounded-xl border border-neutral-200/80 bg-white sm:h-[480px]"
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 text-sm text-red-600">
          地图加载失败：{error}
        </div>
      )}
    </div>
  );
}
