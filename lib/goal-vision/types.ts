export const GOAL_VISION_KEYS = ['smv', 'money', 'health', 'innovation', 'world'] as const;

export type GoalVisionKey = (typeof GOAL_VISION_KEYS)[number];

export type GoalVisionImageRow = {
  id: string;
  user_id: string;
  goal_key: GoalVisionKey;
  image_path: string;
  created_at: string;
  updated_at: string;
};

export const DEFAULT_GOAL_VISION_USER_ID = 'local-user';
export const GOAL_VISION_BUCKET = 'goal-vision-images';
