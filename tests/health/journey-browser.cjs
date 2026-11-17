// Production browser acceptance against the isolated, in-memory fixture only.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {run}=require('./helpers.cjs');
const out=path.resolve('tmp/health-verification/journey');fs.mkdirSync(out,{recursive:true});
const api=(route,body={})=>fetch(`http://127.0.0.1:54125/__test/${route}`,{method:'POST',body:JSON.stringify(body)});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1100}});
 await context.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});});
 const page=await context.newPage();page.setDefaultTimeout(20000);const errors=[],checks=[],metrics=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.location().url?.endsWith('/favicon.ico'))errors.push(m.text());});
 const host=()=>page.locator('[data-three-scene=track]'),track=()=>page.locator('[data-track-mode]');
 const ready=async()=>{await track().scrollIntoViewIfNeeded();await page.locator('[data-three-scene=track][data-three-ready=true]').waitFor();await page.waitForTimeout(700);};
 const check=async(name,fn)=>{await fn();checks.push(name);console.log(`PASS ${name}`);};
 async function shot(name){const panel=page.locator('[data-motion-region=roadmap]');await panel.evaluate(n=>n.scrollIntoView({block:'start'}));await page.waitForTimeout(150);const a=await panel.boundingBox(),b=await track().boundingBox();await page.screenshot({path:path.join(out,`${name}.png`),clip:{x:a.x,y:Math.max(0,a.y),width:a.width,height:b.y+b.height-Math.max(0,a.y)+16}});}
 async function layout(){
  assert.equal(await page.locator('[data-three-level]').count(),10);
  const bounds=await host().boundingBox();const nodes=await page.locator('[data-three-level]').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return{level:Number(n.dataset.threeLevel),x:r.x,y:r.y,w:r.width,h:r.height,hit:document.elementsFromPoint(r.x+r.width/2,r.y+r.height/2).some(e=>e===n||n.contains(e))};}));
  nodes.forEach((n,i)=>{assert.equal(n.level,i+1);assert.ok(n.x>=bounds.x&&n.x+n.w<=bounds.x+bounds.width,`checkpoint ${i+1} horizontally clipped`);assert.ok(n.y>=bounds.y&&n.y+n.h<=bounds.y+bounds.height,`checkpoint ${i+1} vertically clipped`);assert.ok(n.hit,`checkpoint ${i+1} center obstructed`);assert.ok(n.w>=40&&n.h>=40);if(i&&page.viewportSize().width>=768){assert.ok(n.x>nodes[i-1].x);assert.ok(n.y<nodes[i-1].y);}});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await track().evaluate(n=>Array.from(n.querySelectorAll('*')).every(e=>e.scrollWidth<=e.clientWidth+1||getComputedStyle(e).overflowX==='visible')),true);
 }
 try{
  await api('reset');await page.goto('http://127.0.0.1:3100/health');await ready();
  await check('real data: two passed, current 03, remaining seven locked',async()=>{
   assert.equal(await host().getAttribute('data-model'),'geometric-staircase');assert.equal(await host().getAttribute('data-current-level'),'3');
   assert.equal(await page.locator('[data-three-level][data-state=passed]').count(),2);assert.equal(await page.locator('[data-three-level][data-state=locked]').count(),7);
  });
  await check('selected 04 updates details and selector while current remains 03',async()=>{
   await page.locator('[data-three-level="4"]').click();assert.equal(await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),'4');
   assert.equal(await page.locator('[data-level-selector="4"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-three-level="3"]').getAttribute('data-state'),'available');assert.equal(await host().getAttribute('data-current-level'),'3');
  });
  await check('hover highlight does not change the selected or current level',async()=>{
   const node=page.locator('[data-three-level="6"]');const before=await node.evaluate(n=>getComputedStyle(n).boxShadow);await node.hover();await page.waitForTimeout(300);assert.notEqual(await node.evaluate(n=>getComputedStyle(n).boxShadow),before);assert.equal(await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),'4');assert.equal(await host().getAttribute('data-current-level'),'3');
  });
  for(const width of [1440,1024,430,390,320])await check(`${width}px: all ten ordered checkpoints in frame, hit-testable, no horizontal scrolling`,async()=>{
   await page.setViewportSize({width,height:1100});await ready();await layout();await shot(`journey-${width}`);
   metrics.push({width,triangles:Number(await host().getAttribute('data-triangles')),drawCalls:Number(await host().getAttribute('data-draw-calls')),rendering:await host().getAttribute('data-rendering')});
  });
  await check('each mobile checkpoint and top selector selects the intended level',async()=>{
   for(let n=1;n<=10;n++){await page.locator(`[data-three-level="${n}"]`).click();assert.equal(await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),String(n));}
   await page.locator('[data-level-selector="4"]').click();assert.equal(await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),'4');assert.equal(await host().getAttribute('data-current-level'),'3');
  });
  await check('keyboard arrows, Home/End, Enter and details focus are usable',async()=>{
   await page.locator('[data-three-level="4"]').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('[data-three-level="5"]').evaluate(n=>n===document.activeElement),true);await page.keyboard.press('End');await page.keyboard.press('Enter');assert.equal(await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),'10');await page.keyboard.press('Home');assert.equal(await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),'1');
   await track().getByRole('button',{name:'ดูรายละเอียด'}).click();assert.equal(await page.locator('details[data-level="1"] summary').evaluate(n=>n===document.activeElement),true);
  });
  await check('desktop ambient renders at a bounded rate and pauses offscreen',async()=>{
   await page.setViewportSize({width:1440,height:1100});await ready();const before=Number(await host().getAttribute('data-frames'));await page.waitForTimeout(1000);const frames=Number(await host().getAttribute('data-frames'))-before;assert.ok(frames>10&&frames<=35,`frame count ${frames}`);
   assert.ok(Number(await host().getAttribute('data-triangles'))<30000);assert.ok(Number(await host().getAttribute('data-draw-calls'))<100);
   await page.locator('#running-history').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('[data-three-scene=track]').dataset.rendering==='paused');const stopped=await host().getAttribute('data-frames');await page.waitForTimeout(200);assert.equal(await host().getAttribute('data-frames'),stopped);metrics.push({desktopFramesPerSecond:frames});
  });
  await check('effects OFF retains semantic staircase and selection without WebGL',async()=>{
   await page.getByRole('button',{name:'เอฟเฟกต์ เปิด',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('[data-three-scene] canvas').length===0);await track().scrollIntoViewIfNeeded();await layout();await page.locator('[data-three-level="4"]').click();assert.equal(await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),'4');await shot('effects-off');await page.getByRole('button',{name:'เอฟเฟกต์ ปิด',exact:true}).click();
  });
  await check('OS reduced motion keeps all ten semantic controls and stops animation',async()=>{
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelectorAll('[data-three-scene] canvas').length===0);await page.setViewportSize({width:320,height:1100});await track().scrollIntoViewIfNeeded();await layout();assert.equal(await page.locator('[data-three-level="3"]').evaluate(n=>getComputedStyle(n).animationName),'none');await shot('reduced-motion');await page.emulateMedia({reducedMotion:'no-preference'});
  });
  await check('mobile uses a fixed camera, capped animation and real touch selection',async()=>{
   const touch=await browser.newContext({viewport:{width:390,height:1100},hasTouch:true,isMobile:true});const p=await touch.newPage();await p.goto('http://127.0.0.1:3100/health');await p.locator('[data-track-mode]').scrollIntoViewIfNeeded();await p.locator('[data-three-scene=track][data-three-ready=true]').waitFor();await p.locator('[data-three-level="7"]').tap();assert.equal(await p.locator('[data-selected-detail]').getAttribute('data-selected-detail'),'7');assert.equal(await p.locator('[data-three-scene=track]').getAttribute('data-rendering'),'reduced-animated');const frames=await p.locator('[data-three-scene=track]').getAttribute('data-frames');await p.waitForTimeout(300);assert.ok(Number(await p.locator('[data-three-scene=track]').getAttribute('data-frames'))>Number(frames));await touch.close();
  });
  await check('empty and fully completed histories derive current status from the actual engine',async()=>{
   await api('reset',{empty:true});await page.reload();await ready();assert.equal(await host().getAttribute('data-current-level'),'1');assert.equal(await page.locator('[data-three-level][data-state=passed]').count(),0);
   await fetch('http://127.0.0.1:54125/rest/v1/runner_run_logs',{method:'POST',body:JSON.stringify(run(5,2400,'continuous'))});await page.reload();await ready();assert.equal(await page.locator('[data-three-level][data-state=passed]').count(),10);assert.equal(await host().getAttribute('data-current-level'),'');await shot('all-completed');
  });
  await check('context loss degrades safely to the semantic staircase',async()=>{
   await host().locator('canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await page.waitForFunction(()=>document.querySelector('[data-three-scene=track]').dataset.threeFailed==='true');assert.equal(await host().locator('canvas').count(),0);await page.locator('[data-three-level="4"]').click();assert.equal(await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),'4');
  });
  await check('no JavaScript, hydration or unexpected WebGL console errors',async()=>assert.deepEqual(errors,[]));
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors,metrics},null,2));console.log(`${checks.length} journey checks passed`);
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await api('reset');await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
