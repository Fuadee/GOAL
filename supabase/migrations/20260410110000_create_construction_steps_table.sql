CREATE TABLE IF NOT EXISTS public.construction_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_name text NOT NULL,
  step_order integer NOT NULL UNIQUE,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz
);

INSERT INTO public.construction_steps (step_name, step_order)
VALUES
  ('Design plan', 1),
  ('Submit to local authority', 2),
  ('Create BOQ', 3),
  ('Loan application', 4),
  ('Bank approval', 5),
  ('Contractor hiring', 6),
  ('Construction start', 7),
  ('Structural work', 8),
  ('System installation', 9),
  ('Finishing', 10),
  ('Inspection', 11)
ON CONFLICT (step_order) DO UPDATE
SET step_name = EXCLUDED.step_name;
