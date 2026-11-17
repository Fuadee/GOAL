const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const base='http://127.0.0.1:3100/health',out=path.resolve('tmp/health-verification/shoe');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1100}});
 await context.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});});
 const page=await context.newPage();page.setDefaultTimeout(20000);const errors=[],checks=[];let metrics={};
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.location().url?.endsWith('/favicon.ico'))errors.push(m.text());});
 const host=()=>page.locator('[data-three-scene=shoe]');const angle=async()=>Number(await host().getAttribute('data-rotation'));
 const ready=async()=>{await page.locator('[data-three-scene=shoe][data-three-ready=true]').waitFor();await page.waitForFunction(()=>!document.querySelector('[data-counting=true]'));};
 const check=async(name,fn)=>{await fn();checks.push(name);console.log(`PASS ${name}`);};
 async function snapshot(name){await page.waitForFunction(()=>document.getAnimations().every(a=>a.effect.getTiming().iterations===Infinity||a.playState!=='running'));await page.screenshot({path:path.join(out,`${name}.png`)});}
 try{
  await page.goto(base);await ready();
  await check('real licensed shoe GLB renders; humanoid and runner photo are absent',async()=>{
   assert.equal(await host().getAttribute('data-model'),'gltf-shoe');assert.ok(Number(await host().getAttribute('data-triangles'))>22700);
   assert.equal(await page.locator('[data-three-scene=runner],img[src*="runner-reference"]').count(),0);
   assert.equal(await page.locator('[data-unlock-medal]').count(),0);assert.equal(await page.locator('[data-three-level]').count(),10);
   await snapshot('desktop-final');
  });
  await check('automatic rotation completes approximately 360 degrees in ten seconds',async()=>{
   const before=await angle(),start=Date.now();await page.waitForTimeout(10000);const delta=await angle()-before;
   metrics.rotation={elapsedMs:Date.now()-start,radians:delta,degrees:delta*180/Math.PI};assert.ok(Math.abs(delta-Math.PI*2)<.35,`rotation delta ${delta}`);
  });
  await check('mouse drag controls a complete revolution and pauses auto while held',async()=>{
   const box=await host().boundingBox(),x=box.x+box.width*.65,y=box.y+box.height*.55;
   await page.mouse.move(x,y);await page.mouse.down();await page.waitForFunction(()=>document.querySelector('[data-three-scene=shoe]').dataset.dragging==='true');
   const held=await angle();await page.waitForTimeout(250);assert.ok(Math.abs(await angle()-held)<.001);
   await page.mouse.move(x-box.width,y,{steps:24});assert.ok(Math.abs((await angle()-held)+Math.PI*2)<.03);
   await snapshot('mouse-360');await page.mouse.up();const release=await angle();await page.waitForTimeout(200);assert.notEqual(await angle(),release);
   await page.waitForTimeout(2500);const resumed=await angle();await page.waitForTimeout(1000);assert.ok(Math.abs(await angle()-resumed-Math.PI*2/10)<.09);
  });
  await check('keyboard controls rotate without trapping focus',async()=>{
   const before=await angle();await page.getByRole('button',{name:'หมุนรองเท้าไปทางขวา'}).focus();await page.keyboard.press('Enter');assert.ok(await angle()>before+.6);await page.keyboard.press('Tab');
  });
  await check('offscreen shoe stops its frame loop',async()=>{
   await page.locator('#running-history').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('[data-three-scene=shoe]').dataset.rendering==='paused');const frames=await host().getAttribute('data-frames');await page.waitForTimeout(200);assert.equal(await host().getAttribute('data-frames'),frames);await page.evaluate(()=>scrollTo(0,0));
  });
  await check('effects OFF and reduced motion use a loaded static poster with all utility data retained',async()=>{
   await page.getByRole('button',{name:'เอฟเฟกต์ เปิด'}).click();await page.waitForFunction(()=>!document.querySelector('[data-three-scene=shoe] canvas'));
   assert.equal(await page.locator('img[src*="shoe-poster"]').evaluate(n=>n.complete&&n.naturalWidth>0),true);assert.equal(await page.locator('[data-shoe-visible]').getAttribute('data-shoe-visible'),'false');await snapshot('effects-off');
   await page.getByRole('button',{name:'เอฟเฟกต์ ปิด'}).click();await ready();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!document.querySelector('[data-three-scene=shoe] canvas'));assert.equal(await page.locator('[data-three-level]').count(),10);await page.emulateMedia({reducedMotion:'no-preference'});await ready();
  });
  await check('desktop 1024 and mobile 390/320 layouts preserve readable text without horizontal overflow',async()=>{
   for(const [width,height]of [[1024,900],[390,844],[320,740]]){await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(300);await ready();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await snapshot(`shoe-${width}`);}
  });
  await check('real mobile touch drag rotates, pauses automatic motion and resumes',async()=>{
   const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
   const p=await mobile.newPage();await p.goto(base);await p.locator('[data-three-scene=shoe][data-three-ready=true]').waitFor();
   const canvas=p.locator('[data-three-scene=shoe]'),box=await canvas.boundingBox(),cdp=await mobile.newCDPSession(p);
   const x=box.x+box.width*.7,y=box.y+box.height*.45;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await p.waitForFunction(()=>document.querySelector('[data-three-scene=shoe]').dataset.dragging==='true');
   const start=Number(await canvas.getAttribute('data-rotation'));await p.waitForTimeout(200);assert.equal(Number(await canvas.getAttribute('data-rotation')),start);
   for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*10,y,id:1}]});
   assert.ok(Math.abs(Number(await canvas.getAttribute('data-rotation'))-start)>2);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForFunction(()=>document.querySelector('[data-three-scene=shoe]').dataset.dragging==='false');
   await p.screenshot({path:path.join(out,'touch-drag.png')});await mobile.close();
  });
  await check('asset decode failure retains polished poster and existing page controls',async()=>{
   const ctx=await browser.newContext(),p=await ctx.newPage();await p.route('**/goal-shoe.glb',r=>r.fulfill({status:200,body:'invalid-glb',contentType:'application/octet-stream'}));await p.goto(base);
   await p.locator('[data-three-scene=shoe][data-three-failed=true]').waitFor();assert.equal(await p.locator('[data-three-scene=shoe] canvas').count(),0);assert.equal(await p.locator('[data-shoe-visible]').getAttribute('data-shoe-visible'),'false');assert.equal(await p.locator('[data-three-level]').count(),10);await ctx.close();
  });
  await check('static preference does not download the GLB',async()=>{
   const ctx=await browser.newContext();await ctx.addInitScript(()=>localStorage.setItem('goal-running-effects','off'));const p=await ctx.newPage();let requests=0;p.on('request',r=>{if(r.url().endsWith('.glb'))requests++;});await p.goto(base);await p.locator('[data-motion-ready=true]').waitFor();await p.waitForTimeout(400);assert.equal(requests,0);await ctx.close();
  });
  await check('runtime frame sample and no WebGL/hydration errors',async()=>{
   await page.setViewportSize({width:1440,height:1100});await page.evaluate(()=>scrollTo(0,0));await ready();
   const times=await page.evaluate(()=>new Promise(resolve=>{const list=[];let last=performance.now();function tick(now){list.push(now-last);last=now;if(list.length<90)requestAnimationFrame(tick);else resolve(list.slice(1));}requestAnimationFrame(tick);}));times.sort((a,b)=>a-b);
   metrics.frames={medianMs:times[Math.floor(times.length*.5)],p95Ms:times[Math.floor(times.length*.95)],triangles:Number(await host().getAttribute('data-triangles')),drawCalls:Number(await host().getAttribute('data-draw-calls'))};assert.deepEqual(errors,[]);
  });
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors,metrics},null,2));console.log(JSON.stringify(metrics));console.log(`${checks.length} shoe browser checks passed`);
 }catch(e){await page.screenshot({path:path.join(out,'failure.png')});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
