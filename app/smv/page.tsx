import { Navbar } from '@/components/navbar';
import { RelationshipMissionDashboard } from '@/components/smv/RelationshipMissionDashboard';
import { getSmvMissionReward, getSmvRealDateHistory } from '@/lib/smv/repository';

export default async function SmvOverviewPage() {
  const [initialDateHistory, initialReward] = await Promise.all([
    getSmvRealDateHistory(),
    getSmvMissionReward()
  ]);

  return (
    <main className="min-h-screen bg-slate-100/70">
      <Navbar />
      <RelationshipMissionDashboard initialDateHistory={initialDateHistory} initialReward={initialReward} />
    </main>
  );
}
