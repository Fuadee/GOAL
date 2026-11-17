/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader, run, uuid, referenceHistory } = require('../../tests/health/helpers.cjs');
const load = createLoader();
const { snapshot, confirmedFeedback } = load('components/health/motion/feedback.ts');
const { computeAchievements, normalizeRunLog } = load('lib/running/achievements.ts');
function dashboard(logs) { return { logs: logs.map(normalizeRunLog), levels: computeAchievements(logs.map(normalizeRunLog)) }; }
function receipt(log, kind='create') { return {kind,id:kind==='edit'?log.id:undefined,expected:{run_date:log.run_date,distance_km:log.distance_km,duration_seconds:log.duration_seconds,activity_type:log.activity_type}}; }
const baseline = dashboard(referenceHistory);
const fresh = run(5,2400,'continuous',{id:uuid(2000),run_date:'2026-04-16'});
test('motion does not celebrate a page load, existing passed levels, or an unconfirmed save',()=>{
 const before=snapshot(baseline);
 assert.equal(confirmedFeedback(before,baseline,receipt(fresh),1),null);
 assert.equal(confirmedFeedback(before,baseline,receipt(referenceHistory[0]),1),null);
});
test('one confirmed run produces a single summary for all eight new levels',()=>{
 const result=confirmedFeedback(snapshot(baseline),dashboard([...referenceHistory,fresh]),receipt(fresh),42);
 assert.equal(result.key,42);assert.equal(result.kind,'achievement');assert.deepEqual(result.levels,[3,4,5,6,7,8,9,10]);
 assert.ok(result.records.includes('เวลา 5K ดีที่สุด'));assert.equal(result.runId,fresh.id);
});
test('run/walk can earn a distance PB but cannot celebrate locked L6 as completed',()=>{
 const log={...fresh,activity_type:'run_walk',no_stop:false};
 const result=confirmedFeedback(snapshot(baseline),dashboard([...referenceHistory,log]),receipt(log),1);
 assert.equal(result.kind,'record');assert.deepEqual(result.levels,[]);assert.deepEqual(result.records,['ระยะทางสูงสุด']);
});
test('unrelated data refresh cannot satisfy an acknowledged receipt with different measurements',()=>{
 const unrelated={...fresh,distance_km:6};
 assert.equal(confirmedFeedback(snapshot(baseline),dashboard([...referenceHistory,unrelated]),receipt(fresh),1),null);
});
test('edits get neutral feedback, and reductions never generate unlock or PB celebration',()=>{
 const original=dashboard([...referenceHistory,fresh]);const slower={...fresh,duration_seconds:3600};
 const result=confirmedFeedback(snapshot(original),dashboard([...referenceHistory,slower]),receipt(slower,'edit'),1);
 assert.equal(result.kind,'updated');assert.deepEqual(result.levels,[]);assert.deepEqual(result.records,[]);
});
test('delete/reload cannot resolve a pending create or create a fake achievement',()=>{
 const original=dashboard([...referenceHistory,fresh]);
 assert.equal(confirmedFeedback(snapshot(original),baseline,receipt(fresh),1),null);
});
test('equal and worse performances do not announce a new PB',()=>{
 const before=dashboard([...referenceHistory,fresh]);const equal={...fresh,id:uuid(2001)};
 const result=confirmedFeedback(snapshot(before),dashboard([...before.logs,equal]),receipt(equal),1);
 assert.equal(result.kind,'saved');assert.deepEqual(result.records,[]);assert.deepEqual(result.levels,[]);
});
test('PB feedback ignores walking and only attributes records to the acknowledged run',()=>{
 const walking={...fresh,activity_type:'walk',no_stop:false};
 const result=confirmedFeedback(snapshot(baseline),dashboard([...referenceHistory,walking]),receipt(walking),1);
 assert.equal(result.kind,'saved');assert.deepEqual(result.records,[]);
});
