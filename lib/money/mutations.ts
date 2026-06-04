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

export async function findAssetMonthlySnapshotByMonth(snapshotMonth: string): Promise<{ id: string; snapshot_month: string; total_value: number; created_at: string; updated_at: string } | null> {
  const rows = await supabaseRestRequest<{ id: string; snapshot_month: string; total_value: number; created_at: string; updated_at: string }[]>(`asset_monthly_snapshots?select=id,snapshot_month,total_value,created_at,updated_at&snapshot_month=eq.${snapshotMonth}&limit=1`, 'GET');
  return rows[0] ?? null;
}

export async function createAssetMonthlySnapshot(payload: { snapshot_month: string; total_value: number }): Promise<{ id: string; snapshot_month: string; total_value: number; created_at: string; updated_at: string }> {
  const rows = await supabaseRestRequest<{ id: string; snapshot_month: string; total_value: number; created_at: string; updated_at: string }[]>('asset_monthly_snapshots', 'POST', payload);
  return rows[0];
}

export async function updateAssetMonthlySnapshot(id: string, payload: { total_value: number }): Promise<{ id: string; snapshot_month: string; total_value: number; created_at: string; updated_at: string }> {
  const rows = await supabaseRestRequest<{ id: string; snapshot_month: string; total_value: number; created_at: string; updated_at: string }[]>(`asset_monthly_snapshots?id=eq.${id}`, 'PATCH', payload);
  return rows[0];
}

export async function replaceAssetMonthlySnapshotItems(
  snapshotId: string,
  items: { asset_id: string | null; asset_name: string; asset_type: GrowthAssetType; value: number }[]
): Promise<void> {
  await supabaseRestRequest(`asset_monthly_snapshot_items?snapshot_id=eq.${snapshotId}`, 'DELETE');
  if (items.length === 0) return;
  await supabaseRestRequest('asset_monthly_snapshot_items', 'POST', items.map((item) => ({ ...item, snapshot_id: snapshotId })));
}
