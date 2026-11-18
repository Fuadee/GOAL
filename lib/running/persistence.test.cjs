/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader, run, uuid, referenceHistory } = require('../../tests/health/helpers.cjs');
const loadRules = createLoader();
const { RUNNING_LEVELS } = loadRules('lib/running/achievements.ts');

function setup(initial = referenceHistory, options = {}) {
 const rows = structuredClone(initial);
 const calls=[]; const revisions=[];
 const levels=RUNNING_LEVELS.map((level,index)=>({...level,id:uuid(101+index)}));
 async function request(path,method,body) {
   calls.push({path,method,body});
   const url=new URL(`http://test/${path}`); const table=url.pathname.slice(1); const query=url.searchParams;
   if(table==='runner_levels') return levels;
   if(table==='runner_level_progress'||table==='runner_rest_days') return [];
   if(query.get('select')==='activity_type,deleted_at,updated_at') {
     if(options.legacySchema) throw new Error('Supabase request failed (400): 42703 column does not exist');
     return [];
   }
   if(method==='GET') { const offset=Number(query.get('offset')||0); return structuredClone(rows.slice(offset,offset+(options.pageSize||500))); }
   if(method==='POST') {const row={id:uuid(1000+rows.length),created_at:'2026-11-10T00:00:00Z',updated_at:'2026-11-10T00:00:00Z',...body};rows.push(row);return [row];}
   if(method==='PATCH') {
     const row=rows.find(row=>`eq.${row.id}`===query.get('id') && `eq.${row.updated_at}`===query.get('updated_at') && !row.deleted_at);
     if(!row)return [];
     revisions.push(structuredClone(row));Object.assign(row,body,{updated_at:'2026-11-10T10:00:00Z'});return [row];
   }
   throw new Error(`Unexpected ${method} ${path}`);
 }
 const load=createLoader({'@/lib/supabase/rest':{supabaseRestRequest:request}});
 return {service:load('lib/running/quest.server.ts'),rows,calls,revisions};
}
const input={run_date:'2026-04-15',distance_km:5,duration_seconds:2400,activity_type:'continuous'};
test('read dashboard returns ten computed levels, all seven retained records and distinct stats',async()=>{
 const {service,rows,calls}=setup();const before=structuredClone(rows);
 const data=await service.getRunnerDashboardData();
 assert.equal(data.levels.length,10);assert.equal(data.logs.length,7);assert.equal(data.passedLevelsCount,2);assert.equal(data.currentLevel.level_number,3);
 assert.deepEqual(rows,before);assert.ok(calls.every(call=>call.method==='GET'));
});
test('old schema remains readable and is explicitly read-only',async()=>{
 const {service}=setup(referenceHistory,{legacySchema:true});const data=await service.getRunnerDashboardData();
 assert.equal(data.logs.length,7);assert.equal(data.storageReady,false);assert.equal(data.writesEnabled,false);
});
test('pagination reads all history beyond 100, including server page caps',async()=>{
 const old=run(5,2400,'continuous',{id:uuid(999),run_date:'2019-01-01'});
 const initial=[...Array.from({length:1005},(_,index)=>run(1,900,'continuous',{id:uuid(index+1)})),old];
 const {service,calls}=setup(initial,{pageSize:83});const data=await service.getRunnerDashboardData();
 assert.equal(data.logs.length,1006);assert.equal(data.passedLevelsCount,10);assert.ok(calls.filter(call=>call.path.includes('offset=')).length>10);
});
test('default write protection prevents all mutations',async()=>{
 const previous=process.env.GOAL_HEALTH_WRITES_ENABLED;delete process.env.GOAL_HEALTH_WRITES_ENABLED;
 try { const {service,calls}=setup();await assert.rejects(service.saveRunLog(input));await assert.rejects(service.deleteRunLog(uuid(1),'anything'));assert.equal(calls.length,0); }
 finally { if(previous===undefined)delete process.env.GOAL_HEALTH_WRITES_ENABLED;else process.env.GOAL_HEALTH_WRITES_ENABLED=previous; }
});
test('personal write opt-in requires the new columns and saves compact time through the form action', async t => {
 const previous = process.env.GOAL_HEALTH_WRITES_ENABLED;
 t.after(() => {
   if (previous === undefined) delete process.env.GOAL_HEALTH_WRITES_ENABLED;
   else process.env.GOAL_HEALTH_WRITES_ENABLED = previous;
 });
 process.env.GOAL_HEALTH_WRITES_ENABLED = 'true';
 const legacy = setup([], {legacySchema:true});
 assert.equal((await legacy.service.getRunnerDashboardData()).writesEnabled, false);
 assert.equal((await legacy.service.saveRunLog(input)).success, false);
 const {service, rows} = setup([]);
 assert.equal((await service.getRunnerDashboardData()).writesEnabled, true);
 const load = createLoader({'next/cache': {revalidatePath() {}}, '@/lib/running/quest.server': service});
 const form = new FormData();
 form.set('run_date', input.run_date);
 form.set('distance_km', '2.01');
 form.set('duration_input', '1802');
 form.set('activity_type', 'continuous');
 assert.equal((await load('app/health/actions.ts').createRunnerRunLogAction(form)).success, true);
 assert.equal(rows.length, 1);
 const [row] = rows;
 assert.equal(row.run_date, input.run_date);
 assert.equal(row.duration_seconds, 1082);
 assert.equal(row.pace_seconds_per_km, 538);
 assert.equal(row.activity_type, 'continuous');
 assert.equal(row.note, null);
 assert.equal(row.effort, null);
 const refreshed = await service.getRunnerDashboardData();
 assert.equal(refreshed.passedLevelsCount, 2);
 assert.equal(refreshed.longestNoStopDistance, 2.01);
});
test('public Vercel production accepts new runs and rejects history changes', async t => {
 const variables = ['VERCEL_ENV', 'GOAL_HEALTH_PUBLIC_LOGGING', 'GOAL_HEALTH_WRITES_ENABLED'];
 const previous = variables.map(name => process.env[name]);
 t.after(() => {
   variables.forEach((name, index) => {
     if (previous[index] === undefined) delete process.env[name];
     else process.env[name] = previous[index];
   });
 });
 delete process.env.GOAL_HEALTH_WRITES_ENABLED;
 delete process.env.GOAL_HEALTH_PUBLIC_LOGGING;
 process.env.VERCEL_ENV = 'production';
 const {service, rows, calls} = setup([]);
 const data = await service.getRunnerDashboardData();
 assert.equal(data.canCreateRun, true);
 assert.equal(data.writesEnabled, false);
 assert.equal((await service.saveRunLog(input)).success, true);
 const [{id, updated_at}] = rows;
 await assert.rejects(service.saveRunLog(input, {id, updated_at}));
 await assert.rejects(service.deleteRunLog(id, updated_at));
 await assert.rejects(service.markRunnerRestDay(input.run_date));
 process.env.VERCEL_ENV = 'preview';
 await assert.rejects(service.saveRunLog(input));
 process.env.VERCEL_ENV = 'production';
 process.env.GOAL_HEALTH_PUBLIC_LOGGING = 'false';
 await assert.rejects(service.saveRunLog(input));
 assert.equal(calls.filter(call => call.method !== 'GET').length, 1);
});
test('create, edit, soft-delete, optimistic conflict and continued logging after L10',async()=>{
 const previous=process.env.GOAL_HEALTH_WRITES_ENABLED;process.env.GOAL_HEALTH_WRITES_ENABLED='true';
 try {
  const {service,rows,revisions,calls}=setup();const baseline=structuredClone(rows);
  assert.equal((await service.saveRunLog(input)).success,true);
  assert.equal((await service.getRunnerDashboardData()).passedLevelsCount,10);
  assert.deepEqual(rows.slice(0,7),baseline);
  assert.equal((await service.saveRunLog({...input,duration_seconds:2500})).success,true,'still logs after quest completion');
  let last=rows.at(-1);
  assert.equal((await service.saveRunLog({...input,duration_seconds:3600},{id:last.id,updated_at:last.updated_at})).success,true);
  assert.equal(revisions[0].duration_seconds,2500);
  assert.equal((await service.saveRunLog(input,{id:last.id,updated_at:'stale'})).success,false);
  // Remove the sole L10 evidence; L7 remains from the edited run.
  const firstNew=rows[7];
  assert.equal((await service.deleteRunLog(firstNew.id,firstNew.updated_at)).success,true);
  assert.ok(firstNew.deleted_at);assert.equal(rows.length,9);
  assert.equal((await service.getRunnerDashboardData()).passedLevelsCount,7);
  assert.equal((await service.getRunnerDashboardData()).logs.length,8);
  assert.deepEqual(rows.slice(0,7),baseline);
  assert.ok(calls.every(call=>call.method!=='DELETE'));
  assert.ok(!calls.some(call=>call.method!=='GET' && call.path.startsWith('runner_level_progress')));
 } finally {if(previous===undefined)delete process.env.GOAL_HEALTH_WRITES_ENABLED;else process.env.GOAL_HEALTH_WRITES_ENABLED=previous;}
});
test('invalid input never writes and invalid filter identifiers are rejected',async()=>{
 const previous=process.env.GOAL_HEALTH_WRITES_ENABLED;process.env.GOAL_HEALTH_WRITES_ENABLED='true';
 try {const {service,calls}=setup();assert.equal((await service.saveRunLog({...input,distance_km:-1})).success,false);assert.equal((await service.deleteRunLog('id&or=true','any')).success,false);assert.ok(calls.every(call=>call.method==='GET'));}
 finally{if(previous===undefined)delete process.env.GOAL_HEALTH_WRITES_ENABLED;else process.env.GOAL_HEALTH_WRITES_ENABLED=previous;}
});
test('server action rejects malformed time and refreshes both health and dashboard after successful mutation',async()=>{
 const revalidated=[];let saved;
 const load=createLoader({'next/cache':{revalidatePath:path=>revalidated.push(path)},'@/lib/running/quest.server':{saveRunLog:async(input,edit)=>{saved={input,edit};return {success:true,message:'saved'};}}});
 const {createRunnerRunLogAction}=load('app/health/actions.ts');
 const form=new FormData();form.set('duration_input','junk1725');
 assert.equal((await createRunnerRunLogAction(form)).success,false);assert.equal(saved,undefined);
 form.set('duration_input','17:25');form.set('distance_km','2.01');form.set('run_date','2026-04-15');form.set('no_stop','false');
 assert.equal((await createRunnerRunLogAction(form)).success,true);
 assert.equal(saved.input.activity_type,'unknown');assert.equal(saved.input.duration_seconds,1045);
 assert.deepEqual(revalidated,['/health','/dashboard']);
});
test('action returns friendly errors without leaking database credentials/details',async()=>{
 const load=createLoader({'next/cache':{revalidatePath:()=>{}},'@/lib/running/quest.server':{saveRunLog:async()=>{throw new Error('secret token');}}});
 const form=new FormData();form.set('duration_input','40:00');
 const result=await load('app/health/actions.ts').createRunnerRunLogAction(form);
 assert.equal(result.success,false);assert.ok(!result.message.includes('secret'));
});
