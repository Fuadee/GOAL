"use client";

import { useMemo, useState } from "react";
import { calculateRunXP } from "@/lib/running/quest";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export function RunLogForm() {
  const [saved, setSaved] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(12);
  const [distanceKm, setDistanceKm] = useState(1);
  const [weeklySessionIndex, setWeeklySessionIndex] = useState(1);

  const xpPreview = useMemo(
    () => calculateRunXP({ durationMinutes, distanceKm, weeklySessionIndex }),
    [durationMinutes, distanceKm, weeklySessionIndex]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>บันทึกการวิ่งวันนี้</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
          }}
        >
          <label className="space-y-1 text-sm">
            <span>วันที่</span>
            <input type="date" required className="w-full rounded-md border border-border px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm">
            <span>นาทีที่ออกกำลังกาย</span>
            <input
              type="number"
              min={1}
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full rounded-md border border-border px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>ระยะทาง (km)</span>
            <input
              type="number"
              min={0}
              step={0.1}
              required
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full rounded-md border border-border px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>ครั้งที่ของสัปดาห์นี้</span>
            <input
              type="number"
              min={1}
              max={7}
              value={weeklySessionIndex}
              onChange={(e) => setWeeklySessionIndex(Number(e.target.value))}
              className="w-full rounded-md border border-border px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>ประเภทกิจกรรม</span>
            <select className="w-full rounded-md border border-border px-3 py-2">
              <option value="walk">walk</option>
              <option value="jog">jog</option>
              <option value="run">run</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>ความหนัก</span>
            <select className="w-full rounded-md border border-border px-3 py-2">
              <option value="easy">ง่าย</option>
              <option value="moderate">พอดี</option>
              <option value="hard">หนัก</option>
            </select>
          </label>
          <label className="col-span-2 space-y-1 text-sm">
            <span>โน้ต</span>
            <textarea className="w-full rounded-md border border-border px-3 py-2" rows={3} />
          </label>

          <div className="col-span-2 rounded-lg bg-slate-100 p-3 text-sm">
            EXP ที่คาดว่าจะได้จากผลงานจริง: <span className="font-semibold">{xpPreview} EXP</span>
          </div>

          <div className="col-span-2 flex items-center gap-3">
            <Button type="submit">บันทึกผลการวิ่ง</Button>
            {saved ? <p className="text-sm text-emerald-700">บันทึกแล้ว 🎉 progress ของคุณยังอยู่</p> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
