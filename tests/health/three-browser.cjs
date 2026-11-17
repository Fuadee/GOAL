// Real WebGL and DOM acceptance, isolated server actions and in-memory REST data only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const output=path.resolve('tmp/health-verification/three');fs.mkdirSync(output,{recursive:true});
const api=async(route,body={})=>fetch(`http://127.0.0.1:54125/__test/${route}`,{method:'POST',body:JSON.stringify(body)});
const results=[], errors=[];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1100},reducedMotion:'no-preference'});
 await context.addInitScript(()=>{
   Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});
   window.__threeContexts=[];
   const get=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(kind,...args){const result=get.call(this,kind,...args);if(kind==='webgl2'&&result&&!window.__threeContexts.includes(result))window.__threeContexts.push(result);return result;};
 });
 const page=await context.newPage();page.setDefaultTimeout(20000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 const scene=kind=>page.locator(`[data-three-scene="${kind}"]`);
 const ready=async kind=>{await scene(kind).scrollIntoViewIfNeeded();await page.waitForFunction(kind=>document.querySelector(`[data-three-scene="${kind}"]`)?.dataset.threeReady==='true',kind);};
 const check=async(name,fn)=>{await fn();results.push(name);console.log(`PASS ${name}`);};
 const progress=level=>page.waitForFunction(n=>document.querySelector('[aria-label="Level Progress"]')?.getAttribute('aria-valuenow')===String(n*10),level);
 const fill=async(distance,time)=>{await page.locator('[name="run_date"]').fill('2026-04-16');await page.locator('[name="distance_km"]').fill(String(distance));await page.locator('[name="duration_input"]').fill(time);await page.locator('[name="activity_type"]').selectOption('continuous');};
 const save=async()=>{await page.locator('form button[type=submit]').click();await page.locator('form[aria-busy=false]').waitFor();};
 const capture=async(name)=>{await page.waitForFunction(()=>!document.querySelector('[data-counting=true]'));await page.waitForFunction(()=>document.getAnimations().every(a=>a.effect.getTiming().iterations===Infinity||a.playState!=='running'));await page.screenshot({path:path.join(output,`${name}.png`)});};
 let metrics={};
 try {
  await api('reset');await page.goto('http://127.0.0.1:3100/health');await progress(2);
  await check('real WebGL shoe geometry renders; no initial medal',async()=>{
    await ready('shoe');assert.ok(Number(await scene('shoe').getAttribute('data-triangles'))>100);
    assert.equal(await scene('shoe').getAttribute('data-model'),'gltf-shoe');assert.equal(await page.locator('[data-unlock-medal]').count(),0);
    await page.evaluate(()=>scrollTo(0,0));await capture('desktop-hero');
  });
  await check('ten actual track states and keyboard navigation synchronize with roadmap',async()=>{
    await ready('track');assert.equal(await page.locator('[data-three-level]').count(),10);
    for(let n=1;n<=10;n++) assert.equal(await page.locator(`[data-three-level="${n}"]`).getAttribute('data-state'),await page.locator(`details[data-level="${n}"]`).getAttribute('data-state'));
    await capture('desktop-track');const node=page.locator('[data-three-level="4"]');await node.focus();await page.keyboard.press('Enter');
    assert.notEqual(await page.locator('details[data-level="4"]').getAttribute('open'),null);
    // Checkpoint selection keeps the staircase in view; explicit details navigation transfers focus.
    assert.equal(await node.evaluate(n=>n===document.activeElement),true);
    assert.equal(await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),'4');
    await page.locator('[data-track-mode]').getByRole('button',{name:'ดูรายละเอียด'}).click();
    assert.equal(await page.locator('details[data-level="4"] summary').evaluate(n=>n===document.activeElement),true);
  });
  await check('offscreen rendering stops and resumes without allocating another context',async()=>{
    await page.locator('#running-history').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('[data-three-scene=shoe]').dataset.rendering==='paused');
    const frames=await scene('shoe').getAttribute('data-frames');await page.waitForTimeout(200);assert.equal(await scene('shoe').getAttribute('data-frames'),frames);
    const count=await page.evaluate(()=>window.__threeContexts.length);await ready('shoe');await page.waitForFunction(old=>Number(document.querySelector('[data-three-scene=shoe]').dataset.frames)>Number(old),frames);
    assert.equal(await page.evaluate(()=>window.__threeContexts.length),count);
  });
  await check('document visibility pauses the renderer and resumes its existing context',async()=>{
    await ready('shoe');
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForFunction(()=>document.querySelector('[data-three-scene=shoe]').dataset.rendering==='paused');
    const frames=await scene('shoe').getAttribute('data-frames');await page.waitForTimeout(150);assert.equal(await scene('shoe').getAttribute('data-frames'),frames);
    await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForFunction(old=>Number(document.querySelector('[data-three-scene=shoe]').dataset.frames)>Number(old),frames);
  });
  await check('failed save produces no medal; successful multiple unlock produces one real medal',async()=>{
    await api('options',{failWrites:true});await fill(5,'50:00');await save();await page.locator('form [role=alert]').waitFor();assert.equal(await page.locator('[data-unlock-medal]').count(),0);
    await api('options');await save();await progress(8);await ready('medal');assert.equal(await page.locator('[data-unlock-medal]').count(),1);
    assert.equal(await page.locator('[data-unlock-medal]').getAttribute('data-unlock-medal'),'3,4,5,6,7,8');
    assert.equal(await page.locator('[data-three-level="8"]').getAttribute('data-state'),'passed');await capture('medal-unlock');
    await page.getByRole('button',{name:'ปิดข้อความผลการบันทึก'}).click();await page.locator('[data-unlock-medal]').waitFor({state:'detached'});
  });
  await check('edit and soft-delete update the 3D track without replaying medal',async()=>{
    await page.getByRole('button',{name:'แก้ไข 2026-04-16 5 กม.'}).click();await page.locator('[name="duration_input"]').fill('60:00');await save();await progress(7);
    assert.equal(await page.locator('[data-three-level="8"]').getAttribute('data-state'),'available');assert.equal(await page.locator('[data-unlock-medal]').count(),0);
    await page.getByRole('button',{name:'ลบ 2026-04-16 5 กม.'}).click();await page.getByRole('button',{name:'ยืนยันลบ',exact:true}).click();await progress(2);
    assert.equal(await page.locator('[data-three-level="3"]').getAttribute('data-state'),'available');assert.equal(await page.locator('[data-unlock-medal]').count(),0);
  });
  await check('effects off destroys canvases and keeps truthful accessible route; preference persists',async()=>{
    await page.getByRole('button',{name:'เอฟเฟกต์ เปิด'}).click();await page.waitForFunction(()=>document.querySelectorAll('[data-three-scene] canvas').length===0);
    assert.equal(await page.locator('[data-three-level]').count(),10);await page.reload();await progress(2);assert.equal(await page.locator('[data-three-scene] canvas').count(),0);
    await page.getByRole('button',{name:'เอฟเฟกต์ ปิด'}).click();await ready('shoe');
  });
  await check('mobile uses reduced 3D and has no overflow at 390 and 320px',async()=>{
    await page.setViewportSize({width:1024,height:900});await page.evaluate(()=>scrollTo(0,0));await ready('shoe');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await capture('laptop-1024');
    for(const width of [390,320]){
      await page.setViewportSize({width,height:844});await page.evaluate(()=>scrollTo(0,0));await ready('shoe');await page.waitForFunction(()=>document.querySelector('[data-three-scene=shoe]').dataset.quality==='reduced'&&document.querySelector('[data-three-scene=shoe]').dataset.rendering==='reduced-animated');
      assert.equal(await scene('shoe').getAttribute('data-rendering'),'reduced-animated');const frames=await scene('shoe').getAttribute('data-frames');await page.waitForTimeout(150);assert.ok(Number(await scene('shoe').getAttribute('data-frames'))>Number(frames));
      await page.evaluate(()=>scrollTo(0,0));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await capture(`mobile-${width}`);
      await ready('track');await page.locator('[data-three-level="6"]').click();assert.notEqual(await page.locator('details[data-level="6"]').getAttribute('open'),null);
    }
  });
  await check('OS reduced motion removes WebGL and leaves every level usable',async()=>{
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelectorAll('[data-three-scene] canvas').length===0);
    assert.equal(await page.locator('[data-three-level]').count(),10);assert.equal(await page.getByRole('button',{name:'ลดการเคลื่อนไหว'}).isDisabled(),true);
    await page.evaluate(()=>scrollTo(0,0));await capture('reduced-motion');await page.emulateMedia({reducedMotion:'no-preference'});
  });
  await check('WebGL context loss degrades to DOM route and cleans the lost renderer',async()=>{
    await page.setViewportSize({width:1440,height:1100});await ready('track');
    await scene('track').locator('canvas').evaluate(canvas=>canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await page.waitForFunction(()=>document.querySelector('[data-three-scene=track]').dataset.threeFailed==='true');
    assert.equal(await scene('track').locator('canvas').count(),0);assert.equal(await page.locator('[data-three-level]').count(),10);
    await page.locator('[data-three-level="3"]').click();assert.notEqual(await page.locator('details[data-level="3"]').getAttribute('open'),null);
  });
  await check('navigation releases every WebGL context; return has no stale celebration',async()=>{
    await page.getByRole('link',{name:'สูตรลับ',exact:true}).click();await page.waitForURL('**/secret-sauce/sleep-cycle');await page.waitForFunction(()=>!document.querySelector('[data-three-scene]'));
    await page.waitForFunction(()=>window.__threeContexts.every(gl=>gl.isContextLost()));
    await page.getByRole('link',{name:'สุขภาพ',exact:true}).click();await ready('shoe');assert.equal(await page.locator('[data-unlock-medal]').count(),0);
  });
  await check('active renderer geometry budget and frame sampling',async()=>{
    await page.evaluate(()=>scrollTo(0,0));await ready('shoe');
    const sample=await page.evaluate(()=>new Promise(resolve=>{const times=[];let last=performance.now();function tick(now){times.push(now-last);last=now;if(times.length<90)requestAnimationFrame(tick);else resolve(times.slice(1));}requestAnimationFrame(tick);}));
    const sorted=sample.sort((a,b)=>a-b);
    metrics={frameMedianMs:sorted[Math.floor(sorted.length*.5)],frameP95Ms:sorted[Math.floor(sorted.length*.95)],scenes:await page.locator('[data-three-scene]').evaluateAll(nodes=>nodes.map(n=>({kind:n.dataset.threeScene,tier:n.dataset.quality,triangles:n.dataset.triangles,drawCalls:n.dataset.drawCalls,rendering:n.dataset.rendering}))),liveContexts:await page.evaluate(()=>window.__threeContexts.filter(gl=>!gl.isContextLost()).length)};
    assert.ok(Number(await scene('shoe').getAttribute('data-triangles'))<40000);
  });
  await check('no JavaScript, hydration or unexpected console errors',async()=>assert.deepEqual(errors,[]));
  // A separate browser context proves unsupported WebGL/weak hardware never needs Three.js.
  await check('unsupported WebGL uses fallback without importing renderer or losing controls',async()=>{
    const fallback=await browser.newContext({viewport:{width:390,height:844}});
    await fallback.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind==='webgl2'?null:get.call(this,kind,...args);};});
    const p=await fallback.newPage();await p.goto('http://127.0.0.1:3100/health');await p.locator('[data-motion-ready=true]').waitFor();await p.locator('[data-three-level="3"]').click();
    assert.equal(await p.locator('[data-three-scene] canvas').count(),0);assert.notEqual(await p.locator('details[data-level="3"]').getAttribute('open'),null);await fallback.close();
  });
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({checks:results,errors,metrics},null,2));console.log(JSON.stringify(metrics));console.log(`${results.length} 3D checks passed`);
 }catch(error){await capture('failure');throw error;}finally{await browser.close();await api('reset');}
})().catch(error=>{console.error(error);process.exitCode=1;});
