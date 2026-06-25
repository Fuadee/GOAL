'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type MenuItem = {
  label: string;
  href: string;
};

const menuItems: MenuItem[] = [
  { label: 'วิสัยทัศน์', href: '/' },
  { label: 'ภารกิจชีวิต', href: '/smv' },
  { label: 'การเงิน', href: '/money-management' },
  { label: 'สุขภาพ', href: '/health' },
  { label: 'นวัตกรรม', href: '/innovation' },
  { label: 'เพื่อสังคม', href: '/heal-the-world' },
  { label: 'สูตรลับ', href: '/secret-sauce/sleep-cycle' }
];

const isPathActive = (pathname: string, href: string) => {
  if (href === '/') return pathname === '/';
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
};

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-[90] border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between gap-4 px-8">
        <Link href="/" className="theme-focus group rounded-xl">
          <span className="block text-xl font-bold tracking-normal text-slate-950 md:text-2xl">GOAL</span>
          <span className="block text-[13px] font-normal text-slate-500 transition group-hover:text-slate-700">ระบบชีวิตส่วนตัว</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1.5 md:flex" aria-label="Main menu">
          {menuItems.map((item) => {
            const isActive = isPathActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`theme-focus inline-flex items-center rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-transparent text-slate-600 hover:bg-white hover:text-slate-950'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="theme-focus inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-950 md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
        >
          {isMenuOpen ? 'ปิด' : 'เมนู'}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <button
            type="button"
            className="fixed inset-0 z-[85] bg-slate-950/20"
            aria-label="ปิดเมนู"
            onClick={() => setIsMenuOpen(false)}
          />
          <nav
            className="fixed inset-x-3 top-[4.75rem] z-[95] overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-2xl"
            aria-label="Mobile main menu"
          >
            <div className="grid gap-1 p-2">
              {menuItems.map((item) => {
                const isActive = isPathActive(pathname, item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`theme-focus inline-flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'border border-blue-200 bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span>{item.label}</span>
                    {isActive ? <span className="text-xs text-slate-400">หน้าปัจจุบัน</span> : null}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
