// 岗位数据采集 stub。
//
// 结论：BOSS / 智联 / 51job / 拉勾 都对纯 cURL/Node fetch 部署了强反爬：
//   - BOSS zhipin /wapi/zpgeek/search/joblist.json  → "您的环境存在异常"
//   - 51job  we.51job.com/api/job/search-pc       → 阿里云 acw_sc__v2 JS challenge
//   - 拉勾   www.lagou.com/jobs/positionAjax.json → 滑动验证页面
//   - 智联   fe-api.zhaopin.com/c/i/sou           → 405 / 空结果
//
// 想真要数据，可选：
//   1) Playwright + headless Chromium 走前端流程。需装 ~150MB 浏览器，
//      还要处理验证码（geetest）和封 IP。npm i -D playwright，模板见下方注释。
//   2) 商用代理 + 反指纹方案（adspower / multilogin / 商用住宅 IP）。
//   3) 接付费数据服务（社科问中、联动云、智联企业版 API）。
//
// 当前实现：留空。不更新岗位指标，避免覆盖 seed 里的占位数据。

export interface JobsResult {
  countsByCity: Map<string, number>;
  asOf: string;
  failedCities: string[];
}

export async function fetchJobCounts(): Promise<JobsResult> {
  process.stderr.write(
    '[jobs] 跳过 — 反爬过硬，需 Playwright/代理池/付费 API；详见 scripts/fetch/jobs.ts 注释\n',
  );
  return {
    countsByCity: new Map(),
    asOf: new Date().toISOString().slice(0, 10),
    failedCities: [],
  };
}

// --- Playwright 模板（参考用，未启用）-----------------------------
//
// import { chromium } from 'playwright';
// const browser = await chromium.launch();
// const ctx = await browser.newContext({
//   userAgent: 'Mozilla/5.0 ... Chrome/120 ...',
//   locale: 'zh-CN',
// });
// const page = await ctx.newPage();
// await page.goto(`https://www.zhipin.com/web/geek/job?city=${cityCode}`);
// await page.waitForSelector('.job-list-box, .job-card-wrapper', { timeout: 15000 });
// const total = await page.locator('.job-count').textContent();
// // 解析 "共 38,420 个职位"
// await browser.close();
//
// 仍需处理：
//  - geetest 滑动（出现概率取决于 IP 信誉）
//  - 关键词为空时的页面布局差异
//  - 城市 → cityCode 映射（BOSS 用自家编码而非行政区划）
