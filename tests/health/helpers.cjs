const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
function createLoader(stubs = {}) {
  const cache = new Map();
  function load(relative) {
    const file = path.resolve(root, relative);
    if (cache.has(file)) return cache.get(file).exports;
    const mod = new Module(file, module);
    mod.filename = file;
    mod.paths = Module._nodeModulePaths(path.dirname(file));
    mod.require = name => {
      if (Object.hasOwn(stubs, name)) return stubs[name];
      return name.startsWith('.') || name.startsWith('@/')
        ? load((name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name)) + '.ts') : require(name);
    };
    cache.set(file, mod);
    mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, file);
    return mod.exports;
  }
  return load;
}
const uuid = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
function run(distance = 5, seconds = 2400, activity = 'continuous', overrides = {}) {
  return { id: uuid(1), level_id: uuid(101), run_date: '2026-04-15', distance_km: distance,
    duration_seconds: seconds, pace_seconds_per_km: Math.round(seconds / distance), no_stop: activity === 'continuous',
    activity_type: activity, note: null, effort: null, result: 'failed_pace', created_at: '2026-04-15T10:00:00Z', updated_at: '2026-04-15T10:00:00Z', deleted_at: null, ...overrides };
}
// TEST FIXTURE transcribed from the supplied reference; never seeded into an application database.
const referenceHistory = [
  run(2.01,1045,'continuous',{id:uuid(1)}),
  run(1,405,'continuous',{id:uuid(2),run_date:'2026-04-13'}),
  ...[715,840,6100,2500,775].map((seconds,index)=>run(1,seconds,'continuous',{id:uuid(index+3),run_date:'2026-04-07'}))
];
module.exports = { createLoader, run, uuid, referenceHistory };
