import { VisionHeroCard } from '@/components/ui/VisionHeroCard';

type InnovationPrimaryGoalCardProps = {
  completedCount: number;
  targetCount: number;
  imageUrl: string | null;
};

export function InnovationPrimaryGoalCard({ completedCount, targetCount, imageUrl }: InnovationPrimaryGoalCardProps) {
  return (
    <VisionHeroCard
      imageUrl={imageUrl}
      imageAlt="ภาพเป้าหมายสร้างแอปให้สำเร็จ 10 แอปจากบอร์ดวิสัยทัศน์"
      emptyImageLabel="ยังไม่มีภาพเป้าหมายด้านนวัตกรรมในบอร์ดวิสัยทัศน์"
      eyebrow="เป้าหมายหลักด้านนวัตกรรม"
      title="สร้างแอปให้สำเร็จ 10 แอป"
      description="เปลี่ยนไอเดียให้กลายเป็นแอปที่ใช้งานได้จริง และสร้างให้สำเร็จตามเป้าหมายที่กำหนด"
      progressLabel="ความคืบหน้าสู่เป้าหมาย 10 แอป"
      completed={completedCount}
      target={targetCount}
      unitLabel="แอป"
    />
  );
}
