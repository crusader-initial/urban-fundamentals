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
import type { PrefecturePayload } from './ChinaMap';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFeature = any;
interface FeatureCollection {
  type: 'FeatureCollection';
  features: AnyFeature[];
}

export interface ProvincePayload {
  name: string;            // GeoJSON name like "江苏省"
  prefectureCount: number;
  hasDataCount: number;
  totalGdp: number;
}

interface Props {
  prefectures: PrefecturePayload[];   // 全国 367 个
  provinceData: ProvincePayload[];    // 31 个省级聚合
  selectedProvince: string | null;
  onSelectProvince: (name: string | null) => void;
  onSelectCity: (code: string) => void;
}

interface GeoCache {
  provinces: FeatureCollection;
  prefectures: FeatureCollection;
}
let cached: GeoCache | null = null;
let pending: Promise<GeoCache> | null = null;

async function loadGeo(): Promise<GeoCache> {
  if (cached) return cached;
  if (!pending) {
    pending = (async () => {
      const [pRes, prefRes] = await Promise.all([
        fetch('/geo/china.json'),
        fetch('/geo/prefectures.json'),
      ]);
      if (!pRes.ok) throw new Error(`china.json HTTP ${pRes.status}`);
      if (!prefRes.ok) throw new Error(`prefectures.json HTTP ${prefRes.status}`);
      const provinces = (await pRes.json()) as FeatureCollection;
      const prefectures = (await prefRes.json()) as FeatureCollection;
      // echarts 的 GeoJSON 类型偏紧，运行时数据格式 OK
      echarts.registerMap('drill_provinces', provinces as Parameters<typeof echarts.registerMap>[1]);
      echarts.registerMap('drill_prefectures_full', prefectures as Parameters<typeof echarts.registerMap>[1]);
      cached = { provinces, prefectures };
      return cached;
    })();
  }
  return pending;
}

function buildProvinceOption(data: ProvincePayload[]): Option {
  const byName = new Map(data.map(d => [d.name, d] as const));
  const maxGdp = Math.max(...data.map(d => d.totalGdp), 50000);
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
        return `
          <div style="min-width:160px">
            <div style="font-weight:600;margin-bottom:4px">${stat.name}</div>
            <div style="font-size:11px;color:#737373;margin-bottom:6px">
              ${stat.prefectureCount} 个地级行政区 · ${stat.hasDataCount} 有详细数据
            </div>
            <div style="display:flex;justify-content:space-between;gap:12px;font-size:11px">
              <span style="color:#737373">总 GDP</span>
              <span style="font-variant-numeric:tabular-nums">${(stat.totalGdp / 10000).toFixed(2)} 万亿</span>
            </div>
            <div style="font-size:10px;color:#a3a3a3;margin-top:6px">点击进入省份钻取</div>
          </div>
        `;
      },
    },
    visualMap: {
      type: 'continuous',
      min: 0,
      max: maxGdp,
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
        map: 'drill_provinces',
        roam: false,
        aspectScale: 0.85,
        zoom: 1.2,
        label: { show: false },
        itemStyle: { borderColor: '#ffffff', borderWidth: 0.6 },
        emphasis: {
          label: { show: true, fontSize: 11, color: '#171717' },
          itemStyle: { areaColor: '#fcd34d' },
        },
        data: data.map(d => ({ name: d.name, value: d.totalGdp })),
      },
    ],
  };
}

