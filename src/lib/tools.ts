import type Anthropic from '@anthropic-ai/sdk';
import {
  listCities,
  getCity,
  getCityMetrics,
  getMetricForCity,
  rankCitiesByMetric,
  findCityByName,
} from './db';
import { METRIC_DEFS, getMetricMeta } from './types';

export const TOOLS: Anthropic.Tool[] = [
  {
    name: 'list_cities',
    description: '列出数据库中所有城市的列表，返回城市编码、中文名、等级、省份、地区。当用户询问"有哪些城市"或不确定要查的城市编码时使用。',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'list_metrics',
    description: '列出数据库中所有可查询的指标 key 与中文名、单位、所属类别。当不确定指标 key 时使用。',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'get_city_full',
    description: '获取某个城市的全部 6 大类指标数据（经济、产业、人口、房价、就业、城市资源）。当用户询问某城市的整体情况、综合介绍时使用。',
    input_schema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市中文名（如"北京"）或英文 code（如"beijing"）' },
      },
      required: ['city'],
    },
  },
  {
    name: 'get_city_metric',
    description: '获取某个城市的某一项具体指标。当用户问"北京的 GDP 是多少"这类精确查询时使用。',
    input_schema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: '城市中文名或英文 code' },
        metric_key: { type: 'string', description: '指标 key，如 gdp、permanent_pop、new_house_price' },
      },
      required: ['city', 'metric_key'],
    },
  },
  {
    name: 'rank_cities',
    description: '按某项指标排名所有城市，返回 Top N。用于"GDP 最高的城市是？""哪些城市房价最高？"等问题。',
    input_schema: {
      type: 'object',
      properties: {
        metric_key: { type: 'string', description: '指标 key' },
        order: { type: 'string', enum: ['desc', 'asc'], description: 'desc=从高到低（默认），asc=从低到高' },
        limit: { type: 'number', description: '返回前 N 个，默认 10' },
      },
      required: ['metric_key'],
    },
  },
];

function resolveCityCode(query: string): string | null {
  const direct = getCity(query.toLowerCase());
  if (direct) return direct.code;
  const found = findCityByName(query);
  return found?.code ?? null;
}

export async function runTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'list_cities':
      return listCities();

    case 'list_metrics':
      return METRIC_DEFS;

    case 'get_city_full': {
      const code = resolveCityCode(String(input.city));
      if (!code) return { error: `未找到城市: ${input.city}` };
      const city = getCity(code);
      const metrics = getCityMetrics(code);
      return { city, metrics };
    }

    case 'get_city_metric': {
      const code = resolveCityCode(String(input.city));
      if (!code) return { error: `未找到城市: ${input.city}` };
      const key = String(input.metric_key);
      const metric = getMetricForCity(code, key);
      const meta = getMetricMeta(key);
      if (!metric) return { error: `城市 ${code} 暂无指标 ${key} 的数据` };
      return { city: code, metric_label: meta?.label, ...metric };
    }

    case 'rank_cities': {
      const key = String(input.metric_key);
      const order = (input.order === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
      const limit = typeof input.limit === 'number' ? input.limit : 10;
      const meta = getMetricMeta(key);
      const ranked = rankCitiesByMetric(key, order, limit);
      return { metric_key: key, metric_label: meta?.label, unit: meta?.unit, order, results: ranked };
    }

    default:
      return { error: `未知工具: ${name}` };
  }
}

export const SYSTEM_PROMPT = `你是城市基本面分析助手。用户会用自然语言询问中国城市的经济、产业、人口、房价、就业、城市资源等数据。

工作方式：
1. 用工具查询数据库的真实数据，绝对不要凭记忆编造数字。
2. 优先选择合适的工具：单点查询用 get_city_metric；整体了解用 get_city_full；比较/排序用 rank_cities；多城对比可多次调用 get_city_full。
3. 回答时用中文，简洁，直接给出数字 + 单位 + 数据时间（asOf）。多个城市对比时用表格或要点。
4. 如果数据库没有该城市或该指标，明确告知"暂无数据"，不要猜测。
5. 回答末尾用一行小字标注主要数据来源（source 字段），格式："数据来源：xxx"。

可用城市仅为数据库内的若干 Top 城市。可用指标的 key 见 list_metrics 工具。`;
