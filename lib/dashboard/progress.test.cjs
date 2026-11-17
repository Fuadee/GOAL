/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const test = require('node:test');
const ts = require('typescript');

// Load pure TS modules using the project's existing Node test tooling.
const root = path.resolve(__dirname, '../..');
const cache = new Map();
function load(relative) {
  const file = path.resolve(root, relative);
  if (cache.has(file)) return cache.get(file).exports;
  const mod = new Module(file, module);
  mod.filename = file;
  mod.paths = Module._nodeModulePaths(path.dirname(file));
  mod.require = (name) => name.startsWith('.') || name.startsWith('@/')
    ? load((name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name)) + '.ts')
    : require(name);
  cache.set(file, mod);
  mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
  return mod.exports;
}
const { getOverallProgress, getFocusActions } = load('lib/dashboard/progress.ts');
const { getSmvProjectProgress } = load('lib/smv/project-progress.ts');
const { getRunningGoalProgress } = load('lib/running/progress.ts');
const { getFinancialGoalProgress } = load('lib/money/construction-progress.ts');
const { getBloodDonationPageProgress } = load('lib/blood-donation/progress.ts');
const { getInnovationGoalProgress } = load('lib/innovation/progress.ts');

test('overall is an unweighted mean, retains measured zero, and excludes unavailable/missing data', () => {
  assert.deepEqual(getOverallProgress([{id:'smv',percentage: 0}, {id:'money',percentage: 50}, {id:'innovation',percentage: 100}, {id:'health',percentage: null}, {id:'world',percentage: 80, unavailable: true}, {id:'health',percentage: NaN}]), { measuredCount: 3, percentage: 50 });
  assert.deepEqual(getOverallProgress([{id:'health',percentage: null}]), { measuredCount: 0, percentage: null });
  assert.equal(getOverallProgress([{id:'money',percentage: 120}, {id:'smv',percentage: 0}]).percentage, 60);
});

test('vision and secret sauce cannot enter overall or focus even with progress and actions', () => {
  const excluded = [
    {id:'vision',percentage:100,nextAction:{title:'Vision',dueDate:'2020-01-01'}},
    {id:'secret',percentage:100,nextAction:{title:'Knowledge',dueDate:'2020-01-01'}}
  ];
  const modules = [
    {id:'smv',percentage:0,nextAction:{title:'Milestone'}},
    {id:'money',percentage:50}, {id:'health',percentage:40},
    {id:'innovation',percentage:100}, {id:'world',percentage:60},
    ...excluded
  ];
  assert.deepEqual(getOverallProgress(modules), {measuredCount:5,percentage:50});
  assert.deepEqual(getFocusActions(modules).map(row=>row.id), ['smv']);
  assert.deepEqual(getOverallProgress(excluded), {measuredCount:0,percentage:null});
  assert.deepEqual(getFocusActions(excluded), []);
});

test('mission aggregates milestones across projects, rather than averaging project percentages', () => {
  const projects = [{smv_project_milestones: [{is_completed:true}]}, {smv_project_milestones: Array.from({length: 21}, () => ({is_completed:false}))}];
  assert.deepEqual(getSmvProjectProgress(projects), {completed: 1, total: 22, percentage: 5});
  projects[0].smv_project_milestones[0].is_completed = false;
  assert.equal(getSmvProjectProgress(projects).percentage, 0);
  assert.deepEqual(getSmvProjectProgress([]), {completed:0, total:0, percentage:0});
});

test('health uses best logged distance, not passed levels, and caps at the existing 5 km target', () => {
  assert.equal(getRunningGoalProgress({logs:[{distance_km:2.01}, {distance_km:1}]}).progress, 40.199999999999996);
  assert.equal(getRunningGoalProgress({logs:[{distance_km:8}]}).progress, 100);
  assert.equal(getRunningGoalProgress({logs:[]}).bestDistanceKm, 0);
});

test('finance preserves project selection, both expense types, and existing over-budget behavior', () => {
  const data = {
    projects: [{id:'other',name:'โครงการอื่น'}, {id:'rental',name:'บ้านเช่า 6 ห้อง'}],
    categories: [{project_id:'rental',budget:100,labor_budget:50,operation_checklist:[{id:'a',title:' งาน ',done:false}]}, {project_id:'other',budget:10000,labor_budget:0}],
    expenses: [{project_id:'rental',cost_type:'material',amount:100}, {project_id:'rental',cost_type:'labor',amount:80}, {project_id:'other',amount:10000}]
  };
  const result = getFinancialGoalProgress(data);
  assert.equal(result.progress, 120);
  assert.equal(result.summary.totalSpent, 180);
  assert.equal(result.summary.totalBudget, 150);
  assert.equal(result.checklist[0].title, 'งาน');
  assert.equal(getFinancialGoalProgress({...data,projects:[]}).summary, null);
});

test('donation uses the current three-visit page semantics and ignores noncompleted records', () => {
  assert.deepEqual(getBloodDonationPageProgress([{status:'completed'}, {status:'planned'}, {status:'cancelled'}, {status:'completed'}]), {completed:2,total:3,percentage:67});
  assert.equal(getBloodDonationPageProgress(Array.from({length:5}, () => ({status:'completed'}))).percentage, 100);
});

test('innovation shares derived completion state and keeps the target cap', () => {
  const completed = Array.from({length:12}, (_,i) => ({id:String(i),status:'completed',is_active:true,steps:[],updated_at:'2026-10-02'}));
  const result = getInnovationGoalProgress(completed);
  assert.deepEqual(result, {completed:12,total:10,percentage:100});
  assert.equal(getInnovationGoalProgress([]).percentage, 0);
});

test('focus only includes real actions, orders dated plans first, and limits to three without mutating input', () => {
  const modules = [{id:'smv',percentage:0,nextAction:{title:'Milestone'}}, {id:'innovation',percentage:100}, {id:'world',percentage:67,nextAction:{title:'Plan',dueDate:'2026-12-28'}}, {id:'money',percentage:0,unavailable:true,nextAction:{title:'Old'}}, {id:'health',percentage:40,nextAction:{title:'Run'}}, {id:'money',percentage:90,nextAction:{title:'Task'}}];
  assert.deepEqual(getFocusActions(modules).map(row=>row.id), ['world','smv','health']);
  assert.equal(modules[0].id, 'smv');
});
