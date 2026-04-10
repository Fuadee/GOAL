ALTER TABLE public.construction_steps
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS target_date date,
  ADD COLUMN IF NOT EXISTS latest_update text;

UPDATE public.construction_steps
SET status = CASE
  WHEN is_completed THEN 'completed'
  ELSE 'not_started'
END
WHERE status NOT IN ('not_started', 'in_progress', 'waiting', 'blocked', 'completed');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'construction_steps_status_check'
  ) THEN
    ALTER TABLE public.construction_steps
      ADD CONSTRAINT construction_steps_status_check
      CHECK (status IN ('not_started', 'in_progress', 'waiting', 'blocked', 'completed'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.step_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid NOT NULL REFERENCES public.construction_steps(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS step_updates_step_id_created_at_idx
  ON public.step_updates (step_id, created_at DESC);
