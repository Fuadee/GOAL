// Motion acceptance against the isolated production build, using unchanged write flags/actions.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = 'http://127.0.0.1:3100';
const fixture = 'http://127.0.0.1:54125';
const output = path.resolve('tmp/health-verification/motion');
fs.mkdirSync(output,{recursive:true});
const results=[];const errors=[];
const api=async(route,body)=>fetch(`${fixture}/__test/${route}`,{method:'POST',body:JSON.stringify(body||{})});
const state=async()=>(await fetch(`${fixture}/__test/state`)).json();
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1100},reducedMotion:'no-preference'});
 await context.addInitScript(()=>{
   window.__motionMeasure={longTasks:[],shifts:[]};
   try{new PerformanceObserver(list=>window.__motionMeasure.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});}catch{}
   try{new PerformanceObserver(list=>window.__motionMeasure.shifts.push(...list.getEntries().filter(e=>!e.hadRecentInput).map(e=>e.value))).observe({type:'layout-shift',buffered:true});}catch{}
   const Original=window.IntersectionObserver;window.__activeMotionObservers=new Set();
   window.IntersectionObserver=class extends Original{constructor(...args){super(...args);window.__activeMotionObservers.add(this);}disconnect(){window.__activeMotionObservers.delete(this);super.disconnect();}};
 });
 const page=await context.newPage();
 page.setDefaultTimeout(15000);
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 const check=async(name,fn)=>{await fn();results.push(name);console.log(`PASS ${name}`);};
 const settle=()=>page.waitForFunction(()=>!document.querySelector('[data-counting="true"]')&&Array.from(document.querySelectorAll('[data-counter-target]')).every(node=>node.firstElementChild.textContent===node.getAttribute('data-counter-target')));
 const progress=async(number)=>{await page.waitForFunction(value=>document.querySelector('[aria-label="Level Progress"]')?.getAttribute('aria-valuenow')===String(value),number*10);await settle();};
 async function load(){await page.goto(`${base}/health`);await page.locator('[data-motion-ready="true"]').waitFor();}
 async function fill(distance,time,activity='continuous'){
  await page.locator('[name="run_date"]').fill('2026-04-16');await page.locator('[name="distance_km"]').fill(String(distance));await page.locator('[name="duration_input"]').fill(time);await page.locator('[name="activity_type"]').selectOption(activity);
 }
 async function save(){await page.locator('form button[type="submit"]').click();await page.locator('form[aria-busy="false"]').waitFor();}
 async function dismiss(){const button=page.getByRole('button',{name:'ปิดข้อความผลการบันทึก'});if(await button.count())await button.click();}
 async function capture(name){await settle();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(output,`${name}.png`),fullPage:true});await page.screenshot({path:path.join(output,`${name}-viewport.png`)});}
 let performanceFindings={};
 try{
  await api('reset');await load();
  await check('cinematic entrance has sequenced title/shoe/finish/progress timings; no initial celebration',async()=>{
   const timings=await page.evaluate(()=>document.getAnimations().filter(a=>a.animationName).map(a=>({name:a.animationName,delay:a.effect.getTiming().delay})));
   assert.ok(timings.some(a=>a.name.includes('wordReveal')&&a.delay===300));assert.ok(timings.some(a=>a.name.includes('softReveal')&&a.delay===700));assert.ok(timings.some(a=>a.name.includes('softReveal')&&a.delay===800));
   assert.equal(await page.locator('[data-celebration="true"]').count(),0);
   await progress(2);assert.equal(await page.locator('[aria-label="Distance Progress"]').getAttribute('aria-valuenow'),'40.199999999999996');
   await page.locator('img[src*="shoe-poster"]').waitFor();
   assert.equal(await page.locator('img[src*="shoe-poster"]').evaluate(img=>img.complete&&img.naturalWidth>0),true);
  });
  await check('counter frames do not restart on unrelated form renders',async()=>{
   await settle();await page.evaluate(()=>{window.__counterMutations=0;window.__counterWatcher=new MutationObserver(list=>window.__counterMutations+=list.length);document.querySelectorAll('[data-counter-target]>span:first-child').forEach(node=>window.__counterWatcher.observe(node,{childList:true,characterData:true,subtree:true}));});
   await fill(1,'17:25');await page.locator('[name="duration_input"]').fill('18:00');
   await page.locator('details[data-state="available"] summary').click();
   assert.equal(await page.evaluate(()=>window.__counterMutations),0);await page.evaluate(()=>window.__counterWatcher.disconnect());
  });
  await check('card lift changes transform, not neighbor layout; locked remains locked',async()=>{
   const card=page.locator('[data-level="3"]');const neighbor=page.locator('[data-level="4"]');
   const before=await neighbor.evaluate(node=>node.getBoundingClientRect().top+scrollY);await card.hover();
   assert.equal(await neighbor.evaluate(node=>node.getBoundingClientRect().top+scrollY),before);
   assert.equal(await neighbor.getAttribute('data-state'),'locked');
   assert.notEqual(await card.evaluate(node=>getComputedStyle(node).transform),'none');
  });
  await check('offscreen ambient animations are paused',async()=>{
   await page.locator('#running-history').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('[data-motion-region="hero"]').dataset.visible==='false');
   assert.equal(await page.evaluate(()=>document.querySelector('[data-motion-region="hero"]').getAnimations({subtree:true}).filter(a=>a.effect.getTiming().iterations===Infinity).every(a=>a.playState==='paused')),true);
  });
  await check('desktop/laptop/mobile layouts and screenshots at 1440,1024,390,320px',async()=>{
   for(const [width,height,name] of [[1440,1100,'desktop'],[1024,900,'laptop'],[390,844,'mobile'],[320,740,'mobile-small']]){
    await page.setViewportSize({width,height});await capture(name);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}px overflow`);
   }
   await page.setViewportSize({width:1440,height:1100});
  });
  await check('keyboard roadmap, form focus, graph switch and tooltip',async()=>{
   const summary=page.locator('[data-level="4"] summary');await summary.focus();await page.keyboard.press('Enter');assert.notEqual(await page.locator('[data-level="4"]').getAttribute('open'),null);
   const date=page.locator('[name="run_date"]');await date.focus();assert.equal(await date.evaluate(node=>node===document.activeElement),true);assert.notEqual(await date.evaluate(node=>getComputedStyle(node).boxShadow),'none');
   await page.getByRole('button',{name:'Pace',exact:true}).click();assert.equal(await page.locator('svg polyline').count(),1);
   const dot=page.getByRole('button',{name:'2026-04-15: 2.01 กม. 8:40 /km'});await dot.focus();await page.locator('[aria-live="polite"]').filter({hasText:'2026-04-15'}).last().waitFor();
  });
  await check('failed save never shows unlock/PB/success and retains user input',async()=>{
   await api('options',{failWrites:true});await fill(5,'40:00');await save();
   await page.locator('form [role="alert"]').waitFor();assert.equal(await page.locator('[data-feedback]').count(),0);assert.equal(await page.locator('button[data-save-state="success"]').count(),0);
   assert.equal(await page.locator('[name="duration_input"]').inputValue(),'40:00');assert.equal((await state()).rows.length,7);await api('options',{});
  });
  await check('double submit sends one mutation; confirmed save summarizes six unlocks and PB',async()=>{
   await fill(5,'50:00');await api('options',{delay:120});
   let requests=0;const listener=request=>{if(request.method()==='POST'&&request.headers()['next-action'])requests++;};page.on('request',listener);
   await page.locator('form').evaluate(form=>{form.requestSubmit();form.requestSubmit();form.requestSubmit();});
   await page.locator('form[aria-busy="true"]').waitFor();assert.equal(await page.locator('form button[type="submit"]').isDisabled(),true);assert.equal(await page.locator('[data-celebration="true"]').count(),0);
   await progress(8);await page.locator('[data-feedback="achievement"]').waitFor();page.off('request',listener);await api('options',{});
   assert.equal(requests,1);assert.equal((await state()).rows.length,8);assert.equal(await page.locator('[data-celebration="true"]').count(),1);
   await page.getByRole('heading',{name:'ปลดล็อก 6 ระดับใหม่!'}).waitFor();assert.equal(await page.locator('[data-just-unlocked="true"]').count(),6);
   assert.equal(await page.locator('[data-level="9"]').getAttribute('data-state'),'available');assert.ok(await page.locator('[data-new-pb="true"]').count());
   await page.screenshot({path:path.join(output,'unlock.png')});
  });
  await check('reloading completed history never replays a celebration',async()=>{
   await page.reload();await progress(8);assert.equal(await page.locator('[data-feedback]').count(),0);assert.equal(await page.locator('[data-just-unlocked="true"]').count(),0);
  });
  await check('later actual PB earns one new summary, without replaying old unlocks',async()=>{
   await fill(5.5,'44:00');await save();await progress(10);await page.getByRole('heading',{name:'ปลดล็อก 2 ระดับใหม่!'}).waitFor();assert.equal(await page.locator('[data-just-unlocked="true"]').count(),2);await dismiss();
  });
  await check('edit/delete recalculate and show neutral feedback, without false victory',async()=>{
   await page.getByRole('button',{name:'แก้ไข 2026-04-16 5.5 กม.'}).click();await page.locator('[name="duration_input"]').fill('60:00');await save();await progress(8);await page.locator('[data-feedback="updated"]').waitFor();assert.equal(await page.locator('[data-celebration="true"]').count(),0);
   await page.getByRole('button',{name:'ลบ 2026-04-16 5 กม.'}).click();await page.getByRole('button',{name:'ยืนยันลบ',exact:true}).click();await progress(7);assert.equal(await page.locator('[data-celebration="true"]').count(),0);
  });
  await check('effects OFF stays interactive and confirms real achievements without decoration',async()=>{
   await page.getByRole('button',{name:'เอฟเฟกต์ เปิด'}).click();await fill(5,'40:00');await save();await progress(10);await page.locator('[data-feedback="achievement"]').waitFor();
   assert.equal(await page.locator('[data-effects]').getAttribute('data-effects'),'off');
   assert.equal(await page.locator('[class*="particles"]').count(),0);
   assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);
   await dismiss();await page.getByRole('button',{name:'เอฟเฟกต์ ปิด'}).click();await settle();
  });
  await check('prefers-reduced-motion overrides preference; values remain final',async()=>{
   await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'ลดการเคลื่อนไหว'}).waitFor();assert.equal(await page.getByRole('button',{name:'ลดการเคลื่อนไหว'}).isDisabled(),true);
   await settle();assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);
   await fill(1,'12:00');await save();await progress(10);await page.locator('[data-feedback="saved"]').waitFor();await dismiss();
  });
  await check('route changes disconnect observers and remove active page animations',async()=>{
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.getByRole('link',{name:'สูตรลับ',exact:true}).click();await page.waitForURL('**/secret-sauce/sleep-cycle');
   await page.waitForFunction(()=>!document.querySelector('[data-effects]')&&window.__activeMotionObservers.size===0);
   assert.equal(await page.evaluate(()=>window.__activeMotionObservers.size),0);
   await page.getByRole('link',{name:'สุขภาพ',exact:true}).click();await page.waitForURL('**/health');await page.locator('[data-motion-ready="true"]').waitFor();await settle();
   assert.equal(await page.evaluate(()=>window.__activeMotionObservers.size),await page.evaluate(()=>1+document.querySelectorAll('[data-three-scene]:not([data-quality="fallback"]):not([data-three-failed="true"])').length));
   assert.equal(await page.locator('[data-feedback]').count(),0);
  });
  await check('frame pacing and layout-shift sampling on an active hero',async()=>{
   await page.evaluate(()=>scrollTo(0,0));await settle();
   const frames=await page.evaluate(()=>new Promise(resolve=>{const frames=[];let last=performance.now();function step(now){frames.push(now-last);last=now;if(frames.length<120)requestAnimationFrame(step);else resolve(frames.slice(1));}requestAnimationFrame(step);}));
   const sorted=[...frames].sort((a,b)=>a-b);
   performanceFindings={frameMedianMs:sorted[Math.floor(sorted.length*.5)],frameP95Ms:sorted[Math.floor(sorted.length*.95)],maxFrameMs:Math.max(...frames),...await page.evaluate(()=>({longTasks:window.__motionMeasure.longTasks,layoutShift:window.__motionMeasure.shifts.reduce((a,b)=>a+b,0),activeObserverCount:window.__activeMotionObservers.size,runningInfiniteAnimations:document.getAnimations().filter(a=>a.playState==='running'&&a.effect.getTiming().iterations===Infinity).length}))};
   assert.ok(performanceFindings.layoutShift<.1,`Unexpected CLS ${performanceFindings.layoutShift}`);
  });
  await check('no unexpected console errors or hydration warnings',async()=>assert.deepEqual(errors,[]));
  fs.writeFileSync(path.join(output,'motion-results.json'),JSON.stringify({checks:results,errors,performance:performanceFindings},null,2));
  console.log(JSON.stringify(performanceFindings));console.log(`${results.length} motion browser checks passed.`);
 }catch(error){await page.screenshot({path:path.join(output,'failure.png'),fullPage:true});throw error;}
 finally{await browser.close();await api('reset');}
})().catch(error=>{console.error(error);process.exitCode=1;});
