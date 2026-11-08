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
  try{
   const data=await readFile(target);
   const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css'};
   res.writeHead(200,{'content-type':mime[extname(target)]??'application/octet-stream'});res.end(data);
  }catch{res.writeHead(404);res.end()}
 });
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 base='http://127.0.0.1:'+server.address().port;
});
test.afterAll(async()=>{if(server)await new Promise(done=>server.close(done))});
test('demo loads and switches states without browser errors',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/stage-2/ai-director/control-center-preview.html');
 await expect(page.locator('#mode-banner')).toContainText('DEMO MODE');
 await expect(page.locator('#shots tr')).toHaveCount(4);
 await page.locator('#paused').click();
 await expect(page.locator('#safety')).toContainText('spending paused');
 await page.locator('#unknown').click();
 await expect(page.locator('#safety')).toContainText('unknown provider');
 await page.locator('#normal').click();
 await expect(page.locator('#completed')).toHaveText('1 / 4');
 expect(errors).toEqual([]);
});
test('failed authenticated read returns to clearly labeled demo',async({page})=>{
 await page.goto(base+'/stage-2/ai-director/control-center-preview.html');
 await page.locator('#load-live').click();
 await expect(page.locator('#live-status')).toContainText('Access denied');
 await expect(page.locator('#mode-banner')).toContainText('DEMO MODE');
 await expect(page.locator('#load-live')).toBeEnabled();
 await page.locator('#load-live').click();
 await expect(page.locator('#live-status')).toContainText('Access denied');
 await expect(page.locator('#load-live')).toBeEnabled();
});
test('mobile layout and controls remain usable',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'/stage-2/ai-director/control-center-preview.html');
 await expect(page.locator('#languageToggle')).toBeVisible();
 await page.locator('#unknown').click();
 await expect(page.locator('#safety')).toContainText('unknown provider');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
});
