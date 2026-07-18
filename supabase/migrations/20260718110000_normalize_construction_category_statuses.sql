-- Keep work progress separate from financial warnings.
-- This migration changes only construction_categories.status.
UPDATE public.construction_categories
SET status = CASE
  WHEN lower(trim(coalesce(status, ''))) IN ('warning', 'ใกล้เกินงบ') THEN 'in_progress'
  WHEN lower(trim(coalesce(status, ''))) IN ('in_progress', 'กำลังทำ') THEN 'in_progress'
  WHEN lower(trim(coalesce(status, ''))) IN ('done', 'completed', 'เสร็จแล้ว') THEN 'completed'
  WHEN lower(trim(coalesce(status, ''))) IN ('not_started', 'ยังไม่เริ่ม') THEN 'not_started'
  ELSE 'not_started'
END
WHERE status IS NULL
   OR status NOT IN ('not_started', 'in_progress', 'completed');

ALTER TABLE public.construction_categories
  ALTER COLUMN status SET DEFAULT 'not_started',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.construction_categories
  DROP CONSTRAINT IF EXISTS construction_categories_status_check;

ALTER TABLE public.construction_categories
  ADD CONSTRAINT construction_categories_status_check
  CHECK (status IN ('not_started', 'in_progress', 'completed'));
