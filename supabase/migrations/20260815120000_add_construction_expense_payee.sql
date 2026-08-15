-- Optional counterparty for payment history. Existing rows remain valid and unchanged.
ALTER TABLE public.construction_expenses
ADD COLUMN IF NOT EXISTS payee text NULL;

