// Phone-specific acceptance on the isolated fixture, never production data.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const out=path.resolve('tmp/health-verification/mobile-journey');fs.mkdirSync(out,{recursive:true});
const fixture=(route,body={})=>fetch(`http://127.0.0.1:54125/__test/${route}`,{method:'POST',body:JSON.stringify(body)});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 await context.addInitScript(()=>{
  Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});
  window.__trackBuffers=new Set();const create=WebGL2RenderingContext.prototype.createBuffer,remove=WebGL2RenderingContext.prototype.deleteBuffer;
  WebGL2RenderingContext.prototype.createBuffer=function(){const buffer=create.call(this);if(this.canvas.parentElement?.dataset.threeScene==='track')window.__trackBuffers.add(buffer);return buffer;};
  WebGL2RenderingContext.prototype.deleteBuffer=function(buffer){window.__trackBuffers.delete(buffer);return remove.call(this,buffer);};
 });
 const page=await context.newPage();page.setDefaultTimeout(20000);const checks=[],errors=[],metrics=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.location().url?.endsWith('/favicon.ico'))errors.push(m.text());});
 const track=()=>page.locator('[data-track-mode]'),host=()=>page.locator('[data-three-scene=track]');
 const ready=async()=>{await track().scrollIntoViewIfNeeded();await page.locator('[data-three-scene=track][data-three-ready=true]').waitFor();await page.waitForTimeout(650);};
 const check=async(name,fn)=>{await fn();checks.push(name);console.log(`PASS ${name}`);};
 async function screenshot(name){const panel=page.locator('[data-motion-region=roadmap]');await panel.evaluate(n=>n.scrollIntoView({block:'start'}));await page.waitForTimeout(150);const a=await panel.boundingBox(),b=await track().boundingBox();await page.screenshot({path:path.join(out,`${name}.png`),clip:{x:a.x,y:Math.max(0,a.y),width:a.width,height:b.y+b.height-Math.max(0,a.y)+16}});}
 async function framing(){
  const frame=await host().boundingBox(),nodes=await page.locator('[data-three-level]').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return{level:Number(n.dataset.threeLevel),x:r.x,y:r.y,w:r.width,h:r.height,font:parseFloat(getComputedStyle(n.querySelector('b')).fontSize),hit:document.elementsFromPoint(r.x+r.width/2,r.y+r.height/2).some(e=>e===n||n.contains(e))};}));
  assert.deepEqual(nodes.map(n=>n.level),[1,2,3,4,5,6,7,8,9,10]);
  for(const n of nodes){assert.ok(n.x>=frame.x&&n.x+n.w<=frame.x+frame.width);assert.ok(n.y>=frame.y&&n.y+n.h<=frame.y+frame.height);assert.ok(n.w>=44&&n.h>=44);assert.ok(n.font>=17);assert.ok(n.hit,`level ${n.level} obstructed`);}
  for(let i=0;i<10;i++)for(let j=i+1;j<10;j++){const a=nodes[i],b=nodes[j];assert.equal(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y,false,`overlapping ${a.level}/${b.level}`);}
  const rows=[];for(const n of [...nodes].sort((a,b)=>(a.y+a.h/2)-(b.y+b.h/2))){let row=rows.find(r=>Math.abs(r.y-(n.y+n.h/2))<8);if(!row){row={y:n.y+n.h/2,nodes:[]};rows.push(row);}row.nodes.push(n);}
  assert.deepEqual(rows.map(r=>r.nodes.sort((a,b)=>a.x-b.x).map(n=>n.level)),[[10,9,8],[5,6,7],[4,3],[1,2]]);
  assert.equal(await page.locator('[data-three-level="10"] span').count(),0,'no detached finish label');
  assert.equal(await host().getAttribute('data-finish-flag-bounds'),null,'old flag removed');
  assert.equal(await host().getAttribute('data-finish-plaque-bounds'),null,'old rectangular plaque removed');
  const gate=await host().getAttribute('data-finish-gate-bounds');if(await host().getAttribute('data-three-ready')==='true'){
   assert.ok(gate,'3D finish gate rendered');const bounds=JSON.parse(gate);
   for(const p of [bounds.gate,bounds.lettering])assert.ok(p.left>=0&&p.right<=100&&p.top>=0&&p.bottom<=100,'finish gate clipped');
   const p=bounds.lettering,center=nodes[9].x+nodes[9].w/2;
   assert.ok(Math.abs(frame.x+frame.width*(p.left+p.right)/200-center)<1,'lettering detached from Level 10');
   assert.ok(frame.y+frame.height*p.top/100>=nodes[9].y+nodes[9].h,'podium lettering overlaps Level 10');
   assert.ok(frame.y+frame.height*p.bottom/100<nodes[4].y,'podium overlaps next row');
   assert.ok(frame.width*(p.right-p.left)/100>=50,'integrated podium lettering too small');
   assert.ok(frame.x+frame.width*bounds.gate.right/100<nodes[8].x,'gate blocks adjacent checkpoint');
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.equal(await track().evaluate(n=>n.scrollWidth<=n.clientWidth),true);
 }
 try{
  await fixture('reset');await page.goto('http://127.0.0.1:3100/health');
  for(const width of [320,360,375,390,430])await check(`${width}px: ten readable non-overlapping targets, correct S traversal, finish inside card`,async()=>{
   await page.setViewportSize({width,height:844});await ready();await framing();assert.equal(await host().getAttribute('data-track-layout'),'mobile-s');
   for(let level=1;level<=10;level++){await page.locator(`[data-three-level="${level}"]`).tap();assert.equal(await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),String(level));assert.equal(await host().getAttribute('data-current-level'),'3');}
   await page.locator('[data-level-selector="4"]').tap();await screenshot(`mobile-${width}`);metrics.push({width,triangles:Number(await host().getAttribute('data-triangles')),drawCalls:Number(await host().getAttribute('data-draw-calls'))});
  });
  await check('actual states and current/selected distinction survive all fifty taps',async()=>{
   assert.equal(await page.locator('[data-three-level][data-state=passed]').count(),2);assert.equal(await page.locator('[data-three-level][data-state=available]').getAttribute('data-three-level'),'3');assert.equal(await page.locator('[data-three-level][data-state=locked]').count(),7);assert.equal(await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),'4');
  });
  await check('current has restrained size emphasis and dark metallic core while selection remains independent',async()=>{
   const current=page.locator('[data-three-level][data-state=available]');
   const appearance=await current.evaluate(n=>{const c=getComputedStyle(n),r=n.getBoundingClientRect();return{width:r.width,height:r.height,background:c.backgroundImage,font:getComputedStyle(n.querySelector('b')).fontSize};});
   assert.equal(appearance.width,48);assert.equal(appearance.height,48);assert.equal(appearance.font,'18px');assert.ok(appearance.background.includes('10, 21, 16'));assert.equal(await current.getAttribute('data-three-level'),'3');assert.equal(await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),'4');
   const completed=page.locator('[data-three-level="1"]'),locked=page.locator('[data-three-level="5"]');
   const styles=await page.locator('[data-three-level]').evaluateAll(nodes=>nodes.map(n=>{const c=getComputedStyle(n);return {state:n.dataset.state,width:n.getBoundingClientRect().width,color:c.color,border:c.borderColor,background:c.backgroundImage};}));
   assert.ok(appearance.width/styles[0].width>=1.08&&appearance.width/styles[0].width<=1.10);
   assert.equal(await completed.locator('svg').count(),1);assert.equal(await locked.locator('svg').count(),1);
   const luminance=color=>{const rgb=color.match(/\d+/g).slice(0,3).map(Number);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
   assert.ok(luminance(styles[2].border)>luminance(styles[0].border));assert.ok(luminance(styles[0].border)>luminance(styles[4].border));assert.ok(luminance(styles[4].border)<luminance(styles[9].border));
  });
  await check('repeated phone resizing releases obsolete GPU instance buffers',async()=>{
   await page.setViewportSize({width:390,height:844});await ready();const baseline=await page.evaluate(()=>window.__trackBuffers.size);assert.ok(baseline>0);await host().locator('canvas').evaluate(c=>window.__originalTrackCanvas=c);
   for(const width of [320,430,360,375,390]){await page.setViewportSize({width,height:844});await ready();}
   assert.equal(await host().locator('canvas').evaluate(c=>c===window.__originalTrackCanvas),true);assert.equal(await page.evaluate(()=>window.__trackBuffers.size),baseline);metrics.push({gpuBuffersAfterRepeatedResize:baseline});
  });
  await check('fixed mobile camera never moves, active animation is capped and offscreen pauses',async()=>{
   await ready();const before=await page.locator('[data-three-level]').evaluateAll(ns=>ns.map(n=>n.getAttribute('style')));const frames=Number(await host().getAttribute('data-frames'));await page.waitForTimeout(1000);const rendered=Number(await host().getAttribute('data-frames'))-frames;assert.ok(rendered>=8&&rendered<=23,`mobile frames ${rendered}`);assert.deepEqual(await page.locator('[data-three-level]').evaluateAll(ns=>ns.map(n=>n.getAttribute('style'))),before);assert.ok(Number(await host().getAttribute('data-draw-calls'))<85);assert.ok(Number(await host().getAttribute('data-triangles'))<30000);metrics.push({mobileFramesPerSecond:rendered});
   await page.locator('#running-history').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('[data-three-scene=track]').dataset.rendering==='paused');const stopped=await host().getAttribute('data-frames');await page.waitForTimeout(250);assert.equal(await host().getAttribute('data-frames'),stopped);
  });
  await check('keyboard navigation and explicit detail focus remain usable on phones',async()=>{
   await page.locator('[data-three-level="3"]').focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');assert.equal(await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),'4');await track().getByRole('button',{name:'ดูรายละเอียด'}).click();assert.equal(await page.locator('details[data-level="4"] summary').evaluate(n=>n===document.activeElement),true);
  });
  await check('effects OFF keeps all ten targets on the semantic S route',async()=>{
   await page.getByRole('button',{name:'เอฟเฟกต์ เปิด'}).click();await page.waitForFunction(()=>document.querySelectorAll('[data-three-scene] canvas').length===0);await page.setViewportSize({width:320,height:844});await track().scrollIntoViewIfNeeded();await framing();await page.locator('[data-three-level="4"]').tap();assert.equal(await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),'4');await screenshot('effects-off');
  });
  await check('reduced motion disables ambient movement while preserving the same ordered fallback',async()=>{
   await page.getByRole('button',{name:'เอฟเฟกต์ ปิด'}).click();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelectorAll('[data-three-scene] canvas').length===0);await track().scrollIntoViewIfNeeded();await framing();assert.equal(await page.locator('[data-three-level="3"]').evaluate(n=>getComputedStyle(n).animationName),'none');await screenshot('reduced-motion');await page.emulateMedia({reducedMotion:'no-preference'});
  });
  await check('WebGL loss retains the mobile route, target sizes and selection',async()=>{
   await ready();await host().locator('canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await page.waitForFunction(()=>document.querySelector('[data-three-scene=track]').dataset.threeFailed==='true');await framing();await page.locator('[data-three-level="8"]').tap();assert.equal(await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),'8');
  });
  await check('no unexpected JavaScript, hydration or WebGL errors',async()=>assert.deepEqual(errors,[]));
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors,metrics},null,2));console.log(`${checks.length} mobile journey checks passed`);
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await fixture('reset');await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
