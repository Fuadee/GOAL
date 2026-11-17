// Actual in-memory PostgreSQL/WASM integration. No .env or network database is read.
// Install test-only runtime into ignored tmp/health-verification/sql-runtime.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('../../tmp/health-verification/sql-runtime/node_modules/@electric-sql/pglite');
const { referenceHistory } = require('./helpers.cjs');
const root = path.resolve(__dirname, '../..');
const read = name => fs.readFileSync(path.join(root, 'supabase/migrations', name), 'utf8');
const migration = read('20261110090000_running_ten_levels.sql');
const results = [];
(async () => {
  const db = new PGlite();
  async function check(name, fn) { await fn(); results.push(name); console.log(`PASS ${name}`); }
  async function rows(sql, params) { return (await db.query(sql, params)).rows; }
  async function asRole(role, fn) {
    await db.exec(`set role ${role}`);
    try { return await fn(); } finally { await db.exec('reset role'); }
  }
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      grant usage on schema public to anon, authenticated, service_role;`);
    const trigger = read('20260407030000_create_blood_donation_tables.sql').match(/create or replace function public\.set_updated_at_timestamp\(\)[\s\S]+?\$\$;/)[0];
    await db.exec(trigger);
    // gen_random_uuid is built into this PostgreSQL runtime; omit only the unrelated
    // pgcrypto extension bootstrap from the OLD migration (new migration runs verbatim).
    await db.exec(read('20260407070000_create_runner_quest_tables.sql').replace('create extension if not exists pgcrypto;', ''));
    await db.exec(read('20260512123000_add_health_reward_fields.sql'));
    const oldLevels = await rows('select id,level_number from runner_levels order by level_number');
    for (const log of referenceHistory) {
      await db.query(`insert into runner_run_logs
        (id,level_id,run_date,distance_km,duration_seconds,pace_seconds_per_km,no_stop,note,effort,result,created_at)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [log.id, oldLevels[0].id, log.run_date, log.distance_km, log.duration_seconds, log.pace_seconds_per_km,
        log.no_stop, log.note, log.effort, log.result, log.created_at]);
    }
    await db.exec(`update runner_level_progress set status='passed',reward_title='Preserve reward',reward_status='claimed',reward_claimed_at='2026-04-15' where level_id=(select id from runner_levels where level_number=1);
      grant select,insert,update on runner_run_logs to service_role;
      grant select on runner_levels,runner_level_progress to service_role;`);
    const before = await rows('select to_jsonb(r) as data from runner_run_logs r order by id');
    const beforeProgress = await rows('select to_jsonb(p) as data from runner_level_progress p order by id');
    await check('migration runs verbatim and preserves all original fields of seven records and rewards', async () => {
      await db.exec(migration);
      const after = await rows("select to_jsonb(r)-'activity_type'-'deleted_at'-'updated_at' as data from runner_run_logs r order by id");
      assert.deepEqual(after, before);
      assert.deepEqual(await rows('select to_jsonb(p) as data from runner_level_progress p order by id'), beforeProgress);
    });
    await check('10 definitions match rules; first five UUIDs remain unchanged; continuity stays unknown in storage', async () => {
      assert.deepEqual(await rows('select id,level_number from runner_levels where level_number<=5 order by level_number'), oldLevels);
      const levels = await rows('select distance_target_km::float as distance,pace_target_seconds_per_km as pace from runner_levels order by level_number');
      assert.deepEqual(levels.map(row=>row.distance), [1,2,2.5,3,4,5,5,5,5,5]);
      assert.deepEqual(levels.map(row=>row.pace), [null,null,null,null,null,null,null,600,540,480]);
      assert.equal((await rows("select count(*)::int as count from runner_run_logs where activity_type='unknown'"))[0].count,7);
    });
    await check('migration rerun keeps exactly seven initial snapshots and ten levels', async () => {
      await db.exec(migration);
      assert.equal((await rows('select count(*)::int as count from runner_run_log_revisions'))[0].count,7);
      assert.equal((await rows('select count(*)::int as count from runner_levels'))[0].count,10);
    });
    const firstId=referenceHistory[0].id;
    const stamp=(await rows('select updated_at::text as stamp from runner_run_logs where id=$1',[firstId]))[0].stamp;
    await check('service-role edit journals the original row and advances updated_at', async () => {
      await asRole('service_role',()=>db.query('update runner_run_logs set note=$2,activity_type=$3 where id=$1',[firstId,'edited locally','continuous']));
      const edited=(await rows('select updated_at::text as stamp,note from runner_run_logs where id=$1',[firstId]))[0];
      assert.notEqual(edited.stamp,stamp);
      const revision=(await rows("select snapshot,reason from runner_run_log_revisions where run_log_id=$1 and reason='edit'",[firstId]))[0];
      assert.equal(revision.snapshot.note,null);assert.equal(revision.snapshot.activity_type,'unknown');
    });
    await check('stale optimistic update changes no rows and adds no revision', async()=>{
      const result=await db.query('update runner_run_logs set note=$2 where id=$1 and updated_at=$3 returning id',[firstId,'stale',stamp]);
      assert.equal(result.rows.length,0);
      assert.equal((await rows('select count(*)::int as count from runner_run_log_revisions'))[0].count,8);
    });
    await check('soft delete preserves original history and journals the previous version',async()=>{
      await asRole('service_role',()=>db.query('update runner_run_logs set deleted_at=now() where id=$1',[firstId]));
      assert.equal((await rows('select count(*)::int as count from runner_run_logs'))[0].count,7);
      assert.equal((await rows('select count(*)::int as count from runner_run_logs where deleted_at is null'))[0].count,6);
      const revision=(await rows("select snapshot from runner_run_log_revisions where run_log_id=$1 and reason='visibility_change'",[firstId]))[0];
      assert.equal(revision.snapshot.note,'edited locally');assert.equal(revision.snapshot.deleted_at,null);
    });
    await check('rollback and failed constraints roll back both edits and their audit entries',async()=>{
      const count=(await rows('select count(*)::int as count from runner_run_log_revisions'))[0].count;
      await db.exec("begin;update runner_run_logs set note='rolled back';rollback;");
      await assert.rejects(db.query('update runner_run_logs set activity_type=$2 where id=$1',[firstId,'cycling']), error=>error.code==='23514');
      assert.equal((await rows('select count(*)::int as count from runner_run_log_revisions'))[0].count,count);
      assert.equal((await rows('select note from runner_run_logs where id=$1',[firstId]))[0].note,'edited locally');
    });
    await check('anonymous and authenticated roles cannot read or forge revisions',async()=>{
      for(const role of ['anon','authenticated']) {
        await asRole(role,async()=>{
          await assert.rejects(db.query('select * from runner_run_log_revisions'),error=>error.code==='42501');
          await assert.rejects(db.query("insert into runner_run_log_revisions (run_log_id,snapshot,reason) values ($1,'{}','forged')",[firstId]),error=>error.code==='42501');
        });
      }
    });
    await check('referenced original records cannot be physically deleted',async()=>{
      await assert.rejects(db.query('delete from runner_run_logs where id=$1',[firstId]),error=>['23503','23001'].includes(error.code));
      assert.equal((await rows('select count(*)::int as count from runner_run_logs'))[0].count,7);
    });
    const version=(await rows('select version() as version'))[0].version;
    fs.writeFileSync(path.join(root,'tmp/health-verification/sql-results.json'),JSON.stringify({runtime:version,checks:results,productionAccess:false},null,2));
    console.log(`${results.length} SQL integration checks passed.`);
  } finally {await db.close();}
})().catch(error=>{console.error(error.code, error.actual?.code, error.message);process.exitCode=1;});
