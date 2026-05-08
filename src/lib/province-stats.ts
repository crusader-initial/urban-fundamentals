import { listCities, getMetricForCity } from './db';

// seed-data.ts 里若用了简称，统一映射成 GeoJSON 的全称
const ALIAS: Record<string, string> = {
  广西: '广西壮族自治区',
  宁夏: '宁夏回族自治区',
  内蒙古: '内蒙古自治区',
  西藏: '西藏自治区',
  新疆: '新疆维吾尔自治区',
};

export function normalizeProvince(p: string): string {
  return ALIAS[p] ?? p;
}

export interface CityInProvince {
  code: string;
  name: string;
  tier: string;
  gdp: number | null;
}

export interface ProvinceStat {
  name: string;            // GeoJSON name 全称
  cityCount: number;       // 该省覆盖的 50 城数
  totalGdp: number;        // 仅含我们覆盖的城市
  cities: CityInProvince[];
}

export function computeProvinceStats(): ProvinceStat[] {
  const cities = listCities();
  const byProvince = new Map<string, ProvinceStat>();
  for (const c of cities) {
    const province = normalizeProvince(c.province);
    if (!byProvince.has(province)) {
      byProvince.set(province, {
        name: province,
        cityCount: 0,
        totalGdp: 0,
        cities: [],
      });
    }
    const stat = byProvince.get(province)!;
    const gdp = getMetricForCity(c.code, 'gdp')?.valueNum ?? null;
    stat.cityCount += 1;
    if (gdp != null) stat.totalGdp += gdp;
    stat.cities.push({ code: c.code, name: c.name, tier: c.tier, gdp });
  }
  for (const stat of byProvince.values()) {
    stat.cities.sort((a, b) => (b.gdp ?? 0) - (a.gdp ?? 0));
  }
  return Array.from(byProvince.values()).sort((a, b) => b.totalGdp - a.totalGdp);
}
