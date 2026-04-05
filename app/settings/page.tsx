"use client";

import { useState } from "react";
import { LayoutFrame } from "@/components/layout-frame";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { mockRunningProfile } from "@/lib/mock-data";

const RUN_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <LayoutFrame>
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>การตั้งค่าระบบ Running Quest</CardTitle>
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
              <span>เป้าหมายภารกิจหลัก</span>
              <input defaultValue={mockRunningProfile.targetGoal.toUpperCase()} className="w-full rounded-md border px-3 py-2" />
            </label>
            <label className="space-y-1 text-sm">
              <span>จำนวนวันวิ่งที่อยากได้/สัปดาห์</span>
              <input
                type="number"
                defaultValue={mockRunningProfile.preferredRunsPerWeek}
                className="w-full rounded-md border px-3 py-2"
              />
            </label>

            <fieldset className="col-span-2 space-y-2 text-sm">
              <legend className="font-medium">Preferred weekly run days (ไม่บังคับ)</legend>
              <div className="flex flex-wrap gap-2">
                {RUN_DAYS.map((day) => (
                  <label key={day} className="inline-flex items-center gap-2 rounded-md border px-3 py-2">
                    <input type="checkbox" defaultChecked={mockRunningProfile.preferredRunDays?.includes(day)} />
                    {day}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="col-span-2 flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked={mockRunningProfile.recoveryEnabled} />
              เปิดโหมด Recovery suggestions (ข้อความให้อภัยเมื่อห่างวิ่งหลายวัน)
            </label>

            <div className="col-span-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
              ระบบนี้ไม่มีการหัก EXP, ไม่มีลด Level, และไม่ Game Over เมื่อคุณหยุดไปหลายวัน
            </div>

            <div className="col-span-2 flex items-center gap-3">
              <Button type="submit">บันทึกการตั้งค่า</Button>
              {saved ? <p className="text-sm text-emerald-700">บันทึกเรียบร้อย</p> : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </LayoutFrame>
  );
}
