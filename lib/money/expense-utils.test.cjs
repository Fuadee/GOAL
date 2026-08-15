/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const sourcePath = path.join(__dirname, 'expense-utils.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
  fileName: sourcePath,
}).outputText;
const expenseUtilsModule = new Module(sourcePath, module);
expenseUtilsModule.filename = sourcePath;
expenseUtilsModule.paths = Module._nodeModulePaths(__dirname);
expenseUtilsModule._compile(output, sourcePath);

const {
  formatConstructionExpenseDateTime,
  sortConstructionExpensesNewestFirst,
} = expenseUtilsModule.exports;

function expense(overrides) {
  return {
    id: overrides.id,
    project_id: 'project-1',
    category_id: null,
    cost_type: 'material',
    expense_date: '2026-08-15',
    title: overrides.id,
    amount: 100,
    payee: null,
    note: null,
    receipt_url: null,
    created_at: '2026-08-15T01:00:00.000Z',
    updated_at: '2026-08-15T01:00:00.000Z',
    ...overrides,
  };
}

test('sorts by transaction date before recorded timestamp', () => {
  const rows = [
    expense({ id: 'older-date', expense_date: '2026-08-14', created_at: '2026-08-15T10:00:00.000Z' }),
    expense({ id: 'newer-date', expense_date: '2026-08-15', created_at: '2026-08-14T10:00:00.000Z' }),
  ];

  assert.deepEqual(sortConstructionExpensesNewestFirst(rows).map((row) => row.id), ['newer-date', 'older-date']);
});

test('uses recorded timestamp to order expenses on the same day', () => {
  const rows = [
    expense({ id: 'morning', created_at: '2026-08-15T01:00:00.000Z' }),
    expense({ id: 'afternoon', created_at: '2026-08-15T08:00:00.000Z' }),
  ];

  assert.deepEqual(sortConstructionExpensesNewestFirst(rows).map((row) => row.id), ['afternoon', 'morning']);
});

test('falls back to the Bangkok date from created_at when expense_date is missing', () => {
  const rows = [
    expense({ id: 'before-midnight', expense_date: '', created_at: '2026-08-14T16:30:00.000Z' }),
    expense({ id: 'after-midnight', expense_date: '', created_at: '2026-08-14T17:30:00.000Z' }),
  ];

  assert.deepEqual(sortConstructionExpensesNewestFirst(rows).map((row) => row.id), ['after-midnight', 'before-midnight']);
});

test('formats the recorded time in Asia/Bangkok', () => {
  const row = expense({ id: 'formatted', expense_date: '2026-08-15', created_at: '2026-08-15T01:30:00.000Z' });
  assert.match(formatConstructionExpenseDateTime(row), /08:30/);
});

test('supports empty, one, and more than five expenses without mutating the source', () => {
  const empty = [];
  const one = [expense({ id: 'one' })];
  const six = Array.from({ length: 6 }, (_, index) => expense({ id: `row-${index}`, created_at: `2026-08-15T0${index}:00:00.000Z` }));

  assert.deepEqual(sortConstructionExpensesNewestFirst(empty), []);
  assert.equal(sortConstructionExpensesNewestFirst(one)[0].id, 'one');
  assert.equal(sortConstructionExpensesNewestFirst(six).slice(0, 5).length, 5);
  assert.equal(six[0].id, 'row-0');
});
