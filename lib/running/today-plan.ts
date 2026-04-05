import type { EnergyLevel, RunningMode, TodayPlan } from "@/types/running";

interface PlanInput {
  currentLevel: number;
  adjustedLevel: number;
  mode: RunningMode;
  energy?: EnergyLevel;
}

const MODE_COPY: Record<RunningMode, string> = {
  normal: "โหมดปกติ",
  slip: "โหมดผ่อนความคาดหวัง",
  recovery: "โหมดพากลับ"
};

export function generateTodayPlan({ adjustedLevel, mode, energy = "normal" }: PlanInput): TodayPlan {
  const base = {
    0: { duration: "3-5", focus: "เดินเบา ๆ หรือออกไปสูดอากาศ" },
    1: { duration: "5-10", focus: "เดินสลับจ๊อกเบา" },
    2: { duration: "12-15", focus: "จ๊อกต่อเนื่องแบบสบาย" },
    3: { duration: "20-25", focus: "วิ่งต่อเนื่องด้วยความพยายามปานกลาง" },
    4: { duration: "30-35", focus: "วิ่งต่อเนื่องใกล้เป้าหมาย 5K" }
  }[adjustedLevel as 0 | 1 | 2 | 3 | 4];

  let durationRange = `${base.duration} นาที`;
  let focus = base.focus;

  if (mode === "slip") {
    durationRange = adjustedLevel <= 1 ? "5-8 นาที" : "8-12 นาที";
    focus = "จ๊อกเบาให้ร่างกายกลับมารู้จังหวะ";
  }

  if (mode === "recovery") {
    durationRange = adjustedLevel <= 1 ? "5 นาที" : "5-8 นาที";
    focus = "เดิน + จ๊อกเบาแบบไม่กดดัน";
  }

  if (energy === "low") {
    durationRange = mode === "normal" ? "8-12 นาที" : "5 นาที";
    focus = "เลือกเวอร์ชันที่ง่ายที่สุดของวันนี้";
  }

  if (energy === "high" && mode === "normal") {
    durationRange = adjustedLevel >= 3 ? "25-35 นาที" : "15-20 นาที";
    focus = "คุมความสบายและจบโดยยังเหลือแรง";
  }

  return {
    title: `${MODE_COPY[mode]} · วันนี้ทำเท่าที่ไหวก็ชนะแล้ว`,
    durationRange,
    focus,
    coachMessage: "ไม่ต้องเริ่มใหม่ทั้งหมด แค่เริ่มจากระดับที่เหมาะกับวันนี้"
  };
}
