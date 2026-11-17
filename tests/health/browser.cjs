// Run against the production Next server connected to mock-server.cjs only.
// Set NODE_PATH to your Playwright installation, then: node tests/health/browser.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const base='http://127.0.0.1:3100';
const fixture='http://127.0.0.1:54125';
const output=path.resolve('tmp/health-verification');
fs.mkdirSync(output,{recursive:true});
async function reset(options={}){await fetch(`${fixture}/__test/reset`,{method:'POST',body:JSON.stringify(options)});}
async function options(value){await fetch(`${fixture}/__test/options`,{method:'POST',body:JSON.stringify(value)});}
async function state(){return (await fetch(`${fixture}/__test/state`)).json();}
const checks=[];
(async()=>{
 await reset();
 const original=(await state()).rows;
 const browser=await chromium.launch({headless:true,channel:process.env.GOAL_TEST_BROWSER_CHANNEL || 'chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:1100},reducedMotion:'no-preference'});
 const page=await context.newPage();
 page.setDefaultTimeout(15000);
 let expectedError=false;const errors=[];
 page.on('pageerror',error=>{if(!expectedError)errors.push(error.message);});
 page.on('console',message=>{if(message.type()==='error'&&!expectedError)errors.push(message.text());});
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 async function check(name,fn){await fn();checks.push(name);console.log(`PASS ${name}`);}
 async function progress(level){await page.getByRole('progressbar',{name:'Level Progress',exact:true}).waitFor();await page.waitForFunction(expected=>document.querySelector('[aria-label="Level Progress"]').getAttribute('aria-valuenow')===String(expected),level*10);}
 async function fill(distance,duration,activity,note='browser test only'){
   await page.locator('input[name="run_date"]').fill('2026-04-16');
   await page.locator('input[name="distance_km"]').fill(String(distance));
   await page.locator('input[name="duration_input"]').fill(duration);
   await page.locator('select[name="activity_type"]').selectOption(activity);
   const details=page.locator('form details');if(!await details.getAttribute('open'))await details.locator('summary').click();
   await page.locator('textarea[name="note"]').fill(note);
 }
 async function submit(){await page.locator('form button[type="submit"]').click();await page.getByText('กำลังบันทึก…',{exact:true}).waitFor({state:'hidden'});}
 async function editLatest(){await page.getByRole('button',{name:/แก้ไข 2026-04-16 5 กม/}).click();await page.getByRole('heading',{name:'แก้ไขผลการวิ่ง'}).waitFor();}
 try {
  await page.goto(`${base}/health`);
  await check('desktop real /health route; 10 levels; retained seven records; separate progress',async()=>{
   await progress(2);assert.equal(await page.locator('details[data-state]').count(),10);
   assert.equal(await page.locator('[aria-label="Distance Progress"]').getAttribute('aria-valuenow'),'40.199999999999996');
   assert.equal(await page.locator('#running-history article').count(),7);
   assert.equal(await page.getByRole('heading',{name:'ROAD TO 5K.'}).count(),1);
   await page.waitForFunction(()=>Array.from(document.querySelectorAll('[data-counter-target]')).every(node=>node.firstElementChild.textContent===node.getAttribute('data-counter-target')));
   await page.screenshot({path:path.join(output,'desktop.png'),fullPage:true});
   await page.screenshot({path:path.join(output,'desktop-viewport.png')});
  });
  await check('keyboard opens level details and graph supports focus; effects actually animate',async()=>{
   const current=page.locator('details[data-state="available"] summary');await current.focus();await page.keyboard.press('Enter');
   assert.notEqual(await page.locator('details[data-state="available"]').getAttribute('open'),null);
   const graph=page.getByRole('button',{name:'2026-04-15: 2.01 กม. 8:40 /km'});await graph.focus();
   assert.ok(await page.locator('[aria-live="polite"]').allTextContents().then(items=>items.some(text=>text.includes('2026-04-15'))));
   assert.ok(await page.evaluate(()=>document.getAnimations().length>0));
   await page.getByRole('button',{name:'เอฟเฟกต์ เปิด'}).click();
   await page.waitForFunction(()=>document.getAnimations().length===0);
   assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
  });
  await check('run/walk saves L6 evidence but waits at L3, data survives reload',async()=>{
   await fill(5,'60:00','run_walk');await submit();await progress(2);await page.reload();await progress(2);
   assert.equal(await page.getByText('✓ ทำเงื่อนไขนี้ได้แล้ว / รอ Level ก่อนหน้า',{exact:true}).count(),1);
   assert.equal((await state()).rows.length,8);
  });
  await check('editing continuity unlocks L1–L7 retroactively',async()=>{
   await editLatest();await page.locator('select[name="activity_type"]').selectOption('continuous');await submit();await progress(7);
  });
  await check('40:01 fails L10 even when displayed pace rounds to 8:00',async()=>{
   await editLatest();await page.locator('input[name="duration_input"]').fill('40:01');await submit();await progress(9);
  });
  await check('40:00 passes L10; logging remains enabled after completion',async()=>{
   await editLatest();await page.locator('input[name="duration_input"]').fill('40:00');await submit();await progress(10);
   await fill(1,'10:00','continuous','after completion');await submit();await progress(10);assert.equal((await state()).rows.length,9);
  });
  await check('delete confirmation cancellation; soft delete recalculates with original records intact',async()=>{
   await page.getByRole('button',{name:'ลบ 2026-04-16 5 กม.'}).click();
   await page.getByRole('button',{name:'ยกเลิก',exact:true}).click();assert.equal((await state()).rows.filter(row=>row.deleted_at).length,0);
   await page.getByRole('button',{name:'ลบ 2026-04-16 5 กม.'}).click();await page.getByRole('button',{name:'ยืนยันลบ',exact:true}).click();await progress(2);
   await page.reload();await progress(2);
   const db=await state();assert.equal(db.rows.length,9);assert.equal(db.rows.filter(row=>row.deleted_at).length,1);assert.deepEqual(db.rows.slice(0,7),original);assert.equal(db.revisions.length,4);
  });
  await check('invalid input and failed save preserve form and records',async()=>{
   await fill(5,'abc123','continuous');await submit();assert.ok(await page.locator('form [role="alert"]').count());assert.equal((await state()).rows.length,9);
   await page.locator('input[name="duration_input"]').fill('40:00');await options({failWrites:true});await submit();
   await page.locator('form [role="alert"]').waitFor();assert.equal(await page.locator('input[name="duration_input"]').inputValue(),'40:00');assert.equal((await state()).rows.length,9);await options({});
  });
  await check('mobile 390px and 320px: no page overflow, readable form, working navigation',async()=>{
   await reset();await page.setViewportSize({width:390,height:844});await page.reload();await progress(2);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await page.evaluate(()=>scrollTo(0,0));
   await page.screenshot({path:path.join(output,'mobile.png'),fullPage:true});
   await page.screenshot({path:path.join(output,'mobile-viewport.png')});
   await page.getByRole('button',{name:'เปิดเมนู',exact:true}).click();await page.getByRole('link',{name:'นวัตกรรม',exact:true}).waitFor();await page.keyboard.press('Escape');
   assert.equal(await page.getByRole('button',{name:'เปิดเมนู',exact:true}).getAttribute('aria-expanded'),'false');
   await page.setViewportSize({width:320,height:740});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await fill(2.01,'17:25','continuous','mobile keyboard');await submit();await progress(2);
  });
  await check('reduced motion disables animation, overrides stored preference',async()=>{
   await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'ลดการเคลื่อนไหว'}).waitFor();
   assert.equal(await page.getByRole('button',{name:'ลดการเคลื่อนไหว'}).isDisabled(),true);
   await page.waitForFunction(()=>document.getAnimations().length===0);
   assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
  });
  await check('empty state has ten levels, usable form, no invented graph or PB',async()=>{
   await reset({empty:true});await page.reload();await progress(0);
   assert.equal(await page.locator('#running-history article').count(),0);
   await page.getByText('กราฟจะปรากฏเมื่อมีประวัติการวิ่ง',{exact:false}).waitFor();
   assert.equal(await page.locator('form button[type="submit"]').isEnabled(),true);
   await page.screenshot({path:path.join(output,'empty-mobile.png'),fullPage:true});
  });
  await check('loading and recoverable error states',async()=>{
   await options({delay:1800});await page.goto(`${base}/health`,{waitUntil:'commit'});
   await page.getByRole('status').filter({hasText:'กำลังโหลดประวัติการวิ่ง'}).waitFor();await progress(0);await options({});
   expectedError=true;await options({failReads:true});await page.reload();await page.getByRole('heading',{name:'โหลดประวัติการวิ่งไม่สำเร็จ'}).waitFor();
   await options({});await page.getByRole('button',{name:'ลองโหลดใหม่'}).click();await progress(0);expectedError=false;
  });
  await check('no unexpected browser console errors',async()=>assert.deepEqual(errors,[]));
  fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify({checks,errors},null,2));
  console.log(`${checks.length} browser checks passed; screenshots in ${output}`);
 } catch(error){console.error(await page.evaluate(()=>document.getAnimations().map(animation=>({name:animation.animationName,state:animation.playState,target:animation.effect?.target?.className}))));await page.screenshot({path:path.join(output,'failure.png'),fullPage:true});throw error;}
 finally {await browser.close();await reset();}
})().catch(error=>{console.error(error);process.exitCode=1;});
