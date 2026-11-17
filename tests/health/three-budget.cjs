const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const chunks=path.resolve('tmp/health-verification/motion-build/.next/static/chunks');
const rendererFiles=fs.readdirSync(chunks).filter(name=>name.endsWith('.js')&&/procedural-placeholder|WebGLRenderer/.test(fs.readFileSync(path.join(chunks,name),'utf8')));
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(20000);
  await page.addInitScript(()=>{localStorage.setItem('goal-running-effects','off');Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});});
  await page.goto('http://127.0.0.1:3100/health');await page.locator('[data-motion-ready=true]').waitFor();
  const requests=()=>page.evaluate(()=>performance.getEntriesByType('resource').map(entry=>new URL(entry.name).pathname.split('/').pop()));
  const before=await requests();assert.equal(rendererFiles.some(name=>before.includes(name)),false);
  await page.getByRole('button',{name:'เอฟเฟกต์ ปิด'}).click();await page.waitForFunction(()=>document.querySelector('[data-three-scene=shoe]').dataset.threeReady==='true');
  const after=await requests();
  const loaded=rendererFiles.filter(name=>after.includes(name)).map(name=>{const bytes=fs.readFileSync(path.join(chunks,name));return {file:name,rawBytes:bytes.length,gzipBytes:zlib.gzipSync(bytes).length};});
  assert.ok(loaded.length>0);
  const result={fallbackLoadedRenderer:false,loaded3DChunks:loaded,totalRawBytes:loaded.reduce((a,b)=>a+b.rawBytes,0),totalGzipBytes:loaded.reduce((a,b)=>a+b.gzipBytes,0)};
  fs.writeFileSync('tmp/health-verification/three/bundle-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
