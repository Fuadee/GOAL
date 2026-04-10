ALTER TABLE public.construction_steps
  ADD COLUMN IF NOT EXISTS execution_state text NOT NULL DEFAULT 'doing',
  ADD COLUMN IF NOT EXISTS waiting_on text,
  ADD COLUMN IF NOT EXISTS waiting_since date,
  ADD COLUMN IF NOT EXISTS expected_response_date date,
  ADD COLUMN IF NOT EXISTS next_action_label text,
  ADD COLUMN IF NOT EXISTS risk_level text,
  ADD COLUMN IF NOT EXISTS is_current_focus boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS latest_update_text text;

UPDATE public.construction_steps
SET status = CASE
  WHEN status IN ('waiting', 'blocked') THEN 'in_progress'
  ELSE status
END,
execution_state = CASE
  WHEN status = 'waiting' THEN 'waiting'
  WHEN status = 'blocked' THEN 'blocked'
  WHEN status = 'completed' THEN 'doing'
  ELSE execution_state
END
WHERE status IN ('waiting', 'blocked', 'completed');

ALTER TABLE public.construction_steps
  DROP CONSTRAINT IF EXISTS construction_steps_status_check;

ALTER TABLE public.construction_steps
  ADD CONSTRAINT construction_steps_status_check
  CHECK (status IN ('not_started', 'in_progress', 'completed'));

ALTER TABLE public.construction_steps
  DROP CONSTRAINT IF EXISTS construction_steps_execution_state_check;

ALTER TABLE public.construction_steps
  ADD CONSTRAINT construction_steps_execution_state_check
  CHECK (execution_state IN ('doing', 'waiting', 'blocked', 'follow_up_needed'));

ALTER TABLE public.construction_steps
  DROP CONSTRAINT IF EXISTS construction_steps_risk_level_check;

ALTER TABLE public.construction_steps
  ADD CONSTRAINT construction_steps_risk_level_check
  CHECK (risk_level IN ('on_track', 'delayed', 'urgent') OR risk_level IS NULL);

UPDATE public.construction_steps
SET is_current_focus = false;

UPDATE public.construction_steps
SET
  is_current_focus = true,
  status = 'in_progress',
  execution_state = 'waiting',
  waiting_on = 'Local authority',
  waiting_since = '2026-04-03',
  expected_response_date = '2026-04-30',
  next_action_label = 'Create BOQ',
  risk_level = 'on_track',
  latest_update_text = 'Approval submitted, now waiting for response'
WHERE step_order = 2;
