import Link from 'next/link';

import { Navbar } from '@/components/navbar';
import { ExpensesManager } from '@/components/money-planner/ExpensesManager';
import { getExpenseManagementData } from '@/lib/money/service';

export default async function ExpensesManagementPage() {
  const data = await getExpenseManagementData();

  return (
    <main className="app-shell">
      <Navbar />

      <section className="page-container space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="page-kicker">Money Management</p>
            <h1 className="page-title text-3xl md:text-4xl">Expense Management</h1>
          </div>
          <Link href="/money-management" className="theme-button-secondary">
            Back to dashboard
          </Link>
        </div>

        <ExpensesManager expenses={data.expenses} />
      </section>
    </main>
  );
}
