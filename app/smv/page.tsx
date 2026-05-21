import { Navbar } from '@/components/navbar';
import { PageShell } from '@/components/ui/mission';
import { RelationshipMissionDashboard } from '@/components/smv/RelationshipMissionDashboard';

const CURRENT_APPROACHES = [
  {
    id: 'tinder',
    title: 'ลองใช้ Tinder',
    description: 'สร้าง profile จริงจัง และคุยกับคนที่น่าสนใจ',
    status: 'active' as const
  },
  {
    id: 'open-life',
    title: 'เปิดโอกาสให้ชีวิตมากขึ้น',
    description: 'คาเฟ่ / กิจกรรม / Meetup / เจอคนใหม่ๆ',
    status: 'active' as const
  },
  {
    id: 'less-bar',
    title: 'ลดการใช้ร้านเหล้าเป็น Social หลัก',
    description: 'เลือก environment ที่ดีต่อใจและอนาคต',
    status: 'active' as const
  },
  {
    id: 'new-place',
    title: 'ออกไปสถานที่ใหม่บ้าง',
    description: 'เปลี่ยนบรรยากาศ เปิดโลก',
    status: 'active' as const
  }
];

export default function SmvOverviewPage() {
  return (
    <PageShell className="smv-static">
      <Navbar />
      <RelationshipMissionDashboard startedAt="May 2026" approaches={CURRENT_APPROACHES} />
    </PageShell>
  );
}
