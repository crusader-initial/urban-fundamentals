// 从东方财富 datacenter-web 拉取全量 A 股上市公司基本信息
// 通过注册地址（REG_ADDRESS）匹配到我们的 50 城，输出每城上市公司数。
// 接口非官方但相当稳定，~25 秒可拉完全部 ~24500 条。

import { findCityByAddress } from '../city-mapping';

interface OrgRow {
  ORG_CODE: string;
  SECURITY_CODE: string;
  SECURITY_TYPE: string;
  REG_ADDRESS: string;
}

function isActiveAShare(t: string | null | undefined): boolean {
  if (!t) return false;
  if (t.includes('退市') || t.includes('已退市')) return false;
  return t.includes('A股');
}

const PAGE_SIZE = 500;
const URL = 'https://datacenter-web.eastmoney.com/api/data/v1/get';

async function fetchPage(pageNumber: number): Promise<{ rows: OrgRow[]; pages: number }> {
  const params = new URLSearchParams({
    reportName: 'RPT_F10_BASIC_ORGINFO',
    columns: 'ORG_CODE,SECURITY_CODE,SECURITY_TYPE,REG_ADDRESS',
    pageNumber: String(pageNumber),
    pageSize: String(PAGE_SIZE),
    sortColumns: 'SECURITY_CODE',
    sortTypes: '1',
  });
  const resp = await fetch(`${URL}?${params}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      Referer: 'https://data.eastmoney.com/',
      Accept: 'application/json',
    },
  });
  if (!resp.ok) throw new Error(`东方财富 HTTP ${resp.status}`);
  const j = (await resp.json()) as {
    success: boolean;
    message: string;
    result: { pages: number; data: OrgRow[] } | null;
  };
  if (!j.success || !j.result) throw new Error(`东方财富响应异常: ${j.message}`);
  return { rows: j.result.data, pages: j.result.pages };
}

export interface ListedResult {
  countByCity: Map<string, number>;
  asOf: string;
  total: number;
}

export async function fetchListedCompanies(): Promise<ListedResult> {
  const seen = new Set<string>();
  const countByCity = new Map<string, number>();

  const first = await fetchPage(1);
  const totalPages = first.pages;
  process.stderr.write(`[listed] 共 ${totalPages} 页\n`);

  const ingest = (rows: OrgRow[]) => {
    for (const r of rows) {
      if (!isActiveAShare(r.SECURITY_TYPE)) continue;
      if (seen.has(r.ORG_CODE)) continue;
      seen.add(r.ORG_CODE);
      const city = findCityByAddress(r.REG_ADDRESS ?? '');
      if (!city) continue;
      countByCity.set(city.code, (countByCity.get(city.code) ?? 0) + 1);
    }
  };
  ingest(first.rows);

  for (let p = 2; p <= totalPages; p++) {
    const { rows } = await fetchPage(p);
    ingest(rows);
    if (p % 10 === 0 || p === totalPages) {
      process.stderr.write(`[listed] ${p}/${totalPages} 页 (累计 ${seen.size} 家)\n`);
    }
    await new Promise(r => setTimeout(r, 100));
  }

  const asOf = new Date().toISOString().slice(0, 10);
  return { countByCity, asOf, total: seen.size };
}
