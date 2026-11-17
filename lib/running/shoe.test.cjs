/* eslint-disable @typescript-eslint/no-require-imports */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {createLoader}=require('../../tests/health/helpers.cjs');
const {ShoeRotation,SHOE_AUTO_SPEED}=createLoader()('components/health/three/shoe-rotation.ts');
test('shoe completes a full automatic revolution in ten active seconds at different frame rates',()=>{
 for(const fps of [24,30,60]){const r=new ShoeRotation(),start=r.angle;for(let n=0;n<fps*10;n++)r.step(1/fps);assert.ok(Math.abs(r.angle-start-Math.PI*2)<1e-8);}
});
test('automatic rotation stops during a held drag',()=>{
 const r=new ShoeRotation();r.begin();const angle=r.angle;for(let i=0;i<120;i++)r.step(1/60);assert.equal(r.angle,angle);
});
test('one viewport-width pointer drag rotates the shoe through 360 degrees',()=>{
 const r=new ShoeRotation(),angle=r.angle;r.begin();r.drag(480,480,.4);assert.ok(Math.abs(r.angle-angle-Math.PI*2)<1e-8);
});
test('release retains bounded inertia and smoothly returns to the automatic speed',()=>{
 const r=new ShoeRotation();r.begin();r.drag(-120,400,.1);assert.equal(r.velocity,-4);r.end();const before=r.angle;r.step(.03);assert.ok(r.angle<before);for(let i=0;i<180;i++)r.step(1/60);assert.ok(Math.abs(r.velocity-SHOE_AUTO_SPEED)<.001);
});
test('keyboard nudge rotates accurately and does not leave an active drag',()=>{
 const r=new ShoeRotation();r.begin();const start=r.angle;r.nudge(Math.PI/4);assert.equal(r.dragging,false);assert.ok(Math.abs(r.angle-start-Math.PI/4)<1e-8);
});
test('shipped GLB contains the licensed real mesh, three embedded maps and no unused variants',()=>{
 const b=fs.readFileSync('public/health/models/goal-shoe.glb');assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);
 const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));assert.equal(j.meshes.length,1);assert.equal(j.accessors[j.meshes[0].primitives[0].indices].count/3,22700);
 assert.equal(j.images.length,3);assert.equal(j.materials.length,1);assert.equal(j.extensions?.KHR_materials_variants,undefined);
 assert.match(j.asset.copyright,/Shopify/);assert.equal(j.asset.extras.license,'CC-BY-4.0');assert.ok(b.length<1600000);
 for(const view of j.bufferViews)assert.ok(view.byteOffset+view.byteLength<=j.buffers[0].byteLength);
});
