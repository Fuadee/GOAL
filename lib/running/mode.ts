import type { RunningMode, RunLog } from "@/types/running";
import { differenceInCalendarDays, parseISO } from "date-fns";

export function getDaysSinceLastRun(runLogs: RunLog[], baseDate = new Date()): number | null {
  if (!runLogs.length) return null;

  const sorted = [...runLogs].sort(
    (a, b) => parseISO(b.runDate).getTime() - parseISO(a.runDate).getTime()
  );

  return differenceInCalendarDays(baseDate, parseISO(sorted[0].runDate));
}

export function getCurrentMode(daysSinceLastRun: number | null): RunningMode {
  if (daysSinceLastRun === null) return "recovery";
  if (daysSinceLastRun <= 1) return "normal";
  if (daysSinceLastRun <= 3) return "slip";
  return "recovery";
}
