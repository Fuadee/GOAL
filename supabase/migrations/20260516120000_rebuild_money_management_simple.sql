-- Reset old money-management tables
DROP TABLE IF EXISTS step_updates CASCADE;
DROP TABLE IF EXISTS construction_steps CASCADE;
DROP TABLE IF EXISTS money_goal_plans CASCADE;
DROP TABLE IF EXISTS rental_houses CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS income_sources CASCADE;

CREATE TABLE IF NOT EXISTS public.money_income_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  name text NOT NULL,
  description text NULL,
  income_amount numeric(12,2) NOT NULL DEFAULT 0,
  expense_amount numeric(12,2) NOT NULL DEFAULT 0,
  expense_note text NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_money_income_sources_user_id ON public.money_income_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_money_income_sources_is_active ON public.money_income_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_money_income_sources_sort_order ON public.money_income_sources(sort_order);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_money_income_sources_updated_at ON public.money_income_sources;
CREATE TRIGGER trg_money_income_sources_updated_at
BEFORE UPDATE ON public.money_income_sources
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.money_income_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "money_income_sources_select" ON public.money_income_sources;
DROP POLICY IF EXISTS "money_income_sources_insert" ON public.money_income_sources;
DROP POLICY IF EXISTS "money_income_sources_update" ON public.money_income_sources;
DROP POLICY IF EXISTS "money_income_sources_delete" ON public.money_income_sources;

CREATE POLICY "money_income_sources_select" ON public.money_income_sources FOR SELECT USING (true);
CREATE POLICY "money_income_sources_insert" ON public.money_income_sources FOR INSERT WITH CHECK (true);
CREATE POLICY "money_income_sources_update" ON public.money_income_sources FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "money_income_sources_delete" ON public.money_income_sources FOR DELETE USING (true);
