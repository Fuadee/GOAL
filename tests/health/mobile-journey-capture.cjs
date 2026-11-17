// Read-only screenshots of the user's local app; no fixture or record writes.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const out=path.resolve('tmp/health-verification/mobile-journey');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const errors=[],layouts=[],desktopComparison=[];
 try{
  const mobile=await browser.newContext({hasTouch:true,isMobile:true});const page=await mobile.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.location().url?.endsWith('/favicon.ico'))errors.push(m.text());});
  for(const width of [320,360,375,390,430]){
   await page.setViewportSize({width,height:1000});const response=await page.goto('http://localhost:3000/health');assert.equal(response.status(),200);
   const track=page.locator('[data-track-mode]');await track.scrollIntoViewIfNeeded();await page.locator('[data-three-scene=track][data-three-ready=true]').waitFor();await page.locator('[data-level-selector="4"]').tap();await page.waitForTimeout(750);
   const panel=page.locator('[data-motion-region=roadmap]');await panel.evaluate(n=>n.scrollIntoView({block:'start'}));await page.waitForTimeout(150);const a=await panel.boundingBox(),b=await track.boundingBox();await page.screenshot({path:path.join(out,`local-mobile-${width}.png`),clip:{x:a.x,y:Math.max(0,a.y),width:a.width,height:b.y+b.height-Math.max(0,a.y)+16}});
   layouts.push({width,records:await page.locator('[data-run-id]').count(),writesDisabled:await page.locator('form button[type="submit"]').isDisabled(),current:await page.locator('[data-three-scene=track]').getAttribute('data-current-level'),selected:await page.locator('[data-selected-detail]').getAttribute('data-selected-detail')});
  }
  await mobile.close();
  // A deterministic, on-demand desktop render compares the preserved factory pixel-for-pixel.
  const desktop=await browser.newContext();await desktop.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});Object.defineProperty(navigator,'deviceMemory',{get:()=>4});});const p=await desktop.newPage();
  for(const width of [1440,1024]){
   await p.setViewportSize({width,height:1100});await p.goto('http://localhost:3000/health');const track=p.locator('[data-track-mode]');await track.scrollIntoViewIfNeeded();await p.locator('[data-three-scene=track][data-three-ready=true]').waitFor();await p.addStyleTag({content:'[data-track-mode] * {animation:none!important;transition:none!important;}'});await p.waitForTimeout(700);
   const file=path.join(out,`desktop-after-${width}.png`),before=path.join(out,`desktop-before-${width}.png`);await track.screenshot({path:file});const identical=fs.existsSync(before)?fs.readFileSync(file).equals(fs.readFileSync(before)):null;desktopComparison.push({width,identical});if(identical!==null)assert.equal(identical,true);
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'local-preview-results.json'),JSON.stringify({layouts,desktopComparison,errors},null,2));console.log(JSON.stringify({layouts,desktopComparison,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
