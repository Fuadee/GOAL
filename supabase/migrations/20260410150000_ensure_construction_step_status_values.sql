ALTER TABLE public.construction_steps
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'not_started';

UPDATE public.construction_steps
SET status = CASE
  WHEN is_completed THEN 'completed'
  ELSE 'not_started'
END
WHERE status NOT IN ('not_started', 'in_progress', 'waiting', 'blocked', 'completed');

ALTER TABLE public.construction_steps
  DROP CONSTRAINT IF EXISTS construction_steps_status_check;

ALTER TABLE public.construction_steps
  ADD CONSTRAINT construction_steps_status_check
  CHECK (status IN ('not_started', 'in_progress', 'waiting', 'blocked', 'completed'));
