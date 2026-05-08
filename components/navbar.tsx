'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type MenuItem = {
  label: string;
  href: string;
};

const menuItems: MenuItem[] = [
  { label: 'SMV', href: '/smv' },
  { label: 'Money Management', href: '/money-management' },
  { label: 'Health', href: '/health' },
  { label: 'Innovation', href: '/innovation' },
  { label: 'Heal the World', href: '/heal-the-world' },
  { label: 'Secret Sauce', href: '/secret-sauce/sleep-cycle' }
];

const isPathActive = (pathname: string, href: string) => {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
};

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const baseItemClass =
    'theme-focus relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium tracking-[0.01em] text-stone-400 transition-colors duration-200 hover:bg-stone-100/5 hover:text-stone-100';

  const activeItemClass =
    'bg-[#b89a64]/15 text-[#e6d6b5] shadow-sm';

  return (
    <header className="sticky top-0 z-50 border-b border-stone-500/30 bg-[linear-gradient(180deg,rgba(16,18,24,0.96),rgba(14,16,22,0.9))] shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-[90rem] items-center justify-between gap-4 px-4 md:px-7">
        <Link href="/" className="theme-focus group rounded-md pr-2">
          <span className="block text-[1.55rem] font-semibold tracking-[0.08em] text-stone-100 transition-colors duration-200 group-hover:text-[#efe4cd] md:text-[1.65rem]">
            GOAL
          </span>
          <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-stone-400">
            Mission Control
          </span>
        </Link>

        <button
          type="button"
          className="theme-button-secondary inline-flex items-center border-stone-400/30 bg-stone-900/80 text-xs uppercase tracking-[0.08em] text-stone-200 md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          Menu
        </button>

        <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <nav className="no-scrollbar flex min-w-0 max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-stone-400/25 bg-white/[0.015] p-1.5" aria-label="Main menu">
            {menuItems.map((item) => {
              const isActive = isPathActive(pathname, item.href);

              return (
                <Link key={item.label} href={item.href} className={`${baseItemClass} ${isActive ? activeItemClass : ''}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center lg:flex">
          <span className="rounded-md border border-stone-400/30 bg-stone-900/70 px-3 py-1.5 text-[11px] font-medium tracking-[0.04em] text-stone-300">
            Today&apos;s Focus
          </span>
        </div>
      </div>

      {isMenuOpen ? (
        <nav className="border-t border-stone-400/25 bg-[rgba(16,18,24,0.96)] px-4 py-3 md:hidden" aria-label="Mobile main menu">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
              {menuItems.map((item) => {
                const isActive = isPathActive(pathname, item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`${baseItemClass} flex-shrink-0 ${isActive ? activeItemClass : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-stone-400/20 pt-2">
              <span className="rounded-md border border-stone-400/30 bg-stone-900/70 px-3 py-1.5 text-[11px] font-medium tracking-[0.04em] text-stone-300">
                Today&apos;s Focus
              </span>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
