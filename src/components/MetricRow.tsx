import type { MetricValue } from '@/lib/types';
import { getMetricMeta } from '@/lib/types';

export function formatMetric(m: MetricValue | undefined): string {
  if (!m) return '—';
  if (m.valueText) {
    try {
      const arr = JSON.parse(m.valueText);
      if (Array.isArray(arr)) return arr.join('、');
    } catch {}
    return m.valueText;
  }
  if (m.valueNum === null || m.valueNum === undefined) return '—';
  return `${m.valueNum.toLocaleString()} ${m.unit}`.trim();
}

export function MetricRow({
  metric,
  metricKey,
  highlight,
}: {
  metric: MetricValue | undefined;
  metricKey: string;
  highlight?: 'win' | 'lose' | null;
}) {
  const meta = getMetricMeta(metricKey);
  const label = meta?.label ?? metricKey;
  const tone =
    highlight === 'win' ? 'text-emerald-600' : highlight === 'lose' ? 'text-neutral-400' : '';
  return (
    <div className="flex items-baseline justify-between border-b border-neutral-100 py-2 text-sm last:border-0">
      <span className="text-neutral-500">{label}</span>
      <span className={`font-medium ${tone}`}>{formatMetric(metric)}</span>
    </div>
  );
}
