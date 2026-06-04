import { supabaseRestRequest } from '@/lib/supabase/rest';

import { DEFAULT_GOAL_VISION_USER_ID, GoalVisionImageRow } from './types';

export async function getGoalVisionImages(userId = DEFAULT_GOAL_VISION_USER_ID) {
  return supabaseRestRequest<GoalVisionImageRow[]>(
    `goal_vision_images?user_id=eq.${userId}&select=id,user_id,goal_key,image_path,created_at,updated_at&order=created_at.asc`,
    'GET'
  );
}
