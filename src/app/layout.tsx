import type { Metadata } from 'next';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import { NavLinks } from '@/components/NavLinks';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '城市基本面 · Urban Fundamentals',
  description: '中国 Top 50 城市的经济、产业、人口、房价、就业、城市资源 6 大维度数据分析',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-neutral-900">
        <header className="sticky top-0 z-30 border-b border-neutral-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/" className="group flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-neutral-900 text-[10px] font-bold tracking-tight text-white">
                城
              </span>
              <span className="font-semibold tracking-tight">城市基本面</span>
              <span className="hidden text-xs text-neutral-400 sm:inline">
                Urban Fundamentals
              </span>
            </Link>
            <NavLinks />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
        <footer className="border-t border-neutral-200/70 py-6 text-center text-xs text-neutral-500">
          数据来源：各市统计公报、教育部、文旅部、东方财富、链家等。所有数据仅供参考。
        </footer>
      </body>
    </html>
  );
}
