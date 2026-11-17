// Read-only review of the user's existing preview. Never submits or modifies records.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const output = path.resolve('tmp/health-verification/motion');
(async () => {
  fs.mkdirSync(output, {recursive: true});
  const browser = await chromium.launch({channel:'chrome', headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1100}});
  const errors = [];
  page.on('response', response => { if(response.status()>=400) console.log(`HTTP ${response.status()} ${new URL(response.url()).pathname}`); });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if(message.type()==='error') errors.push({text:message.text(), path:message.location().url ? new URL(message.location().url).pathname : ''}); });
  try {
    const response = await page.goto('http://localhost:3000/health');
    assert.equal(response.status(), 200);
    await page.locator('[data-motion-ready="true"]').waitFor();
    await page.waitForFunction(() => !document.querySelector('[data-counting="true"]'));
    assert.equal(await page.locator('details[data-state]').count(), 10);
    assert.equal(await page.locator('img[src*="shoe-poster"]').evaluate(img=>img.complete&&img.naturalWidth>0), true);
    const result = {url:page.url(), status:response.status(), levels:10, visibleRecords:await page.locator('#running-history article').count(), writeButtonDisabled:await page.locator('form button[type="submit"]').isDisabled(), errors};
    for(const [width,height,name] of [[1440,1100,'local-desktop'],[390,844,'local-mobile']]) {
      await page.setViewportSize({width,height});
      await page.waitForTimeout(300);
      await page.waitForFunction(()=>{const scene=document.querySelector('[data-three-scene=shoe]');return !scene||scene.dataset.quality==='fallback'||scene.dataset.threeFailed==='true'||scene.dataset.threeReady==='true';});
      await page.waitForFunction(()=>document.getAnimations().every(a=>a.effect.getTiming().iterations===Infinity||a.playState!=='running'));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      await page.screenshot({path:path.join(output,`${name}.png`)});
    }
    // The existing app has no favicon.ico. Retain this diagnostic in the report;
    // changing global branding/assets is outside this Health motion change.
    assert.deepEqual(errors.filter(error=>error.path!=='/favicon.ico'), []);
    fs.writeFileSync(path.join(output,'local-preview-results.json'),JSON.stringify(result,null,2));
    console.log(JSON.stringify(result));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
