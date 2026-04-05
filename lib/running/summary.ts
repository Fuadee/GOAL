import { formatDistanceToNowStrict, parseISO, subDays } from "date-fns";
import { th } from "date-fns/locale";
import type { RunLog } from "@/types/running";

export function getWeeklySummary(runLogs: RunLog[], now = new Date()) {
  const sevenDaysAgo = subDays(now, 6);
  const thirtyDaysAgo = subDays(now, 29);

  const runs7d = runLogs.filter((log) => parseISO(log.runDate) >= sevenDaysAgo).length;
  const runs30d = runLogs.filter((log) => parseISO(log.runDate) >= thirtyDaysAgo).length;
  const totalMinutes7d = runLogs
    .filter((log) => parseISO(log.runDate) >= sevenDaysAgo)
    .reduce((sum, log) => sum + log.durationMinutes, 0);

  return {
    runs7d,
    runs30d,
    totalMinutes7d,
    readiness: runs7d >= 3 ? "พร้อมดี" : runs7d >= 1 ? "เริ่มกลับมาแล้ว" : "เริ่มเบา ๆ ได้เลย"
  };
}

export function maybePromoteLevel(runLogs: RunLog[], currentLevel: number, now = new Date()) {
  const fourteenDaysAgo = subDays(now, 13);
  const recent = runLogs.filter((log) => parseISO(log.runDate) >= fourteenDaysAgo);

  // Promote conservatively: at least 6 runs in 14 days and enough total duration.
  const shouldPromote = recent.length >= 6 && recent.reduce((sum, log) => sum + log.durationMinutes, 0) >= 110;

  if (shouldPromote) {
    return Math.min(4, currentLevel + 1);
  }

  return currentLevel;
}

export function formatLastRunDistance(runDate: string) {
  return formatDistanceToNowStrict(parseISO(runDate), { addSuffix: true, locale: th });
}
