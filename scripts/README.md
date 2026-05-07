# 数据采集脚本

```bash
npm run refresh           # 全部源
npm run refresh -- listed # 只跑上市公司（~25s）
npm run refresh -- lianjia # 只跑链家二手房（~50s，每城 1s）
npm run refresh -- jobs   # 当前是 stub
```

直接 upsert 进 `data/cities.db` 的 `metrics` 表，不动 `src/lib/seed-data.ts`（seed 仅作首次启动的兜底）。每条数据的 `source` 字段记录了真实采集时间和口径。

## 现状

| 指标 | 数据源 | 状态 | 说明 |
|---|---|---|---|
| `listed_companies` | 东方财富 `RPT_F10_BASIC_ORGINFO` | ✅ 工作 | 按公司注册地址匹配；含 ST/创业板/科创板/北交所，不含已退市/B/H |
| `second_house_price` | 链家 `{city}.lianjia.com/ershoufang/pg1/` | ✅ 工作 | 每城 30 条样本 trimmed mean。**口径偏低 20-40%** vs 链家官方挂牌均价 |
| 招聘岗位数 | BOSS/智联/51/拉勾 | ❌ stub | 反爬过硬（geetest/acw_sc__v2/滑动验证），纯 fetch 拿不到 |
| 房价指数(YoY/MoM) | 国家统计局 70 城 | ❌ 不可用 | data.stats.gov.cn 对所有出口流量 WAF 403 |

## 反爬限制

- **链家** `pg2` 起返回 302 → 反爬重定向，每城只能拿 30 条样本
- **国家统计局** WAF 直接 403，要绕得有内部 IP 或带 Cookie
- **招聘类** 全员 geetest，要真做需要 Playwright + 代理池

## 扩展指引

要补齐岗位数据，参考 `fetch/jobs.ts` 末尾的 Playwright 模板。要更精确的房价均值，需要：

1. 升级到贝壳研究院数据 API（付费）
2. 或用 Playwright 走链家区域子页（增加爬虫复杂度，封 IP 风险高）
3. 或对每城批量抓多个细分关键词搜索结果取并集
