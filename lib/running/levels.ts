export const LEVELS = [
  {
    level: 0,
    label: "Level 0 · เริ่มขยับ",
    durationLabel: "3-5 นาที",
    description: "แค่ได้ออกไปเดินหรือขยับตัวเบา ๆ ก็พอ"
  },
  {
    level: 1,
    label: "Level 1 · Beginner",
    durationLabel: "5-10 นาที",
    description: "เดินสลับจ๊อกเบา สร้างนิสัยให้กลับมา"
  },
  {
    level: 2,
    label: "Level 2 · Foundation",
    durationLabel: "10-20 นาที",
    description: "เริ่มจ๊อกต่อเนื่องมากขึ้น เดินลดลง"
  },
  {
    level: 3,
    label: "Level 3 · Builder",
    durationLabel: "20-30 นาที",
    description: "วิ่งต่อเนื่องและสร้างความมั่นใจ"
  },
  {
    level: 4,
    label: "Level 4 · 5K Ready",
    durationLabel: "30-40 นาที",
    description: "พร้อมจบ 5K แบบสบายขึ้น"
  }
] as const;

export function clampLevel(level: number) {
  return Math.max(0, Math.min(4, level));
}

export function getAdjustedLevel(currentLevel: number, daysSinceLastRun: number | null) {
  const baseLevel = clampLevel(currentLevel);

  if (daysSinceLastRun === null) {
    return Math.max(0, Math.min(baseLevel, 1));
  }

  if (daysSinceLastRun >= 7) {
    return 1;
  }

  if (daysSinceLastRun >= 4) {
    return clampLevel(baseLevel - 2);
  }

  if (daysSinceLastRun >= 2) {
    return clampLevel(baseLevel - 1);
  }

  return baseLevel;
}
