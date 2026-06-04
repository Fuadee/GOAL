import { supabaseRestRequest } from '@/lib/supabase/rest';
import { AssetMonthlySnapshotItemRow, AssetMonthlySnapshotRow, GrowthAssetRow, MoneyIncomeSourceRow } from '@/lib/money/types';

export async function getMoneyIncomeSources(): Promise<MoneyIncomeSourceRow[]> {
  return supabaseRestRequest<MoneyIncomeSourceRow[]>('money_income_sources?select=id,user_id,name,description,income_amount,expense_amount,expense_note,sort_order,is_active,created_at,updated_at&is_active=eq.true&order=sort_order.asc&order=created_at.asc', 'GET');
}

export async function getGrowthAssets(): Promise<GrowthAssetRow[]> {
  return supabaseRestRequest<GrowthAssetRow[]>('growth_assets?select=id,user_id,asset_name,asset_type,platform,current_value,invested_amount,profit_loss,return_percent,created_at,updated_at&order=created_at.asc', 'GET');
}


export async function getAssetMonthlySnapshots(): Promise<AssetMonthlySnapshotRow[]> {
  const snapshotsDesc = await supabaseRestRequest<Omit<AssetMonthlySnapshotRow, 'items'>[]>(
    'asset_monthly_snapshots?select=id,snapshot_month,total_value,created_at,updated_at&order=snapshot_month.desc&limit=24',
    'GET'
  );
  const snapshots = [...snapshotsDesc].reverse();
  const snapshotIds = snapshots.map((snapshot) => snapshot.id);
  const items = snapshotIds.length
    ? await supabaseRestRequest<AssetMonthlySnapshotItemRow[]>(
        `asset_monthly_snapshot_items?select=id,snapshot_id,asset_id,asset_name,asset_type,value,created_at&snapshot_id=in.(${snapshotIds.join(',')})&order=created_at.asc`,
        'GET'
      )
    : [];
  const itemsBySnapshot = items.reduce<Record<string, AssetMonthlySnapshotItemRow[]>>((acc, item) => {
    acc[item.snapshot_id] = [...(acc[item.snapshot_id] ?? []), item];
    return acc;
  }, {});

  return snapshots.map((snapshot) => ({ ...snapshot, items: itemsBySnapshot[snapshot.id] ?? [] }));
}
