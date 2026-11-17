// Read-only visual inspection of the actual application. Never submits a run.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const out=path.resolve('tmp/health-verification/journey');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
 const context=await browser.newContext();await context.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});});
 const page=await context.newPage();const errors=[],layouts=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 for(const width of [1440,1024,390,320]){
  await page.setViewportSize({width,height:1100});await page.goto(process.env.GOAL_JOURNEY_PREVIEW_URL||'http://localhost:3000/health');
  const track=page.locator('[data-track-mode]');await track.scrollIntoViewIfNeeded();await page.locator('[data-three-scene=track][data-three-ready=true]').waitFor();await page.waitForTimeout(1200);
  await page.locator('[data-level-selector="4"]').click();
  const panel=page.locator('[data-motion-region=roadmap]');await panel.evaluate(n=>n.scrollIntoView({block:'start'}));await page.waitForTimeout(300);const a=await panel.boundingBox(),b=await track.boundingBox();await page.screenshot({path:path.join(out,`local-${width}.png`),clip:{x:a.x,y:Math.max(0,a.y),width:a.width,height:b.y+b.height-Math.max(0,a.y)+16}});
  layouts.push({width,track:await track.boundingBox(),current:await page.locator('[data-three-scene=track]').getAttribute('data-current-level'),selected:await page.locator('[data-selected-detail]').getAttribute('data-selected-detail'),triangles:await page.locator('[data-three-scene=track]').getAttribute('data-triangles'),calls:await page.locator('[data-three-scene=track]').getAttribute('data-draw-calls')});
 }
 fs.writeFileSync(path.join(out,'local-preview-results.json'),JSON.stringify({layouts,errors},null,2));console.log(JSON.stringify({layouts,errors}));
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
