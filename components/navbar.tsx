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
    'theme-focus relative whitespace-nowrap rounded-full border border-transparent px-4 py-2.5 text-sm font-semibold tracking-[0.06em] text-slate-400 transition-all duration-300 hover:-translate-y-px hover:border-cyan-300/20 hover:bg-cyan-300/[0.07] hover:text-slate-100 hover:shadow-[0_0_24px_rgba(56,189,248,0.12)]';

  const activeItemClass =
    'border-cyan-300/35 bg-gradient-to-b from-cyan-300/20 to-sky-500/10 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-10px_20px_rgba(8,47,73,0.45),0_0_28px_rgba(14,165,233,0.3)]';

  const statusChipClass =
    'rounded-md border border-cyan-200/20 bg-slate-950/45 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-300/90 backdrop-blur';

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-300/20 bg-[linear-gradient(180deg,rgba(8,17,35,0.94),rgba(7,14,28,0.84))] shadow-[0_1px_0_rgba(103,232,249,0.13),0_14px_45px_rgba(2,6,23,0.5)] backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between gap-4 px-4 py-4 md:px-7 md:py-5">
        <Link href="/" className="theme-focus group rounded-lg pr-2">
          <span className="block text-2xl font-semibold uppercase tracking-[0.34em] text-slate-100 transition-colors duration-300 group-hover:text-cyan-100 md:text-[1.75rem]">
            GOAL
          </span>
          <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.3em] text-cyan-200/70 md:text-[11px]">
            MISSION CONTROL
          </span>
        </Link>

        <button
          type="button"
          className="theme-button-secondary inline-flex items-center border-cyan-300/25 bg-slate-900/70 text-xs uppercase tracking-[0.16em] text-cyan-100 md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          Menu
        </button>

        <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <nav className="no-scrollbar flex min-w-0 max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.02] p-1.5" aria-label="Main menu">
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

        <div className="hidden items-center gap-2 lg:flex">
          <span className={statusChipClass}>SYSTEM ONLINE</span>
          <span className={statusChipClass}>FOCUS 92%</span>
          <span className={statusChipClass}>CURRENT MODE: BUILD</span>
        </div>
      </div>

      {isMenuOpen ? (
        <nav className="border-t border-cyan-200/10 px-4 py-4 md:hidden" aria-label="Mobile main menu">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
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
            <div className="flex flex-wrap items-center gap-2 border-t border-cyan-200/10 pt-3">
              <span className={statusChipClass}>SYSTEM ONLINE</span>
              <span className={statusChipClass}>FOCUS 92%</span>
              <span className={statusChipClass}>MODE: BUILD</span>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
