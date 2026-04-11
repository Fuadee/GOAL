import { GoalVisionKey } from './types';

export type GoalVisionItem = {
  key: GoalVisionKey;
  label: string;
  href: string;
  placeholderGlow: string;
  placeholderAccent: string;
};

export const GOAL_VISION_ITEMS: GoalVisionItem[] = [
  {
    key: 'smv',
    label: 'SMV',
    href: '/smv',
    placeholderGlow: 'from-cyan-400/45 via-sky-500/20 to-indigo-600/25',
    placeholderAccent: 'text-cyan-200'
  },
  {
    key: 'money',
    label: 'Money Management',
    href: '/money-management',
    placeholderGlow: 'from-emerald-400/45 via-green-500/20 to-teal-600/25',
    placeholderAccent: 'text-emerald-200'
  },
  {
    key: 'health',
    label: 'Health',
    href: '/health',
    placeholderGlow: 'from-orange-400/45 via-amber-500/20 to-rose-600/25',
    placeholderAccent: 'text-orange-200'
  },
  {
    key: 'innovation',
    label: 'Innovation',
    href: '/innovation',
    placeholderGlow: 'from-fuchsia-400/45 via-violet-500/20 to-indigo-700/25',
    placeholderAccent: 'text-fuchsia-200'
  },
  {
    key: 'world',
    label: 'Heal the World',
    href: '/heal-the-world',
    placeholderGlow: 'from-blue-400/45 via-indigo-500/20 to-cyan-700/25',
    placeholderAccent: 'text-blue-200'
  }
];

export function getGoalVisionItemByKey(key: GoalVisionKey) {
  return GOAL_VISION_ITEMS.find((item) => item.key === key);
}
