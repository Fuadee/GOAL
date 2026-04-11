import { supabaseRestRequest } from '@/lib/supabase/rest';

import { GoalVisionImageRow, GoalVisionKey } from './types';

export async function upsertGoalVisionImage(input: { user_id: string; goal_key: GoalVisionKey; image_path: string }) {
  const rows = await supabaseRestRequest<GoalVisionImageRow[]>('goal_vision_images?on_conflict=user_id,goal_key', 'POST', {
    user_id: input.user_id,
    goal_key: input.goal_key,
    image_path: input.image_path,
    updated_at: new Date().toISOString()
  });

  return rows[0] ?? null;
}

export async function deleteGoalVisionImageRecord(id: string) {
  await supabaseRestRequest<GoalVisionImageRow[]>(`goal_vision_images?id=eq.${id}`, 'DELETE');
}
