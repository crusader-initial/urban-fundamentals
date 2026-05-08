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

export interface PrefecturePayload {
  adcode: number;
  name: string;          // GeoJSON 全名，如 "杭州市"
  province: string;
  code: string;
  hasData: boolean;
  gdp: number | null;
  pop: number | null;
  tier: string;
}

interface Props {
  data: PrefecturePayload[];
  selected?: string;        // 选中的 city.code
  onSelect: (code: string | null) => void;
}

let geoRegistered: Promise<void> | null = null;

async function ensureGeoRegistered(): Promise<void> {
  if (geoRegistered) return geoRegistered;
  geoRegistered = (async () => {
    const resp = await fetch('/geo/prefectures.json');
    if (!resp.ok) throw new Error(`/geo/prefectures.json HTTP ${resp.status}`);
    const json = await resp.json();
    echarts.registerMap('china_prefectures', json);
  })();
  return geoRegistered;
}

function buildOption(data: PrefecturePayload[], selected?: string): Option {
  const byName = new Map(data.map(d => [d.name, d] as const));
  const maxGdp = Math.max(...data.map(d => d.gdp ?? 0), 1000);

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e5e5e5',
      textStyle: { fontSize: 12, color: '#171717' },
      formatter: raw => {
        const params = raw as { name: string };
        const stat = byName.get(params.name);
        if (!stat) return `<b>${params.name}</b>`;
        const gdpLine = stat.gdp != null
          ? `<div style="display:flex;justify-content:space-between;gap:12px;font-size:11px"><span style="color:#737373">GDP</span><span style="font-variant-numeric:tabular-nums">${stat.gdp.toLocaleString()} 亿元</span></div>`
          : `<div style="font-size:11px;color:#a3a3a3">暂无 GDP 数据</div>`;
        const popLine = stat.pop != null
          ? `<div style="display:flex;justify-content:space-between;gap:12px;font-size:11px"><span style="color:#737373">人口</span><span style="font-variant-numeric:tabular-nums">${stat.pop.toLocaleString()} 万人</span></div>`
          : '';
        const action = stat.hasData
          ? `<div style="font-size:10px;color:#a3a3a3;margin-top:6px">点击查看详情</div>`
          : `<div style="font-size:10px;color:#a3a3a3;margin-top:6px">点击查看（数据稀缺）</div>`;
        return `
          <div style="min-width:160px">
            <div style="font-weight:600;margin-bottom:4px">${stat.name}</div>
            <div style="font-size:11px;color:#737373;margin-bottom:6px">${stat.province}</div>
            ${gdpLine}${popLine}${action}
          </div>
        `;
      },
    },
    visualMap: {
      type: 'continuous',
      min: 0,
      max: Math.min(maxGdp, 50000),
      text: ['GDP 高', '低'],
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
        name: '地级市 GDP',
        type: 'map',
        map: 'china_prefectures',
        roam: false,
        aspectScale: 0.85,
        zoom: 1.2,
        label: { show: false },
        itemStyle: {
          borderColor: '#ffffff',
          borderWidth: 0.4,
        },
        emphasis: {
          label: { show: true, fontSize: 11, color: '#171717' },
          itemStyle: { areaColor: '#fcd34d', borderColor: '#92400e', borderWidth: 0.8 },
        },
        select: {
          label: { show: true, fontSize: 12, fontWeight: 'bold', color: '#171717' },
          itemStyle: { areaColor: '#f59e0b', borderColor: '#92400e', borderWidth: 1.2 },
        },
        selectedMode: 'single',
        data: data.map(d => ({
          name: d.name,
          value: d.gdp ?? undefined,
          selected: selected === d.code,
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
  const dataRef = useRef(data);
  onSelectRef.current = onSelect;
  selectedRef.current = selected;
  dataRef.current = data;

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          const stat = dataRef.current.find(d => d.name === name);
          if (!stat) return;
          onSelectRef.current(selectedRef.current === stat.code ? null : stat.code);
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
        className="h-[460px] w-full rounded-xl border border-neutral-200/80 bg-white sm:h-[540px]"
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 text-sm text-red-600">
          地图加载失败：{error}
        </div>
      )}
    </div>
  );
}
