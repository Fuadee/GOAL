import { goalPercentage } from '../progress';
import type { RunnerDashboardData } from './quest.types';

export function getRunningGoalProgress(data: Pick<RunnerDashboardData, 'logs'>) {
  const targetDistanceKm = 5;
  const bestDistanceKm = data.logs.reduce((best, log) => !log.deleted_at && log.activity_type !== 'walk' && Number.isFinite(log.distance_km) ? Math.max(best, log.distance_km) : best, 0);
  return { targetDistanceKm, bestDistanceKm, progress: goalPercentage(bestDistanceKm, targetDistanceKm) };
}
