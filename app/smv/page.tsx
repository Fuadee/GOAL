import { Navbar } from '@/components/navbar';
import { PageShell } from '@/components/ui/mission';
import { RelationshipMissionDashboard } from '@/components/smv/RelationshipMissionDashboard';

export default function SmvOverviewPage() {
  return (
    <PageShell className="smv-static">
      <Navbar />
      <RelationshipMissionDashboard />
    </PageShell>
  );
}
