import { AddInnovationForm } from '@/components/innovation/AddInnovationForm';
import { InnovationCard } from '@/components/innovation/InnovationCard';
import { ProgressBar } from '@/components/innovation/ProgressBar';
import { Navbar } from '@/components/navbar';
import { getInnovationDashboardData } from '@/lib/innovation/service';

const TARGET_INNOVATIONS = 10;

export default async function InnovationPage() {
  const innovations = await getInnovationDashboardData();

  return (
    <main className="app-shell">
      <Navbar />

      <section className="page-container space-y-8">
        <header className="page-header">
          <p className="page-kicker">Innovation Dashboard</p>
          <h1 className="page-title">Innovation System</h1>
          <p className="text-base text-[color:var(--text-secondary)] md:text-lg">Build 10 innovations to unlock your potential</p>
        </header>

        <ProgressBar current={innovations.length} total={TARGET_INNOVATIONS} />

        <AddInnovationForm currentCount={innovations.length} maxCount={TARGET_INNOVATIONS} />

        {innovations.length === 0 ? (
          <section className="theme-card border-dashed p-10 text-center backdrop-blur">
            <p className="text-[color:var(--text-secondary)]">No innovation yet. Start building your future.</p>
          </section>
        ) : (
          <section className="grid gap-5 md:grid-cols-2">
            {innovations.map((innovation) => (
              <InnovationCard key={innovation.id} innovation={innovation} />
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
