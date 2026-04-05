import { Card, CardContent } from "@/components/ui";
import type { RunningMode } from "@/types/running";

const MESSAGES: Record<RunningMode, string[]> = {
  normal: ["วันนี้พอแค่นี้ก็ถือว่าชนะแล้ว", "สม่ำเสมอแบบไม่ฝืน ดีกว่าเร่งแล้วหายไป"],
  slip: ["กลับมาอีกครั้งได้เสมอ", "ไม่ต้องชดเชย แค่ขยับเบา ๆ แล้วค่อยไปต่อ"],
  recovery: [
    "ไม่ต้องเก่ง แค่กลับมา",
    "ระบบนี้ไม่ลงโทษวันที่คุณหลุด",
    "วันนี้ทำให้ง่ายที่สุดก็พอ"
  ]
};

export function RecoveryMessage({ mode }: { mode: RunningMode }) {
  return (
    <Card>
      <CardContent className="space-y-2 pt-5">
        <p className="text-sm font-medium text-slate-500">Recovery Message</p>
        {MESSAGES[mode].map((item) => (
          <p key={item} className="text-sm text-slate-700">
            {item}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}
