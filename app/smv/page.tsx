import { Navbar } from '@/components/navbar';
import { PageShell } from '@/components/ui/mission';
import { RelationshipMissionDashboard } from '@/components/smv/RelationshipMissionDashboard';

const CURRENT_APPROACHES = [
  {
    id: 'focus-date-setup',
    title: 'นัด Date แรกให้เกิดขึ้นจริงภายในสัปดาห์นี้',
    description: 'เลือก 1 ช่องทางที่ดีที่สุดและล็อกวัน/เวลาให้ชัดเจน',
    status: 'active' as const
  }
];

export default function SmvOverviewPage() {
  return (
    <PageShell className="smv-static">
      <Navbar />
      <RelationshipMissionDashboard approaches={CURRENT_APPROACHES} />
    </PageShell>
  );
}
