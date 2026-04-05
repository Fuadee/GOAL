"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { AppShellNav } from "@/components/app-shell";

export function LayoutFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppShellNav pathname={pathname} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
