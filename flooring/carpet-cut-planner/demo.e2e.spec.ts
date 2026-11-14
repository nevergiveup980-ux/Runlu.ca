import {test,expect} from '@playwright/test';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const url=process.env.DEMO_BASE_URL||pathToFileURL(resolve('dist/demo/index.html')).href;
for(const id of ['01','02','03'])test(`iPhone Safari engine: DEMO ${id} load, calculate, zoom, review, print and reset`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);await page.locator(`[data-demo="${id}"]`).tap();
 await expect(page.locator('#demoNotice')).toContainText(`DEMO ${id}`);
 await expect(page.locator('#demoBanner')).toHaveText('DEMO DATA — NOT FOR PRODUCTION CUTTING');
 await expect(page.locator('#csvImport')).toBeHidden();await expect(page.locator('#loadButton')).toBeHidden();
 const originalLength=await page.locator('#pieceRows input[data-field="l"]').first().inputValue();
 await expect(page.locator('#results')).toContainText('Tap Calculate');await page.locator('#calculate').tap();
 await expect(page.locator('#results')).toContainText('SYD');await expect(page.locator('#results')).toContainText('LF');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2)).toBe(true);
 if(id==='03'){await expect(page.locator('#results')).toContainText('No complete plan — do not cut');await expect(page.locator('#results')).toContainText('DEMO Missing Lot');}
 const svg=page.locator('#results svg').first();await expect(svg).toBeVisible();
 const width=await svg.evaluate(el=>el.getBoundingClientRect().width);await page.locator('.zoomIn').first().tap();
 expect(await svg.evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThan(width);
 await expect(page.locator('.zoomLevel').first()).toHaveText('150%');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2)).toBe(true);
 await page.locator('.zoomFit').first().tap();await expect(page.locator('.zoomLevel').first()).toHaveText('100%');
 await page.locator('#reviewChecklist input').first().check();await expect(page.locator('#reviewStatus')).toContainText('1 / 5');
 const choices=await page.locator('#scenarioPicker option').count();
 if(choices>1){await page.locator('#scenarioPicker').selectOption('1');await expect(page.locator('#reviewChecklist input').first()).not.toBeChecked();}
 await page.evaluate(()=>{window.print=()=>{document.body.dataset.printCalled='true'}});
 await page.locator('#print').tap();await expect(page.locator('#printAudit')).toContainText('DEMO');await expect(page.locator('body')).toHaveAttribute('data-print-called','true');
 if(id==='03')await expect(page.locator('#printAudit')).toContainText('DO NOT CUT FROM THIS PLAN');
 await page.emulateMedia({media:'print'});await expect(page.locator('#demoBanner')).toBeVisible();await page.emulateMedia({media:'screen'});
 await page.locator('#pieceRows input[data-field="l"]').first().fill('1');await page.locator('#resetDemo').tap();
 await expect(page.locator('#pieceRows input[data-field="l"]').first()).toHaveValue(originalLength);await expect(page.locator('#printAudit')).toHaveCount(0);await expect(page.locator('#results')).toContainText('Tap Calculate');
 await page.locator('#calculate').tap();await expect(page.locator('#reviewChecklist input').first()).not.toBeChecked();
 expect(errors).toEqual([]);
});
test('direct demo links and touch target size',async({page})=>{
 const response=await page.goto(url+'#demo=02');if(url.startsWith('https:')){expect(response?.status()).toBe(200);expect(response?.headers()['content-security-policy']).toContain("connect-src 'none'");expect(response?.headers()['x-robots-tag']).toContain('noindex');}
 await expect(page.locator('#demoNotice')).toContainText('DEMO 02');
 const targets=await page.locator('[data-demo]').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().height));expect(targets.every(h=>h>=44)).toBe(true);
});

test('demo exports remain explicitly synthetic and no external service is called',async({page})=>{
 const external:string[]=[];const allowed=new URL(url).origin;
 page.on('request',r=>{if(r.url().startsWith('http')&&new URL(r.url()).origin!==allowed)external.push(r.url())});
 await page.goto(url+'#demo=01');await page.locator('#calculate').tap();await page.locator('#evaluateField').tap();
 await expect(page.locator('#fieldResult')).toContainText('BLOCKED');
 const result=page.waitForEvent('download');await page.locator('#exportField').tap();
 const stream=await (await result).createReadStream();const chunks=[];for await(const chunk of stream!)chunks.push(chunk);
 const record=JSON.parse(Buffer.concat(chunks).toString());expect(record.demoId).toBe('01');expect(record.demoWarning).toBe('DEMO DATA — NOT FOR PRODUCTION CUTTING');
 expect(external).toEqual([]);
});
