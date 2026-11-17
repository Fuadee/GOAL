/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const {createLoader} = require('../../tests/health/helpers.cjs');
const {chooseQuality} = createLoader()('components/health/three/quality.ts');
const capable = {enabled:true,reducedMotion:false,webgl:true,memory:8,cores:8,compact:false};
test('3D quality uses full rendering only on capable devices',()=>assert.equal(chooseQuality(capable),'full'));
test('mobile, medium memory and medium CPU use reduced on-demand rendering',()=>{
  for(const change of [{compact:true},{memory:4},{cores:4}]) assert.equal(chooseQuality({...capable,...change}),'reduced');
});
test('effects off, reduced motion, missing WebGL, save-data and weak hardware always fall back',()=>{
  for(const change of [{enabled:false},{reducedMotion:true},{webgl:false},{saveData:true},{memory:2},{cores:2}]) assert.equal(chooseQuality({...capable,...change}),'fallback');
});
test('unavailable optional hardware hints do not break quality selection',()=>{
  assert.equal(chooseQuality({...capable,memory:undefined,cores:undefined}),'full');
  assert.equal(chooseQuality({...capable,memory:undefined,cores:undefined,compact:true}),'reduced');
});
