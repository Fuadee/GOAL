"use client";

import { useState } from "react";
import { LayoutFrame } from "@/components/layout-frame";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { mockRunningProfile } from "@/lib/mock-data";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <LayoutFrame>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Settings / Profile</CardTitle>
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
              <span>เป้าหมายสูงสุด</span>
              <input defaultValue={mockRunningProfile.targetGoal.toUpperCase()} className="w-full rounded-md border px-3 py-2" />
            </label>
            <label className="space-y-1 text-sm">
              <span>วันวิ่งที่อยากได้ต่อสัปดาห์</span>
              <input
                type="number"
                defaultValue={mockRunningProfile.preferredRunsPerWeek}
                className="w-full rounded-md border px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>Default energy</span>
              <select defaultValue={mockRunningProfile.defaultEnergy} className="w-full rounded-md border px-3 py-2">
                <option value="low">low</option>
                <option value="normal">normal</option>
                <option value="high">high</option>
              </select>
            </label>
            <label className="flex items-center gap-2 pt-7 text-sm">
              <input type="checkbox" defaultChecked={mockRunningProfile.recoverySuggestionsEnabled} />
              เปิด recovery suggestions
            </label>

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
