/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { createLoader } = require('../../tests/health/helpers.cjs');
const { assetValue, packAssets } = createLoader()('lib/money/asset-bubbles.ts');

test('assets that need compact labels rejoin the chart on wider screens at the same scale', () => {
  const points = [
    { id: 'large', value: 100, minDiameter: 54 },
    { id: 'small', value: 10, minDiameter: 84 },
    { id: 'tiny', value: 0.01, minDiameter: 54 },
  ];
  assert.deepEqual(packAssets(points, 280).circles.map(circle => circle.id), ['large']);
  const wide = packAssets(points, 900).circles;
  assert.deepEqual(wide.map(circle => circle.id), ['large', 'small']);
  assert.ok(Math.abs((wide[1].r / wide[0].r) ** 2 - 0.1) < 1e-9);
});

test('snapshot values drive the overview for every asset type, including receivables', () => {
  const rows = ['investment', 'safe', 'future', 'receivable'].map((asset_type, index) => ({
    id: String(index), asset_type, current_value: 25 + index * 10, invested_amount: 100,
  }));
  const points = rows.map(row => ({ id: row.id, value: assetValue(row) }));
  assert.equal(points.reduce((sum, point) => sum + point.value, 0), 160);
  const [largest] = packAssets(points, 360).circles;
  assert.equal(largest.id, '3');
  assert.equal(largest.value, 55);
  assert.equal(assetValue({ current_value: -5 }), -5);
});

test('positive circles share one area scale and remain inside their container', () => {
  const points = [0, -5, .01, 10, 24, 24, 111.5, 330].map((value, i) => ({ id: String(i), value }));
  for (const width of [240, 320, 390, 710, 1060]) {
    const layout = packAssets(points, width);
    assert.deepEqual(layout, packAssets([...points].reverse(), width));
    assert.equal(layout.circles.length, 6);
    const largest = layout.circles[0];
    for (const [index, circle] of layout.circles.entries()) {
      assert.ok(Math.abs(circle.r ** 2 / largest.r ** 2 - circle.value / largest.value) < 1e-9);
      assert.ok(circle.x - circle.r >= -1e-9 && circle.x + circle.r <= width + 1e-9);
      assert.ok(circle.y - circle.r >= -1e-9 && circle.y + circle.r <= layout.height + 1e-9);
      for (const other of layout.circles.slice(0, index)) {
        assert.ok(Math.hypot(circle.x - other.x, circle.y - other.y) >= circle.r + other.r);
      }
    }
  }
});
