// 一次性数据刷新脚本。运行：
//   npm run refresh                # 全部源
//   npm run refresh -- listed      # 只跑上市公司
//   npm run refresh -- lianjia
//
// 直接 upsert 进 SQLite 的 metrics 表（不动 seed-data.ts）。
// 跑完会打印每项采集的成功/失败统计。

import { upsertMetric, listCities } from '../src/lib/db';
import { fetchListedCompanies } from './fetch/listed';
import { fetchLianjiaPrices } from './fetch/lianjia';
import { fetchJobCounts } from './fetch/jobs';

type Source = 'listed' | 'lianjia' | 'jobs';
const ALL: Source[] = ['listed', 'lianjia', 'jobs'];

async function runListed() {
  console.log('\n=== 上市公司（东方财富）===');
  const r = await fetchListedCompanies();
  const cities = listCities();
  let updated = 0;
  for (const c of cities) {
    const n = r.countByCity.get(c.code) ?? 0;
    if (n > 0) {
      upsertMetric(
        c.code,
        'listed_companies',
        n,
        '家',
        r.asOf,
        '东方财富 RPT_F10_BASIC_ORGINFO（A股含ST/创业板/科创板/北交所，按注册地匹配）',
      );
      updated++;
    }
  }
  console.log(`✓ ${updated}/${cities.length} 城更新；总匹配 ${r.total} 家公司`);
}

async function runLianjia() {
  console.log('\n=== 二手房均价（链家）===');
  const r = await fetchLianjiaPrices();
  for (const [code, { avgPrice, sampleSize }] of r.pricesByCity) {
    upsertMetric(
      code,
      'second_house_price',
      avgPrice,
      '元/㎡',
      r.asOf,
      `链家 ershoufang/pg1 综合排序前 ${sampleSize} 条 trimmed mean（首页样本，比官方挂牌均价偏低）`,
    );
  }
  console.log(`✓ ${r.pricesByCity.size}/${r.pricesByCity.size + r.failedCities.length} 城更新`);
  if (r.failedCities.length > 0) {
    console.log(`✗ 失败城市：`);
    for (const f of r.failedCities) console.log(`  ${f.name} — ${f.reason}`);
  }
}

async function runJobs() {
  console.log('\n=== 招聘岗位（stub）===');
  await fetchJobCounts();
}

async function main() {
  const args = process.argv.slice(2);
  const targets = args.length === 0 ? ALL : (args as Source[]);
  for (const t of targets) {
    if (!ALL.includes(t)) {
      console.error(`未知数据源: ${t}（可选: ${ALL.join(', ')}）`);
      process.exit(1);
    }
  }
  for (const t of targets) {
    try {
      if (t === 'listed') await runListed();
      else if (t === 'lianjia') await runLianjia();
      else if (t === 'jobs') await runJobs();
    } catch (e) {
      console.error(`✗ ${t} 失败：${(e as Error).message}`);
    }
  }
  console.log('\n完成。');
}

main();
