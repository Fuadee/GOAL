ALTER TABLE public.construction_categories
ADD COLUMN IF NOT EXISTS labor_budget numeric NOT NULL DEFAULT 0;

ALTER TABLE public.construction_expenses
ADD COLUMN IF NOT EXISTS cost_type text NOT NULL DEFAULT 'material';

UPDATE public.construction_expenses
SET cost_type = 'material'
WHERE cost_type IS NULL OR cost_type = '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'construction_expenses_cost_type_check'
  ) THEN
    ALTER TABLE public.construction_expenses
    ADD CONSTRAINT construction_expenses_cost_type_check
    CHECK (cost_type IN ('material', 'labor'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_construction_expenses_cost_type
ON public.construction_expenses(cost_type);
