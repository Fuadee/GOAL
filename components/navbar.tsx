'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  const baseItemClass =
    'theme-focus relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium tracking-[0.01em] text-stone-400 transition-colors duration-200 hover:bg-stone-100/5 hover:text-stone-100';

  const activeItemClass =
    'bg-[#b89a64]/15 text-[#e6d6b5] shadow-[inset_0_0_0_1px_rgba(184,154,100,0.35)]';

  return (
    <header className="sticky top-0 z-50 border-b border-stone-500/30 bg-[linear-gradient(180deg,rgba(16,18,24,0.96),rgba(14,16,22,0.9))] shadow-[0_10px_24px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-[90rem] items-center justify-between gap-4 px-4 md:px-7">
        <Link href="/" className="theme-focus group rounded-md pr-2">
          <span className="block text-[1.55rem] font-semibold tracking-[0.08em] text-stone-100 transition-colors duration-200 group-hover:text-[#efe4cd] md:text-[1.65rem]">
            GOAL
          </span>
          <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-stone-400">
            Mission Control
          </span>
        </Link>

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

      <nav className="border-t border-stone-400/25 bg-[rgba(16,18,24,0.96)] px-4 py-3 md:hidden" aria-label="Mobile main menu">
        <div className="mx-auto flex max-w-7xl flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {menuItems.map((item) => {
              const isActive = isPathActive(pathname, item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`${baseItemClass} min-h-[44px] px-3 py-2.5 text-center text-[13px] leading-tight whitespace-normal ${isActive ? activeItemClass : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="border-t border-stone-400/20 pt-2">
            <span className="inline-flex min-h-[40px] items-center rounded-md border border-stone-400/30 bg-stone-900/70 px-3 py-1.5 text-[11px] font-medium tracking-[0.04em] text-stone-300">
              Today&apos;s Focus
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}
