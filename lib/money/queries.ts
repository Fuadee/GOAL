import { supabaseRestRequest } from '@/lib/supabase/rest';
import { AssetMonthlySnapshotItemRow, AssetMonthlySnapshotRow, ConstructionCategoryRow, ConstructionExpenseRow, ConstructionInvestmentProjectsData, ConstructionProjectRow, GrowthAssetRow, MoneyIncomeSourceRow } from '@/lib/money/types';

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

export async function getConstructionInvestmentProjects(): Promise<ConstructionInvestmentProjectsData> {
  const projects = await supabaseRestRequest<ConstructionProjectRow[]>(
    'construction_projects?select=id,name,description,status,total_budget,created_at,updated_at&order=created_at.desc',
    'GET',
    undefined,
    { revalidate: false }
  );
  const projectIds = projects.map((project) => project.id);
  if (projectIds.length === 0) return { projects: [], categories: [], expenses: [] };

  const [categories, expenses] = await Promise.all([
    supabaseRestRequest<ConstructionCategoryRow[]>(
      `construction_categories?select=id,project_id,name,budget,labor_budget,status,operation_detail,operation_note,operation_checklist,sort_order,created_at,updated_at&project_id=in.(${projectIds.join(',')})&order=sort_order.asc&order=created_at.asc`,
      'GET',
      undefined,
      { revalidate: false }
    ),
    supabaseRestRequest<ConstructionExpenseRow[]>(
      `construction_expenses?select=id,project_id,category_id,cost_type,expense_date,title,amount,note,receipt_url,created_at,updated_at&project_id=in.(${projectIds.join(',')})&order=expense_date.desc&order=created_at.desc`,
      'GET',
      undefined,
      { revalidate: false }
    )
  ]);

  return { projects, categories, expenses };
}
