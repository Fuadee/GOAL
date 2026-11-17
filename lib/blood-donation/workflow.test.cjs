/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const root = path.resolve(__dirname, '../..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, ...rest);
};
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  module._compile(code, filename);
};
require.extensions['.tsx'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  module._compile(code, filename);
};
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.test';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

const { getBloodDonationDashboardData } = require('./service.ts');
const { createPlannedBloodDonationEvent, markBloodDonationEventCompleted, rescheduleBloodDonationEvent } = require('./mutations.ts');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { BloodDonationDashboard } = require('../../components/heal-world/blood-donation/BloodDonationDashboard.tsx');

test('plan, reload, complete, reload preserve the existing donation and progress', async () => {
  const goal = {
    id: 'goal-1', title: 'Goal', target_count: 3, start_date: '2026-01-01', end_date: '2026-12-31',
    status: 'active', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
  };
  const events = [{
    id: 'event-1', goal_id: goal.id, planned_date: '2026-08-30', actual_date: '2026-08-30',
    status: 'completed', location: 'ศูนย์บริการโลหิต', note: 'ข้อมูลเดิม',
    created_at: '2026-08-30T00:00:00Z', updated_at: '2026-08-30T00:00:00Z'
  }];
  const oldFetch = global.fetch;
  global.fetch = async (input, init) => {
    const url = new URL(input);
    const table = url.pathname.split('/').pop();
    const method = init.method;
    if (method === 'GET') assert.equal(init.cache, 'no-store');
    if (table === 'blood_donation_goals') return Response.json([goal]);
    if (table !== 'blood_donation_events') throw Error(`Unexpected path: ${url.pathname}`);
    if (method === 'GET') return Response.json(events.map((item) => ({ ...item })));
    if (method === 'POST') {
      const item = { id: 'event-2', ...JSON.parse(init.body), actual_date: null, created_at: '2026-09-01T00:00:00Z', updated_at: '2026-09-01T00:00:00Z' };
      events.push(item);
      return Response.json([item]);
    }
    if (method === 'PATCH') {
      const item = events.find((row) => row.id === url.searchParams.get('id')?.slice(3) && row.status === 'planned');
      if (!item) return Response.json([]);
      Object.assign(item, JSON.parse(init.body));
      return Response.json([item]);
    }
    throw Error(`Unexpected method: ${method}`);
  };
  try {
    const initial = await getBloodDonationDashboardData();
    assert.equal(initial.summary.completedCount, 1);
    assert.equal(initial.summary.progressPercent, 33);

    const planned = await createPlannedBloodDonationEvent({ goal_id: goal.id, planned_date: '2026-12-28', location: 'โรงพยาบาล', note: 'ครั้งที่สอง' });
    const afterPlan = await getBloodDonationDashboardData();
    assert.equal(afterPlan.upcomingPlans[0].id, planned.id);
    assert.equal(afterPlan.summary.completedCount, 1);
    const report = renderToStaticMarkup(React.createElement(BloodDonationDashboard, { initialData: afterPlan }));
    assert.equal((report.match(/<h2[^>]*>ครั้งที่/g) ?? []).length, 3);
    assert.match(report, /33%/);
    assert.match(report, /วางแผนแล้ว/);
    assert.doesNotMatch(report, /Next Mission|Remaining|เลยมาแล้ว/);

    await rescheduleBloodDonationEvent(planned.id, { planned_date: '2026-12-29', location: 'โรงพยาบาลใหม่', note: 'แก้ไขแผน' });
    const afterEdit = await getBloodDonationDashboardData();
    assert.equal(afterEdit.upcomingPlans[0].planned_date, '2026-12-29');
    assert.equal(afterEdit.upcomingPlans[0].location, 'โรงพยาบาลใหม่');

    await markBloodDonationEventCompleted(planned.id, { actual_date: '2026-12-29' });
    const afterCompletion = await getBloodDonationDashboardData();
    assert.equal(afterCompletion.summary.completedCount, 2);
    assert.equal(afterCompletion.summary.progressPercent, 67);
    assert.equal(afterCompletion.upcomingPlans.length, 0);
    assert.equal(afterCompletion.events.find((item) => item.id === 'event-1').note, 'ข้อมูลเดิม');
    assert.equal(afterCompletion.events.find((item) => item.id === planned.id).note, 'แก้ไขแผน');
    await assert.rejects(() => markBloodDonationEventCompleted(planned.id, { actual_date: '2026-12-29' }));
  } finally {
    global.fetch = oldFetch;
  }
});
