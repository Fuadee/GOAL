CREATE TABLE IF NOT EXISTS public.construction_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text DEFAULT 'active',
  total_budget numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.construction_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  budget numeric DEFAULT 0,
  status text DEFAULT 'not_started',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.construction_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.construction_projects(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.construction_categories(id) ON DELETE SET NULL,
  expense_date date NOT NULL,
  title text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  note text,
  receipt_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_construction_categories_project_id ON public.construction_categories(project_id);
CREATE INDEX IF NOT EXISTS idx_construction_expenses_project_id ON public.construction_expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_construction_expenses_category_id ON public.construction_expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_construction_expenses_expense_date ON public.construction_expenses(expense_date);

DROP TRIGGER IF EXISTS trg_construction_projects_updated_at ON public.construction_projects;
CREATE TRIGGER trg_construction_projects_updated_at
BEFORE UPDATE ON public.construction_projects
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_construction_categories_updated_at ON public.construction_categories;
CREATE TRIGGER trg_construction_categories_updated_at
BEFORE UPDATE ON public.construction_categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_construction_expenses_updated_at ON public.construction_expenses;
CREATE TRIGGER trg_construction_expenses_updated_at
BEFORE UPDATE ON public.construction_expenses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

WITH project_seed AS (
  INSERT INTO public.construction_projects (name, description, status, total_budget)
  SELECT 'บ้านเช่า 12 คูหา', 'Project Budget Monitor', 'active', 788486
  WHERE NOT EXISTS (
    SELECT 1 FROM public.construction_projects WHERE name = 'บ้านเช่า 12 คูหา'
  )
  RETURNING id
),
target_project AS (
  SELECT id FROM project_seed
  UNION ALL
  SELECT id FROM public.construction_projects WHERE name = 'บ้านเช่า 12 คูหา'
  LIMIT 1
),
category_seed(name, budget, status, sort_order) AS (
  VALUES
    ('งานคอนกรีตฐาน', 96000, 'in_progress', 10),
    ('งานโครงสร้างหลังคา', 145000, 'in_progress', 20),
    ('งานปรับดิน', 58000, 'done', 30),
    ('งานประปา', 64000, 'not_started', 40),
    ('งานผนัง', 118000, 'in_progress', 50),
    ('งานพื้น', 82000, 'not_started', 60),
    ('งานฝ้า', 52000, 'not_started', 70),
    ('งานประตู-หน้าต่าง', 74486, 'not_started', 80),
    ('วัสดุตกแต่งหลังคา', 99000, 'warning', 90),
    ('อื่น ๆ', 0, 'not_started', 100)
)
INSERT INTO public.construction_categories (project_id, name, budget, status, sort_order)
SELECT target_project.id, category_seed.name, category_seed.budget, category_seed.status, category_seed.sort_order
FROM target_project
CROSS JOIN category_seed
WHERE NOT EXISTS (
  SELECT 1
  FROM public.construction_categories existing
  WHERE existing.project_id = target_project.id
    AND existing.name = category_seed.name
);
