export type MetricCategory =
  | 'economy'
  | 'industry'
  | 'population'
  | 'housing'
  | 'jobs'
  | 'resources';

export interface MetricMeta {
  key: string;
  label: string;
  unit: string;
  category: MetricCategory;
  higherIsBetter?: boolean;
  description?: string;
}

export interface MetricValue {
  key: string;
  valueNum: number | null;
  valueText: string | null;
  unit: string;
  asOf: string;
  source: string;
}

export interface City {
  code: string;
  name: string;
  tier: string;
  province: string;
  region: string;
  adcode?: number | null;     // 行政区划码（与 datav GeoJSON 对齐）
}

export interface CityWithMetrics extends City {
  metrics: Record<string, MetricValue>;
}

export const METRIC_DEFS: MetricMeta[] = [
  // 经济
  { key: 'gdp', label: 'GDP', unit: '亿元', category: 'economy', higherIsBetter: true },
  { key: 'gdp_growth', label: 'GDP 增速', unit: '%', category: 'economy', higherIsBetter: true },
  { key: 'gdp_per_capita', label: '人均 GDP', unit: '元', category: 'economy', higherIsBetter: true },
  { key: 'public_revenue', label: '一般公共预算收入', unit: '亿元', category: 'economy', higherIsBetter: true },

  // 产业
  { key: 'primary_share', label: '第一产业占比', unit: '%', category: 'industry' },
  { key: 'secondary_share', label: '第二产业占比', unit: '%', category: 'industry' },
  { key: 'tertiary_share', label: '第三产业占比', unit: '%', category: 'industry' },
  { key: 'pillar_industries', label: '支柱产业', unit: '', category: 'industry' },
  { key: 'listed_companies', label: '上市公司数量', unit: '家', category: 'industry', higherIsBetter: true },
  { key: 'above_scale_industrial', label: '规上工业增加值', unit: '亿元', category: 'industry', higherIsBetter: true },

  // 人口
  { key: 'permanent_pop', label: '常住人口', unit: '万人', category: 'population', higherIsBetter: true },
  { key: 'pop_growth', label: '人口增量', unit: '万人', category: 'population', higherIsBetter: true },
  { key: 'aging_rate', label: '老龄化率(60+)', unit: '%', category: 'population', higherIsBetter: false },
  { key: 'university_students', label: '在校大学生', unit: '万人', category: 'population', higherIsBetter: true },

  // 房价
  { key: 'new_house_price', label: '新房均价', unit: '元/㎡', category: 'housing' },
  { key: 'second_house_price', label: '二手房均价', unit: '元/㎡', category: 'housing' },
  { key: 'price_income_ratio', label: '房价收入比', unit: '', category: 'housing', higherIsBetter: false },
  { key: 'rent_yield', label: '租金回报率', unit: '%', category: 'housing', higherIsBetter: true },

  // 收入就业
  { key: 'avg_wage', label: '城镇非私营平均工资', unit: '元/年', category: 'jobs', higherIsBetter: true },
  { key: 'social_security_base', label: '社保缴纳基数', unit: '元/月', category: 'jobs' },
  { key: 'job_postings', label: '招聘岗位数', unit: '万', category: 'jobs', higherIsBetter: true },

  // 城市资源
  { key: 'universities', label: '高校数量', unit: '所', category: 'resources', higherIsBetter: true },
  { key: 'universities_985_211', label: '985/211 高校', unit: '所', category: 'resources', higherIsBetter: true },
  { key: 'hospitals_3a', label: '三甲医院', unit: '家', category: 'resources', higherIsBetter: true },
  { key: 'metro_km', label: '地铁运营里程', unit: 'km', category: 'resources', higherIsBetter: true },
  { key: 'airports', label: '民用机场', unit: '座', category: 'resources', higherIsBetter: true },
  { key: 'hsr_stations', label: '高铁站', unit: '座', category: 'resources', higherIsBetter: true },
  { key: 'scenic_5a', label: '5A 景区', unit: '个', category: 'resources', higherIsBetter: true },
];

export const CATEGORY_LABELS: Record<MetricCategory, string> = {
  economy: '经济',
  industry: '产业',
  population: '人口',
  housing: '房价',
  jobs: '收入就业',
  resources: '城市资源',
};

export function getMetricMeta(key: string): MetricMeta | undefined {
  return METRIC_DEFS.find(m => m.key === key);
}
