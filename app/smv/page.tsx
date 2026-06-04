import { Navbar } from '@/components/navbar';
import { RelationshipMissionDashboard } from '@/components/smv/RelationshipMissionDashboard';
import { getSmvRealDateHistory } from '@/lib/smv/repository';

export default async function SmvOverviewPage() {
  const initialDateHistory = await getSmvRealDateHistory();

  return (
    <main className="min-h-screen bg-slate-100/70">
      <Navbar />
      <RelationshipMissionDashboard initialDateHistory={initialDateHistory} />
    </main>
  );
}
