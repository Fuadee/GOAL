import { mockFocusItems, mockGoalModules } from '@/lib/dashboard/mock-data';
import {
  calculateLifeDirectionScore,
  generateAlerts,
  getLifeDirectionInterpretation,
  getLifeDirectionStatus,
  getStrongestModules,
  getWeakestModules
} from '@/lib/dashboard/scoring';
import { DashboardData } from '@/lib/dashboard/types';

export const getDashboardData = async (): Promise<DashboardData> => {
  const modules = mockGoalModules;
  const score = calculateLifeDirectionScore(modules);
  const lifeDirection = {
    score,
    status: getLifeDirectionStatus(score),
    interpretation: getLifeDirectionInterpretation(score)
  };

  const alerts = generateAlerts(modules);

  return {
    generatedAt: new Date().toISOString(),
    activeGoals: modules.length,
    modules,
    lifeDirection,
    balancePoints: [
      { axis: 'Money', value: modules.find((item) => item.key === 'money')?.currentScore ?? 0 },
      { axis: 'SMV', value: modules.find((item) => item.key === 'smv')?.currentScore ?? 0 },
      { axis: 'Health', value: modules.find((item) => item.key === 'health')?.currentScore ?? 0 },
      { axis: 'Innovation', value: modules.find((item) => item.key === 'innovation')?.currentScore ?? 0 },
      { axis: 'World', value: modules.find((item) => item.key === 'world')?.currentScore ?? 0 }
    ],
    strongestAreas: getStrongestModules(modules),
    weakestAreas: getWeakestModules(modules),
    focusItems: mockFocusItems,
    alerts
  };
};
