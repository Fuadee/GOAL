import { supabaseRestRequest } from '@/lib/supabase/rest';
import { GrowthAssetRow, MoneyIncomeSourceRow } from '@/lib/money/types';

export async function getMoneyIncomeSources(): Promise<MoneyIncomeSourceRow[]> {
  return supabaseRestRequest<MoneyIncomeSourceRow[]>('money_income_sources?select=*&is_active=eq.true&order=sort_order.asc&order=created_at.asc', 'GET');
}

export async function getGrowthAssets(): Promise<GrowthAssetRow[]> {
  return supabaseRestRequest<GrowthAssetRow[]>('growth_assets?select=*&order=created_at.asc', 'GET');
}
