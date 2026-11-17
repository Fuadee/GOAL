/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const { createLoader, run, referenceHistory } = require('../../tests/health/helpers.cjs');
const load = createLoader();
const { RUNNING_LEVELS, computeAchievements, qualifiesForLevel, normalizeRunLog, activityType, validateRunInput, unmetReason } = load('lib/running/achievements.ts');
const { calculatePaceSecondsPerKm, parseMinuteSecondDuration, parseDurationToSeconds, formatPace, formatDuration, evaluateRunAttempt } = load('lib/running/quest.ts');
const { getRunningGoalProgress } = load('lib/running/progress.ts');
const done = logs => computeAchievements(logs).filter(level => level.progress.status === 'passed').map(level => level.level_number);

for (const [index, distance, seconds] of [[0,1,900],[1,2,1800],[2,2.5,2250],[3,3,2700],[4,4,3600],[5,5,3600],[6,5,3600],[7,5,3000],[8,5,2700],[9,5,2400]]) {
  test(`L${index + 1} exact distance/pace threshold, no pace requirement before L8`, () => {
    assert.equal(qualifiesForLevel(RUNNING_LEVELS[index], run(distance,seconds,index===5?'run_walk':'continuous')), true);
    assert.equal(qualifiesForLevel(RUNNING_LEVELS[index], run(distance - .01,seconds)), false);
    if (index >= 7) assert.equal(qualifiesForLevel(RUNNING_LEVELS[index],run(distance,seconds+1)),false);
  });
}
test('2.01 km 17:25 continuous passes L1–L2 only, distance and level percentages separate',()=>{
  const logs=[run(2.01,1045)];
  assert.deepEqual(done(logs),[1,2]);
  assert.equal(computeAchievements(logs)[2].progress.status,'available');
  assert.ok(Math.abs(getRunningGoalProgress({logs}).progress-40.2)<1e-10);
});
test('run/walk L6 evidence is pending at L3; later earlier-dated run unlocks retrospectively',()=>{
  const logs=[run(2.01,1045),run(5,3600,'run_walk',{id:'walk-run'})];
  const levels=computeAchievements(logs);
  assert.equal(levels[2].progress.status,'available');
  assert.equal(levels[5].conditionMet,true);
  assert.equal(levels[5].progress.status,'locked');
  assert.equal(levels[6].conditionMet,false);
  const additional=run(4,4000,'continuous',{id:'old',run_date:'2020-01-01'});
  assert.deepEqual(done([...logs,additional]),[1,2,3,4,5,6]);
  assert.deepEqual(done([additional,...logs].reverse()),[1,2,3,4,5,6]);
});
for(const [seconds,expected] of [[3600,7],[3000,8],[2700,9],[2400,10],[2401,9]]) {
 test(`5 km continuous ${seconds}s reaches level ${expected}`,()=>assert.equal(done([run(5,seconds)]).length,expected));
}
test('longer runs use average over actual distance, never a fabricated 5K split',()=>{
  assert.equal(done([run(5.5,2640)]).length,10);
  assert.equal(done([run(6,2880)]).length,10);
  assert.equal(done([run(5.5,2641)]).length,9);
});
test('walk and unknown cannot qualify; false/missing no_stop never becomes run_walk',()=>{
  for(const activity of ['walk','unknown']) assert.deepEqual(done([run(5,2400,activity)]),[]);
  assert.equal(activityType({no_stop:false}),'unknown');
  assert.equal(activityType({no_stop:null}),'unknown');
  assert.equal(activityType({}),'unknown');
  assert.equal(activityType({no_stop:true}),'continuous');
  assert.equal(activityType({no_stop:true,activity_type:'walk'}),'walk');
});
test('old seven records and legacy result fields are retained; slow continuous 1km now qualifies',()=>{
 const original=structuredClone(referenceHistory);
 const normalized=referenceHistory.map(normalizeRunLog);
 assert.deepEqual(done(normalized),[1,2]);
 assert.equal(normalized.length,7);
 assert.deepEqual(referenceHistory,original);
 assert.equal(normalized[2].result,'failed_pace');
 assert.equal(qualifiesForLevel(RUNNING_LEVELS[0],normalized[2]),true);
});
test('legacy pace-only compatibility labels derived duration and never certifies timed levels',()=>{
 const log=normalizeRunLog(run(5,0,'continuous',{pace_seconds_per_km:480}));
 assert.equal(log.duration_seconds,2400);
 assert.equal(log.duration_source,'legacy_pace');
 assert.equal(done([log]).length,7);
});
test('edits/deletes recompute and roll back levels without mutating originals',()=>{
 const original=run();
 assert.equal(done([original]).length,10);
 assert.equal(done([{...original,duration_seconds:3600}]).length,7);
 assert.equal(done([{...original,activity_type:'run_walk',no_stop:false}]).length,0);
 assert.equal(done([{...original,deleted_at:'2026-11-10T00:00:00Z'}]).length,0);
 assert.equal(done([]).length,0);
 assert.equal(original.duration_seconds,2400);
});
test('one run can satisfy every level regardless of legacy level/result',()=>{
 const log=run(5,2400,'continuous',{level_id:'old-level-1',result:'failed_multiple'});
 assert.equal(done([log]).length,10);
});
test('legacy progress and rewards are preserved but stale cached passed statuses are ignored',()=>{
 const saved={id:'reward',level_id:'level-1',status:'passed',reward_status:'claimed',reward_title:'Keep me'};
 const levels=computeAchievements([], [{...RUNNING_LEVELS[0],id:'level-1'}],[saved]);
 assert.equal(levels[0].progress.status,'available');
 assert.equal(levels[0].progress.reward_status,'claimed');
 assert.equal(saved.status,'passed');
});
test('pace is computed from elapsed duration, not rounded or client-supplied pace',()=>{
 const pace=calculatePaceSecondsPerKm(2401,5);
 assert.equal(pace,480.2);
 assert.equal(formatPace(pace),'8:00 /km');
 assert.equal(evaluateRunAttempt(RUNNING_LEVELS[9],run(5,2401,'continuous',{pace_seconds_per_km:1})).passed,false);
 assert.equal(formatPace(599.7),'10:00 /km');
 assert.equal(formatPace(NaN),'--:--');
 for(const [duration,distance] of [[0,5],[5,0],[NaN,5],[1,Infinity],[-1,5]]) assert.equal(calculatePaceSecondsPerKm(duration,distance),null);
});
for(const [value,expected] of [['17:25',1045],['1725',1045],['0:17:25',1045],['1:01:40',3700],['61:40',3700]]) {
 test(`duration ${value} parses to exact integer seconds`,()=>assert.equal(parseMinuteSecondDuration(value).durationSeconds,expected));
}
for(const invalid of ['','00:00','1:60','1:99:00','1:2:3:4','-15','abc123','1.25','NaN','Infinity','00:00:00']) {
 test(`reject invalid duration ${invalid}`,()=>assert.equal(parseMinuteSecondDuration(invalid).durationSeconds,null));
}
test('duration displays hours and rejects zero',()=>{
 assert.equal(formatDuration(6100),'1:41:40');
 assert.equal(parseDurationToSeconds('00:00'),null);
});
test('validation accepts slow valid history and rejects malformed or implausible measurements',()=>{
 const valid={run_date:'2026-04-15',distance_km:1,duration_seconds:6100,activity_type:'continuous'};
 assert.equal(validateRunInput(valid,'2026-11-10'),null);
 for(const patch of [{distance_km:-1},{distance_km:0},{distance_km:NaN},{distance_km:Infinity},{distance_km:1001},{duration_seconds:0},{duration_seconds:1.2},{duration_seconds:604801},{duration_seconds:20},{run_date:'2026-02-30'},{run_date:'2026-11-11'},{run_date:'xx'},{activity_type:'cycling'},{note:'a'.repeat(2001)},{effort:'bad'}]) assert.ok(validateRunInput({...valid,...patch},'2026-11-10'),JSON.stringify(patch));
});
test('help explains missing distance, continuous evidence, and pace',()=>{
 assert.match(unmetReason(RUNNING_LEVELS[9],run(2,2000,'run_walk')),/ขาดระยะ.*วิ่งต่อเนื่อง.*Pace/);
 assert.match(unmetReason(RUNNING_LEVELS[5],run(5,2400,'walk')),/เดินล้วน/);
});
test('distance progress excludes removed records and walking, retains unknown legacy distance',()=>{
 assert.equal(getRunningGoalProgress({logs:[run(5,3600,'walk'),run(10,6000,'continuous',{deleted_at:'now'}),run(2,1000,'unknown')]}).bestDistanceKm,2);
 assert.equal(getRunningGoalProgress({logs:[]}).progress,0);
});

test('shared Health mission describes L6 run/walk accurately without generating a training plan',()=>{
 const {getNextMissionText}=load('lib/running/quest.ts');
 assert.match(getNextMissionText({...RUNNING_LEVELS[5],progress:null,latestAttempt:null},null,'not_run'),/วิ่งสลับเดิน/);
 assert.match(getNextMissionText(null,null,'ran'),/10 Levels/);
});
