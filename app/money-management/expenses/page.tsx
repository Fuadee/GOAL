import Link from 'next/link';

import { Navbar } from '@/components/navbar';
import { ExpensesManager } from '@/components/money-planner/ExpensesManager';
import { getExpenseManagementData } from '@/lib/money/service';

export default async function ExpensesManagementPage() {
  const data = await getExpenseManagementData();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 md:px-8 md:py-14">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Money Management</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Expense Management</h1>
          </div>
          <Link href="/money-management" className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
            Back to dashboard
          </Link>
        </div>

        <ExpensesManager expenses={data.expenses} />
      </section>
    </main>
  );
}
