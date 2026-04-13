export type PersonalTraitRow = {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CreatePersonalTraitInput = {
  title: string;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number;
};

export type UpdatePersonalTraitInput = {
  title?: string;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number;
};