function buildPrefectureOption(
  mapName: string,
  data: PrefecturePayload[],
): Option {
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
        const gdpLine =
          stat.gdp != null
            ? `<div style="display:flex;justify-content:space-between;gap:12px;font-size:11px"><span style="color:#737373">GDP</span><span style="font-variant-numeric:tabular-nums">${stat.gdp.toLocaleString()} 亿元</span></div>`
            : `<div style="font-size:11px;color:#a3a3a3">暂无 GDP 数据</div>`;
        const popLine =
          stat.pop != null
            ? `<div style="display:flex;justify-content:space-between;gap:12px;font-size:11px"><span style="color:#737373">人口</span><span style="font-variant-numeric:tabular-nums">${stat.pop.toLocaleString()} 万人</span></div>`
            : '';
        return `
          <div style="min-width:160px">
            <div style="font-weight:600;margin-bottom:4px">${stat.name}</div>
            ${gdpLine}${popLine}
            <div style="font-size:10px;color:#a3a3a3;margin-top:6px">点击查看城市详情</div>
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
      inRange: { color: ['#f1f5f9', '#dbeafe', '#93c5fd', '#3b82f6', '#1e3a8a'] },
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
        map: mapName,
        roam: false,
        aspectScale: 0.85,
        zoom: 1.05,
        label: { show: true, fontSize: 10, color: '#404040' },
        itemStyle: { borderColor: '#ffffff', borderWidth: 0.6 },
        emphasis: {
          label: { show: true, fontSize: 11, fontWeight: 'bold', color: '#171717' },
          itemStyle: { areaColor: '#fcd34d', borderColor: '#92400e', borderWidth: 1 },
        },
        data: data.map(d => ({ name: d.name, value: d.gdp ?? undefined })),
      },
    ],
  };
}

export function DrillDownMap({
  prefectures,
  provinceData,
  selectedProvince,
  onSelectProvince,
  onSelectCity,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const instRef = useRef<echarts.ECharts | null>(null);

  const onProvinceRef = useRef(onSelectProvince);
  const onCityRef = useRef(onSelectCity);
  const selectedRef = useRef(selectedProvince);
  const provinceDataRef = useRef(provinceData);
  const prefecturesRef = useRef(prefectures);
  onProvinceRef.current = onSelectProvince;
  onCityRef.current = onSelectCity;
  selectedRef.current = selectedProvince;
  provinceDataRef.current = provinceData;
  prefecturesRef.current = prefectures;

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let resizeObs: ResizeObserver | null = null;

    (async () => {
      try {
        await loadGeo();
        if (cancelled || !ref.current) return;
        const inst = echarts.init(ref.current);
        instRef.current = inst;

        inst.on('click', params => {
          if (params.componentType !== 'series') return;
          const name = String((params as { name: string }).name);
          if (selectedRef.current == null) {
            // 顶层省份视图：点击省份进入钻取
            onProvinceRef.current(name);
          } else {
            // 钻取视图：点击城市跳详情
            const stat = prefecturesRef.current.find(d => d.name === name);
            if (stat) onCityRef.current(stat.code);
          }
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
    if (!ready || !cached) return;
    const inst = instRef.current;
    if (!inst) return;

    if (selectedProvince == null) {
      inst.setOption(buildProvinceOption(provinceData), { notMerge: true });
      return;
    }

    // Drilled: 注册一张该省的局部 map
    const provFeat = cached.provinces.features.find(
      f => f.properties.name === selectedProvince,
    );
    if (!provFeat) {
      inst.setOption(buildProvinceOption(provinceData), { notMerge: true });
      return;
    }
    const provAdcode = provFeat.properties.adcode;
    const prefix = Math.floor(provAdcode / 10000);
    const filtered: FeatureCollection = {
      type: 'FeatureCollection',
      features: cached.prefectures.features.filter(
        f => Math.floor(f.properties.adcode / 10000) === prefix,
      ),
    };
    const mapName = `drill_${provAdcode}`;
    echarts.registerMap(mapName, filtered as Parameters<typeof echarts.registerMap>[1]);

    const provincePrefs = prefectures.filter(p => p.province === selectedProvince);
    inst.setOption(buildPrefectureOption(mapName, provincePrefs), { notMerge: true });
  }, [ready, selectedProvince, provinceData, prefectures]);

  return (
    <div className="relative">
      {selectedProvince && (
        <button
          type="button"
          onClick={() => onSelectProvince(null)}
          className="absolute right-3 top-3 z-10 rounded-md border border-neutral-300 bg-white/95 px-3 py-1.5 text-xs text-neutral-700 shadow-sm backdrop-blur transition-colors hover:bg-neutral-100"
        >
          ← 返回全国
        </button>
      )}
      {selectedProvince && (
        <div className="absolute left-3 top-3 z-10 rounded-md bg-white/95 px-3 py-1.5 text-sm font-medium text-neutral-800 shadow-sm backdrop-blur">
          {selectedProvince}
        </div>
      )}
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
