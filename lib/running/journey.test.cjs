/* eslint-disable @typescript-eslint/no-require-imports */
const test=require('node:test'),assert=require('node:assert/strict');
const {createLoader}=require('../../tests/health/helpers.cjs');
const {staircasePoint,fallbackAnchor}=createLoader()('components/health/three/track-layout.ts');
for(const compact of [false,true])test(`staircase has ten ascending, ordered stations (${compact?'mobile':'desktop'})`,()=>{
 const points=Array.from({length:10},(_,i)=>staircasePoint(i,compact));
 for(let i=1;i<points.length;i++){assert.ok(points[i].x>points[i-1].x);assert.ok(points[i].y>points[i-1].y);}
 assert.equal(points.at(-1).y,Math.max(...points.map(p=>p.y)));
});
test('semantic fallback preserves bottom-left to top-right order within the frame',()=>{
 const points=Array.from({length:10},(_,i)=>fallbackAnchor(i));
 for(let i=0;i<10;i++){assert.ok(points[i].x>0&&points[i].x<100);assert.ok(points[i].y>0&&points[i].y<100);if(i){assert.ok(points[i].x>points[i-1].x);assert.ok(points[i].y<points[i-1].y);}}
});
