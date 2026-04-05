import Link from "next/link";
import { Activity, BarChart3, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/log", label: "Run Log", icon: Activity },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShellNav({ pathname }: { pathname: string }) {
  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-border bg-white/90 p-6 backdrop-blur">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Adaptive 5K OS</p>
        <h1 className="mt-2 text-xl font-semibold">กลับมาวิ่งได้เสมอ</h1>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
