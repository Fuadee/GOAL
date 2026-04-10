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
  { label: 'Heal the World', href: '/heal-the-world' }
];

const isPathActive = (pathname: string, href: string) => {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
};

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const baseItemClass =
    'theme-focus rounded-full border border-transparent px-4 py-2 text-sm font-medium tracking-[0.02em] text-slate-300 transition duration-200 hover:border-white/10 hover:bg-white/5 hover:text-slate-100';

  const activeItemClass =
    'border-[color:var(--border-strong)] bg-[color:color-mix(in_srgb,var(--surface-action)_88%,black_12%)] text-cyan-100 shadow-[0_0_0_1px_rgba(98,185,255,0.2)]';

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:rgba(10,17,30,0.86)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="theme-focus rounded-lg text-sm font-semibold uppercase tracking-[0.32em] text-slate-100">
          GOAL
        </Link>

        <button
          type="button"
          className="theme-button-secondary inline-flex items-center md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          Menu
        </button>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Main menu">
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

      {isMenuOpen ? (
        <nav className="border-t border-[color:var(--border)] px-4 py-4 md:hidden" aria-label="Mobile main menu">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = isPathActive(pathname, item.href);

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
