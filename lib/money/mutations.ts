import { supabaseRestRequest } from '@/lib/supabase/rest';
import { GrowthAssetRow, GrowthAssetType, MoneyIncomeSourceRow } from '@/lib/money/types';

export async function createMoneyIncomeSource(payload: {
  name: string;
  description?: string | null;
  income_amount: number;
  expense_amount: number;
  expense_note?: string | null;
  sort_order?: number;
}): Promise<MoneyIncomeSourceRow> {
  const rows = await supabaseRestRequest<MoneyIncomeSourceRow[]>('money_income_sources', 'POST', payload);
  return rows[0];
}

export async function updateMoneyIncomeSource(
  id: string,
  payload: {
    name: string;
    description?: string | null;
    income_amount: number;
    expense_amount: number;
    expense_note?: string | null;
  }
): Promise<MoneyIncomeSourceRow> {
  const rows = await supabaseRestRequest<MoneyIncomeSourceRow[]>(`money_income_sources?id=eq.${id}`, 'PATCH', payload);
  return rows[0];
}

export async function softDeleteMoneyIncomeSource(id: string): Promise<void> {
  await supabaseRestRequest<MoneyIncomeSourceRow[]>(`money_income_sources?id=eq.${id}`, 'PATCH', {
    is_active: false,
    updated_at: new Date().toISOString()
  });
}

export async function createGrowthAsset(payload: {
  asset_name: string;
  asset_type: GrowthAssetType;
  platform?: string | null;
  invested_amount: number;
  current_value: number;
}): Promise<GrowthAssetRow> {
  const rows = await supabaseRestRequest<GrowthAssetRow[]>('growth_assets', 'POST', payload);
  return rows[0];
}

export async function updateGrowthAsset(
  id: string,
  payload: {
    asset_name: string;
    asset_type: GrowthAssetType;
    platform?: string | null;
    invested_amount: number;
    current_value: number;
  }
): Promise<GrowthAssetRow> {
  const rows = await supabaseRestRequest<GrowthAssetRow[]>(`growth_assets?id=eq.${id}`, 'PATCH', payload);
  return rows[0];
}

export async function deleteGrowthAsset(id: string): Promise<void> {
  await supabaseRestRequest<GrowthAssetRow[]>(`growth_assets?id=eq.${id}`, 'DELETE');
}
