import { supabaseRestRequest } from '@/lib/supabase/rest';
import { AssetMonthlySnapshotItemRow, AssetMonthlySnapshotRow, GrowthAssetRow, MoneyIncomeSourceRow } from '@/lib/money/types';

export async function getMoneyIncomeSources(): Promise<MoneyIncomeSourceRow[]> {
  return supabaseRestRequest<MoneyIncomeSourceRow[]>('money_income_sources?select=*&is_active=eq.true&order=sort_order.asc&order=created_at.asc', 'GET');
}

export async function getGrowthAssets(): Promise<GrowthAssetRow[]> {
  return supabaseRestRequest<GrowthAssetRow[]>('growth_assets?select=*&order=created_at.asc', 'GET');
}


export async function getAssetMonthlySnapshots(): Promise<AssetMonthlySnapshotRow[]> {
  const snapshots = await supabaseRestRequest<Omit<AssetMonthlySnapshotRow, 'items'>[]>('asset_monthly_snapshots?select=*&order=snapshot_month.asc', 'GET');
  const items = await supabaseRestRequest<AssetMonthlySnapshotItemRow[]>('asset_monthly_snapshot_items?select=*&order=created_at.asc', 'GET');
  const itemsBySnapshot = items.reduce<Record<string, AssetMonthlySnapshotItemRow[]>>((acc, item) => {
    acc[item.snapshot_id] = [...(acc[item.snapshot_id] ?? []), item];
    return acc;
  }, {});

  return snapshots.map((snapshot) => ({ ...snapshot, items: itemsBySnapshot[snapshot.id] ?? [] }));
}
