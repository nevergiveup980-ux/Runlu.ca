import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
let server,base;
test.beforeAll(async()=>{
 const root=process.cwd();
 server=createServer(async(req,res)=>{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(path.startsWith('/api/')){res.writeHead(403,{'content-type':'application/json'});res.end('{"error":"access_denied"}');return}
  const target=resolve(root,'.'+path);
  if(!target.startsWith(root+sep)){res.writeHead(403);res.end();return}
  try{const data=await readFile(target);res.writeHead(200,{'content-type':{'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript'}[extname(target)]??'application/octet-stream'});res.end(data)}
  catch{res.writeHead(404);res.end()}
 });
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 base='http://127.0.0.1:'+server.address().port;
});
test.afterAll(async()=>{if(server)await new Promise(done=>server.close(done))});
const pageUrl=()=>base+'/stage-2/ai-director/recovery-review-preview.html';
test('mobile demo shows both uncertain states without overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pageUrl());
 await expect(page.locator('#languageToggle')).toBeVisible();
 await expect(page.locator('.item')).toHaveCount(2);
 await expect(page.locator('#message')).toContainText('DEMO ONLY');
 await expect(page.locator('#items')).toContainText('Automatic retry disabled');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
 expect(errors).toEqual([]);
});
test('denied live access clears demo and never exposes private data',async({page})=>{
 await page.goto(pageUrl());await page.locator('#load').click();
 await expect(page.locator('#message')).toContainText('Access denied');
 await expect(page.locator('.item')).toHaveCount(0);
 await expect(page.locator('#load')).toBeEnabled();
});
test('authorized mocked recovery response displays manual review only',async({page})=>{
 const data={episodeId:'ep1',items:[{attemptId:'a1',shotId:'s1',state:'UNKNOWN',providerTaskId:'task_1',retryAllowed:false,requiresManualReconciliation:true}]};
 await page.route('**/api/stage/director/recovery?*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data})}));
 await page.goto(pageUrl());await page.locator('#episode').fill('ep1');await page.locator('#load').click();
 await expect(page.locator('#message')).toContainText('Authorized read-only');
 await expect(page.locator('.item')).toHaveCount(1);
 await expect(page.locator('#items')).toContainText('task_1');
 await expect(page.getByRole('button',{name:/retry|submit|generate/i})).toHaveCount(0);
});
test('malformed success and network failure fail closed',async({page})=>{
 await page.route('**/api/stage/director/recovery?*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{episodeId:'ep1',items:[{attemptId:'a1',shotId:'s1',state:'UNKNOWN',retryAllowed:true,requiresManualReconciliation:true}]}})}));
 await page.goto(pageUrl());await page.locator('#episode').fill('ep1');await page.locator('#load').click();
 await expect(page.locator('#message')).toContainText('response invalid');
 await expect(page.locator('.item')).toHaveCount(0);
 await page.unroute('**/api/stage/director/recovery?*');
 await page.route('**/api/stage/director/recovery?*',route=>route.abort());
 await page.locator('#load').click();
 await expect(page.locator('#message')).toContainText('unavailable');
 await expect(page.locator('.item')).toHaveCount(0);
});

test('changing episode invalidates prior records and blocks late stale response',async({page})=>{
 let release;
 await page.route('**/api/stage/director/recovery?*',async route=>{
  await new Promise(resolve=>{release=resolve});
  try{await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{episodeId:'ep1',items:[{attemptId:'old',shotId:'s1',state:'UNKNOWN',retryAllowed:false,requiresManualReconciliation:true}]}})})}
  catch{} // aborted request is expected
 });
 await page.goto(pageUrl());await page.locator('#episode').fill('ep1');await page.locator('#load').click();
 await expect.poll(()=>typeof release).toBe('function');
 await page.locator('#episode').fill('ep2');
 await expect(page.locator('#message')).toContainText('Episode changed');
 await expect(page.locator('.item')).toHaveCount(0);
 release();
 await expect(page.locator('.item')).toHaveCount(0);
 await expect(page.locator('#load')).toBeEnabled();
});
test('returning to demo aborts pending live request',async({page})=>{
 let release;
 await page.route('**/api/stage/director/recovery?*',async route=>{
  await new Promise(resolve=>{release=resolve});
  try{await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{episodeId:'ep1',items:[]}})})}catch{}
 });
 await page.goto(pageUrl());await page.locator('#episode').fill('ep1');await page.locator('#load').click();
 await expect.poll(()=>typeof release).toBe('function');
 await page.locator('#demo').click();
 release();
 await expect(page.locator('#message')).toContainText('DEMO ONLY');
 await expect(page.locator('.item')).toHaveCount(2);
});

test('expired session prompts sign-in without showing prior demo records',async({page})=>{
 await page.route('**/api/stage/director/recovery?*',route=>route.fulfill({status:401,contentType:'application/json',body:'{"error":"unauthorized"}'}));
 await page.goto(pageUrl());await page.locator('#load').click();
 await expect(page.locator('#message')).toContainText('Sign in again');
 await expect(page.locator('.item')).toHaveCount(0);
});
test('invalid episode is rejected locally with helpful error',async({page})=>{
 let calls=0;
 await page.route('**/api/stage/director/recovery?*',route=>{calls++;return route.abort()});
 await page.goto(pageUrl());await page.locator('#episode').fill('invalid episode');
 await page.locator('#load').click();
 await expect(page.locator('#message')).toContainText('Enter a valid episode ID');
 expect(calls).toBe(0);
});
test('mismatched episode response never renders another episode records',async({page})=>{
 await page.route('**/api/stage/director/recovery?*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{episodeId:'different',items:[]}})}));
 await page.goto(pageUrl());await page.locator('#episode').fill('ep1');await page.locator('#load').click();
 await expect(page.locator('#message')).toContainText('mismatched episode');
 await expect(page.locator('.item')).toHaveCount(0);
});
