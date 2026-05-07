import { NextResponse } from 'next/server';
import { rankCitiesByMetric } from '@/lib/db';
import { getMetricMeta } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get('metric') ?? 'gdp';
  const order = (url.searchParams.get('order') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 50);

  const meta = getMetricMeta(key);
  const results = rankCitiesByMetric(key, order, limit);
  return NextResponse.json({
    metric_key: key,
    label: meta?.label ?? key,
    unit: meta?.unit ?? '',
    order,
    results,
  });
}
