"use client";

import { useState } from "react";

const navItems = [
  "SMV",
  "Money Management",
  "HealtH",
  "Innovation",
  "Heal the WORLD",
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <div className="text-lg font-semibold tracking-[0.18em] text-zinc-900">GOAL</div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-full border border-zinc-200 p-2 text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900 md:hidden"
        >
          <span className="sr-only">Open main menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <ul className="hidden items-center gap-1 rounded-full border border-zinc-200/80 bg-white/80 p-1 shadow-sm md:flex">
          {navItems.map((item) => (
            <li key={item}>
              <button
                type="button"
                className="rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition duration-200 hover:bg-zinc-100 hover:text-zinc-900"
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {isOpen ? (
        <div className="border-t border-zinc-100 bg-white px-6 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
