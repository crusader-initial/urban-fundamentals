import { listCities, getMetricForCity, getCityByAdcode } from './db';
import { PREFECTURES } from './prefecture-list';
import { normalizeProvince } from './province-stats';

export interface PrefectureStat {
  adcode: number;
  name: string;          // 全名，如 "杭州市"
  province: string;
  region: string;
  code: string;          // 用于导航 /city/{code}
  hasData: boolean;      // 是否在我们的 50 城里有完整数据
  gdp: number | null;
  pop: number | null;
  tier: string;
}

let cached: PrefectureStat[] | null = null;

export function computePrefectureStats(): PrefectureStat[] {
  if (cached) return cached;
  const out: PrefectureStat[] = [];
  for (const p of PREFECTURES) {
    const city = getCityByAdcode(p.adcode);
    if (city) {
      out.push({
        adcode: p.adcode,
        name: p.name,
        province: p.province,
        region: p.region,
        code: city.code,
        hasData: true,
        gdp: getMetricForCity(city.code, 'gdp')?.valueNum ?? null,
        pop: getMetricForCity(city.code, 'permanent_pop')?.valueNum ?? null,
        tier: city.tier,
      });
    } else {
      // 未在 50 城里，应该已经作为"其他"等级 seed 进 cities 表
      out.push({
        adcode: p.adcode,
        name: p.name,
        province: p.province,
        region: p.region,
        code: p.code,
        hasData: false,
        gdp: null,
        pop: null,
        tier: '其他',
      });
    }
  }
  cached = out;
  return out;
}

export interface ProvinceFilter {
  name: string;       // GeoJSON 全称
  count: number;
}

export function listProvinces(): ProvinceFilter[] {
  const counts = new Map<string, number>();
  for (const c of listCities()) {
    const province = normalizeProvince(c.province);
    counts.set(province, (counts.get(province) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export interface ProvinceLevelStat {
  name: string;              // GeoJSON 全名 "江苏省"
  prefectureCount: number;   // 总地级行政区数
  hasDataCount: number;      // 其中有完整数据的
  totalGdp: number;          // 仅累加有数据的城市
  prefectures: PrefectureStat[];
}

export function aggregateByProvince(prefs: PrefectureStat[]): ProvinceLevelStat[] {
  const map = new Map<string, ProvinceLevelStat>();
  for (const p of prefs) {
    const name = p.province;
    if (!map.has(name)) {
      map.set(name, {
        name,
        prefectureCount: 0,
        hasDataCount: 0,
        totalGdp: 0,
        prefectures: [],
      });
    }
    const s = map.get(name)!;
    s.prefectureCount += 1;
    if (p.hasData) s.hasDataCount += 1;
    if (p.gdp != null) s.totalGdp += p.gdp;
    s.prefectures.push(p);
  }
  for (const s of map.values()) {
    s.prefectures.sort((a, b) => (b.gdp ?? -Infinity) - (a.gdp ?? -Infinity));
  }
  return Array.from(map.values()).sort((a, b) => b.totalGdp - a.totalGdp);
}
