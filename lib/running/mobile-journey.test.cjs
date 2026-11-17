/* eslint-disable @typescript-eslint/no-require-imports */
const test=require('node:test'),assert=require('node:assert/strict');
const {createLoader}=require('../../tests/health/helpers.cjs');
const {MOBILE_STATIONS,mobileStation,mobileConnection,mobileFallbackAnchor,mobileFallbackPath}=createLoader()('components/health/three/mobile-track-layout.ts');
const sample=(points,t)=>({x:points[0].x*(1-t)**3+3*points[1].x*t*(1-t)**2+3*points[2].x*t*t*(1-t)+points[3].x*t**3,z:points[0].z*(1-t)**3+3*points[1].z*t*(1-t)**2+3*points[2].z*t*t*(1-t)+points[3].z*t**3});
test('mobile has ten unique stations and exactly nine consecutive numeric connections',()=>{
 assert.equal(MOBILE_STATIONS.length,10);assert.equal(new Set(MOBILE_STATIONS.map(p=>`${p.x}:${p.row}`)).size,10);
 for(let i=0;i<9;i++){const link=mobileConnection(i,2.5);assert.equal(link.from,i+1);assert.equal(link.to,i+2);assert.deepEqual(link.points[0],mobileStation(i,2.5));assert.deepEqual(link.points[3],mobileStation(i+1,2.5));}
});
test('serpentine rows preserve traversal instead of repeating or swapping levels',()=>{
 const rows=[3,2,1,0].map(row=>MOBILE_STATIONS.map((p,i)=>({...p,level:i+1})).filter(p=>p.row===row).sort((a,b)=>a.x-b.x).map(p=>p.level));
 assert.deepEqual(rows,[[1,2],[4,3],[5,6,7],[10,9,8]]);
});
test('curved track edges stay inside the fixed camera width across mobile aspect ratios',()=>{
 for(const width of [260,300,315,330,370])for(let i=0;i<9;i++){const link=mobileConnection(i,420/width*1.45);for(let n=0;n<=50;n++){const point=sample(link.points,n/50);assert.ok(Math.abs(point.x)+.27<2.9);}}
});
test('non-adjacent path segments never cross at any tested phone width',()=>{
 const cross=(a,b,c)=>(b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);
 for(const width of [260,300,315,330,370]){
  const edges=[];for(let i=0;i<9;i++){const link=mobileConnection(i,420/width*1.45);for(let n=0;n<24;n++)edges.push([sample(link.points,n/24),sample(link.points,(n+1)/24)]);}
  for(let a=0;a<edges.length;a++)for(let b=a+2;b<edges.length;b++){const [p,q]=edges[a],[r,s]=edges[b];assert.equal(cross(p,q,r)*cross(p,q,s)<-1e-12&&cross(r,s,p)*cross(r,s,q)<-1e-12,false);}
 }
});
test('DOM fallback keeps the same connected S route and safe numeric anchors',()=>{
 assert.equal((mobileFallbackPath().match(/ C/g)||[]).length,9);
 for(let i=0;i<10;i++){const p=mobileFallbackAnchor(i);assert.ok(p.x>=20&&p.x<=80);assert.ok(p.y>=17&&p.y<=86);}
});
