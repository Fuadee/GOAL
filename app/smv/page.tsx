import { Navbar } from '@/components/navbar';
import { RelationshipMissionDashboard } from '@/components/smv/RelationshipMissionDashboard';

export default function SmvOverviewPage() {
  return (
    <main className="min-h-screen bg-slate-100/70">
      <Navbar />
      <RelationshipMissionDashboard />
    </main>
  );
}
