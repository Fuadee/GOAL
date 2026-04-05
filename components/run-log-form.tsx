"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export function RunLogForm() {
  const [saved, setSaved] = useState(false);

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
            <span>นาทีที่วิ่ง</span>
            <input type="number" min={1} required className="w-full rounded-md border border-border px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm">
            <span>ประเภท</span>
            <select className="w-full rounded-md border border-border px-3 py-2">
              <option value="walk">walk</option>
              <option value="jog">jog</option>
              <option value="run">run</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>ความรู้สึก</span>
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
          <div className="col-span-2 flex items-center gap-3">
            <Button type="submit">บันทึก</Button>
            {saved ? <p className="text-sm text-emerald-700">บันทึกแล้ว 🎉</p> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
