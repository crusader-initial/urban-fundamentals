const STYLES: Record<string, string> = {
  一线: 'bg-amber-50 text-amber-700 ring-amber-200',
  新一线: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  二线: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export function TierBadge({ tier, size = 'sm' }: { tier: string; size?: 'sm' | 'md' }) {
  const cls = STYLES[tier] ?? 'bg-neutral-100 text-neutral-700 ring-neutral-200';
  const sizing = size === 'md' ? 'px-2.5 py-0.5 text-xs' : 'px-2 py-0.5 text-[11px]';
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ring-1 ring-inset ${sizing} ${cls}`}
    >
      {tier}
    </span>
  );
}
