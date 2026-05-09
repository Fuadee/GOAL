'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type MenuItem = {
  label: string;
  href: string;
};

const menuItems: MenuItem[] = [
  { label: 'Vision', href: '/' },
  { label: 'SMV', href: '/smv' },
  { label: 'Money', href: '/money-management' },
  { label: 'Health', href: '/health' },
  { label: 'Innovation', href: '/innovation' },
  { label: 'Heal the World', href: '/heal-the-world' },
  { label: 'Secret Sauce', href: '/secret-sauce/sleep-cycle' }
];

const isPathActive = (pathname: string, href: string) => {
  if (href === '/') return pathname === '/';
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
};

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-stone-50/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 md:h-[74px] md:px-6">
        <Link href="/" className="theme-focus rounded-lg">
          <span className="block text-xl font-semibold tracking-[0.07em] text-slate-900 md:text-2xl">GOAL</span>
          <span className="block text-[11px] font-medium text-slate-500">Personal Operating Space</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main menu">
          {menuItems.map((item) => {
            const isActive = isPathActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`theme-focus rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-slate-50 shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="theme-focus inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          Menu
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/20"
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
          />
          <nav
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-slate-200 bg-stone-50 px-4 pb-6 pt-4 shadow-[0_-16px_50px_rgba(15,23,42,0.18)]"
            aria-label="Mobile main menu"
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300" />
            <div className="grid gap-2">
              {menuItems.map((item) => {
                const isActive = isPathActive(pathname, item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`theme-focus inline-flex min-h-11 items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-slate-50'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs opacity-70">●</span>
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
