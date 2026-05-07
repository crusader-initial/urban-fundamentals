# 城市基本面 · Urban Fundamentals

中国 Top 50 城市的经济、产业、人口、房价、就业、城市资源 6 大维度数据分析与可视化。

四个核心功能：
- **城市详情页** —— 6 大类指标卡片 + GDP/人口/财政 4 年趋势折线
- **城市排名** —— 50 城任意指标横向条形图
- **两城对比** —— 归一化条形图叠加 + 明细差异表
- **自然语言问答** —— 基于 Claude tool use 查询结构化数据

## 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:3000 即可。首次启动会自动从 `seed-data.ts` + `seed-history.ts` 在 `data/cities.db` 建库。

自然语言问答需要 Anthropic API key：

```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
```

## 数据来源

| 类型 | 来源 | 时点 |
|---|---|---|
| GDP / 人口 / 财政 | 各市统计公报 2020-2023 | 2020-2023（含历史） |
| GDP 增速 / 三产占比 / 人均 GDP | 各市统计公报 | 2023 |
| 高校 / 三甲医院 / 5A 景区 / 地铁里程 | 教育部 / 卫健委 / 文旅部 / 中国城市轨道交通协会 | 2023-2024 |
| 上市公司数 | 东方财富 `RPT_F10_BASIC_ORGINFO` | 实时（A 股含 ST/创业板/科创板/北交所） |
| 二手房均价 | 链家 `{city}.lianjia.com/ershoufang/pg1` | 实时（首页 30 条 trimmed mean） |
| 房价收入比 / 租金回报率 / 平均工资 / 社保基数 | 各市公报 + 抽样估算 | 2023-2024 抽样 |
| 招聘岗位数 | — | 占位（详见下文） |

> **数据可信度**：GDP / 人口 / 财政可靠；房价绝对均价偏低 20-40%（仅采链家首页），房价收入比 / 租售比 / 招聘数为公开抽样需校验。详见 [`scripts/README.md`](./scripts/README.md)。

## 实时数据采集

```bash
npm run refresh                # 全部源（~1 分钟）
npm run refresh -- listed      # 仅上市公司（~25 秒）
npm run refresh -- lianjia     # 仅二手房（~50 秒）
```

直接 upsert 到 SQLite 的 `metrics` 表。具体接口能用/不能用的细节、为什么招聘数是 stub，参见 [`scripts/README.md`](./scripts/README.md)。

## 技术栈

- **Next.js 16** App Router + TypeScript
- **better-sqlite3** SQLite 同步驱动；schema 主键 `(city, metric, as_of)` 支持时间序列
- **Tailwind CSS 4** + **Recharts** 可视化
- **Anthropic SDK** Claude `claude-opus-4-7` + tool use 做问答
- **tsx** 跑采集脚本

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 首页：城市卡片
│   ├── city/[code]/page.tsx  # 城市详情（6 类指标 + 趋势图）
│   ├── compare/page.tsx      # 双城对比
│   ├── rank/page.tsx         # 50 城排名
│   ├── chat/page.tsx         # 自然语言问答
│   ├── api/chat/route.ts     # Claude tool use 后端
│   └── api/rank/route.ts
├── components/               # MetricRow / TrendChart / CompareChart / CitySelect
└── lib/
    ├── db.ts                 # SQLite 访问层
    ├── types.ts              # METRIC_DEFS（27 项指标定义）
    ├── seed-data.ts          # 50 城 2023 单点位数据
    ├── seed-history.ts       # 50 城 2020-2022 GDP/人口/财政
    └── tools.ts              # Claude tool 定义 + system prompt

scripts/
├── refresh.ts                # 主调度
├── city-mapping.ts           # 城市码 → 链家子域 + 注册地址别名
└── fetch/                    # listed.ts / lianjia.ts / jobs.ts
```

## 已知限制

- **房价绝对均价偏低** —— 链家 `pg2` 起 302 重定向，只能拿首页 30 条；首页倾向中端房源，结果系统性低于"全市挂牌均价" 20-40%
- **国统局 70 城价格指数** —— `data.stats.gov.cn` IP 级 WAF，纯 fetch 全部 403
- **招聘岗位数** —— BOSS / 智联 / 51 / 拉勾 全员 geetest 滑动验证，要真采得 Playwright + 代理池
- **排名 30 后的城市历史数据**部分为公开数据近似值，建议按需校验

## License

MIT
