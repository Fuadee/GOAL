'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type MenuItem = {
  label: string;
  href: string;
};

const menuItems: MenuItem[] = [
  { label: 'SMV', href: '/' },
  { label: 'Money Management', href: '/' },
  { label: 'HealtH', href: '/health' },
  { label: 'Innovation', href: '/' },
  { label: 'Heal the WORLD', href: '/' }
];

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const baseItemClass =
    'rounded-full px-4 py-2 text-sm font-medium tracking-wide text-slate-300 transition duration-200 hover:bg-white/10 hover:text-white';

  const activeItemClass = 'bg-white text-slate-900 shadow-lg shadow-white/20';

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.32em] text-white">
          GOAL
        </Link>

        <button
          type="button"
          className="inline-flex items-center rounded-full border border-white/20 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-white/40 hover:text-white md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          Menu
        </button>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Main menu">
          {menuItems.map((item) => {
            const isActive = item.href === '/health' ? pathname === '/health' : pathname === '/' && item.label === 'SMV';

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`${baseItemClass} ${isActive ? activeItemClass : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {isMenuOpen ? (
        <nav className="border-t border-white/10 px-6 py-4 md:hidden" aria-label="Mobile main menu">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = item.href === '/health' ? pathname === '/health' : pathname === '/' && item.label === 'SMV';

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`${baseItemClass} text-center ${isActive ? activeItemClass : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
