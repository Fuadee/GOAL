ALTER TABLE public.construction_categories
ADD COLUMN IF NOT EXISTS operation_detail text,
ADD COLUMN IF NOT EXISTS operation_note text,
ADD COLUMN IF NOT EXISTS operation_checklist jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.construction_categories
SET operation_checklist = '[]'::jsonb
WHERE operation_checklist IS NULL;
