// 抓取链家各城市二手房列表页中嵌入的 data-price，
// 取 trimmed mean 作为该城市的二手房均价（元/㎡）。
//
// 注意：链家对 /ershoufang/pg2/ 起 302 重定向（反爬），只有 /ershoufang/pg1/ 能拿。
// 所以每个城市样本量固定为 30 条（首页"综合排序"），结果会比链家官方公布的
// "全市挂牌均价"系统性偏低 20-40%（首页倾向中端而非含远郊低价房）。
// 但 50 城用同一逻辑采，相对比较有意义。要真精确均价得用贝壳研究院 API（付费）。

import { CITY_ALIASES } from '../city-mapping';

const TRIM_PCT = 0.1;

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9',
};

function trimmedMean(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const trimCount = Math.floor(sorted.length * TRIM_PCT);
  const sliced = sorted.slice(trimCount, sorted.length - trimCount);
  return sliced.reduce((s, n) => s + n, 0) / sliced.length;
}

async function fetchCityPrices(prefix: string): Promise<number[]> {
  const url = `https://${prefix}.lianjia.com/ershoufang/pg1/`;
  let resp: Response;
  try {
    resp = await fetch(url, { headers: HEADERS, redirect: 'follow' });
  } catch (e) {
    throw new Error(`fetch 失败: ${(e as Error).message}`);
  }
  if (resp.status === 404) throw new Error(`子域 ${prefix} 不存在`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const html = await resp.text();
  const prices: number[] = [];
  for (const m of html.matchAll(/data-price="(\d+)"/g)) {
    const v = Number(m[1]);
    if (v > 0) prices.push(v);
  }
  return prices;
}

export interface LianjiaResult {
  pricesByCity: Map<string, { avgPrice: number; sampleSize: number }>;
  failedCities: Array<{ code: string; name: string; reason: string }>;
  asOf: string;
}

export async function fetchLianjiaPrices(): Promise<LianjiaResult> {
  const out = new Map<string, { avgPrice: number; sampleSize: number }>();
  const failed: Array<{ code: string; name: string; reason: string }> = [];

  for (const city of CITY_ALIASES) {
    if (!city.lianjia) {
      failed.push({ code: city.code, name: city.name, reason: '无链家映射' });
      continue;
    }
    try {
      const prices = await fetchCityPrices(city.lianjia);
      if (prices.length < 10) {
        failed.push({
          code: city.code,
          name: city.name,
          reason: `样本不足 (${prices.length} 条)`,
        });
        continue;
      }
      const avg = Math.round(trimmedMean(prices));
      out.set(city.code, { avgPrice: avg, sampleSize: prices.length });
      process.stderr.write(`[lianjia] ${city.name}: ${avg} 元/㎡ (n=${prices.length})\n`);
    } catch (e) {
      failed.push({ code: city.code, name: city.name, reason: (e as Error).message });
      process.stderr.write(`[lianjia] ${city.name} 失败: ${(e as Error).message}\n`);
    }
    await new Promise(r => setTimeout(r, 800));
  }

  return { pricesByCity: out, failedCities: failed, asOf: new Date().toISOString().slice(0, 10) };
}
