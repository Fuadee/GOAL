import { supabaseRestRequest } from '@/lib/supabase/rest';

import { CreatePersonalTraitInput, PersonalTraitRow, UpdatePersonalTraitInput } from './types';

export async function listPersonalTraits() {
  return supabaseRestRequest<PersonalTraitRow[]>('personal_traits?select=*&order=sort_order.asc,created_at.asc', 'GET');
}

export async function createPersonalTrait(input: CreatePersonalTraitInput) {
  const rows = await supabaseRestRequest<PersonalTraitRow[]>('personal_traits', 'POST', {
    title: input.title,
    description: input.description ?? null,
    is_active: input.is_active ?? false,
    sort_order: input.sort_order ?? 0
  });

  return rows[0] ?? null;
}

export async function togglePersonalTraitActive(id: string) {
  const rows = await supabaseRestRequest<PersonalTraitRow[]>(`personal_traits?id=eq.${id}&select=*`, 'GET');
  const trait = rows[0];

  if (!trait) return null;

  const updatedRows = await supabaseRestRequest<PersonalTraitRow[]>(`personal_traits?id=eq.${id}`, 'PATCH', {
    is_active: !trait.is_active
  });

  return updatedRows[0] ?? null;
}

export async function updatePersonalTrait(id: string, payload: UpdatePersonalTraitInput) {
  const updatedRows = await supabaseRestRequest<PersonalTraitRow[]>(`personal_traits?id=eq.${id}`, 'PATCH', payload);
  return updatedRows[0] ?? null;
}

export async function deletePersonalTrait(id: string) {
  await supabaseRestRequest<PersonalTraitRow[]>(`personal_traits?id=eq.${id}`, 'DELETE');
}
