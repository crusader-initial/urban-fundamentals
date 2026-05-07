'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/', label: '城市', match: (p: string) => p === '/' || p.startsWith('/city') },
  { href: '/rank', label: '排名', match: (p: string) => p.startsWith('/rank') },
  { href: '/compare', label: '对比', match: (p: string) => p.startsWith('/compare') },
  { href: '/chat', label: '问答', match: (p: string) => p.startsWith('/chat') },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 text-sm">
      {ITEMS.map(item => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              active
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
