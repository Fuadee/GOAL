DROP TABLE IF EXISTS public.projects CASCADE;

CREATE TABLE public.income_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('active', 'passive')),
  expected_income numeric(12,2) NOT NULL DEFAULT 0 CHECK (expected_income >= 0),
  actual_income numeric(12,2) NOT NULL DEFAULT 0 CHECK (actual_income >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  type text NOT NULL CHECK (type IN ('fixed', 'variable'))
);

CREATE TABLE public.rental_houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('planning', 'building', 'active')),
  monthly_income numeric(12,2) NOT NULL DEFAULT 0 CHECK (monthly_income >= 0)
);
