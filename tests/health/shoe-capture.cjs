// Read-only visual capture and exact WebGL canvas poster generation.
const {chromium}=require('playwright'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1100}});page.setDefaultTimeout(20000);
 if(process.env.GOAL_CAPTURE_POSTER==='true')await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,options){return get.call(this,kind,kind==='webgl2'?{...options,preserveDrawingBuffer:true}:options);};});
 page.on('console',m=>{if(m.type()==='error')console.log(m.text());});page.on('pageerror',e=>console.log(e.message));
 try{
  await page.goto(process.env.GOAL_SHOE_PREVIEW_URL||'http://127.0.0.1:3100/health');
  await page.locator('[data-three-scene=shoe][data-three-ready=true]').waitFor();
  await page.waitForFunction(()=>!document.querySelector('[data-counting=true]')&&document.getAnimations().every(a=>a.effect.getTiming().iterations===Infinity||a.playState!=='running'));
  const host=page.locator('[data-three-scene=shoe]');
  console.log(await host.evaluate(n=>({...n.dataset})));
  fs.mkdirSync('tmp/health-verification/shoe',{recursive:true});
  await page.screenshot({path:'tmp/health-verification/shoe/desktop.png'});
  if(process.env.GOAL_CAPTURE_POSTER==='true'){
    // Pixel capture of our actual licensed GLB render, never used as the live 3D scene.
    const rect=await host.boundingBox(),angle=Number(await host.getAttribute('data-rotation'));
    await page.mouse.move(rect.x+rect.width*.5,rect.y+rect.height*.5);await page.mouse.down();
    await page.mouse.move(rect.x+rect.width*.5+(-.55-angle)/(Math.PI*2)*rect.width,rect.y+rect.height*.5,{steps:8});
    await page.waitForTimeout(80);
    const png=await host.locator('canvas').evaluate(canvas=>canvas.toDataURL('image/png').split(',')[1]);
    fs.writeFileSync('public/health/shoe-poster.png',Buffer.from(png,'base64'));await page.mouse.up();
  }
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>document.querySelector('[data-three-scene=shoe]').dataset.threeReady==='true'&&document.querySelector('[data-three-scene=shoe]').dataset.quality==='reduced');
  await page.waitForTimeout(800);await page.screenshot({path:'tmp/health-verification/shoe/mobile.png'});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
