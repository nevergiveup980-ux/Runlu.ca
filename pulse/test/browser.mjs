import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
import worker from '../src/index-canonical.js';
const env={CF_ANALYTICS_TOKEN:'test-secret',CF_ACCOUNT_ID:'test-account',RUNLU_HISTORY_EPOCH:new Date(Date.now()-2*86400000).toISOString()};
let mode='data';
const calls=[];
globalThis.fetch=async(url,init)=>{
  const body=JSON.parse(init.body);
  if(mode==='error')return Response.json({errors:[{message:'not authorized test-secret'}]});
  const account=body.query.includes('PulseLimits')?{settings:{rumPageloadEventsAdaptiveGroups:{enabled:true,maxDuration:86400,notOlderThan:2678400,maxPageSize:10000}}}:
    Object.fromEntries([...body.query.matchAll(/(\w+):\s*rumPageloadEventsAdaptiveGroups/g)].map(([,key])=>[key,mode==='empty'?[]:key==='firstSeen'?[{dimensions:{date:'2026-11-01'}}]:[{count:5,sum:{visits:2},dimensions:key==='totals'?undefined:{requestPath:'/',datetimeHour:body.variables.start,countryName:'CA',userAgentBrowser:'Firefox',deviceType:'desktop',refererHost:''}}]]));
  return Response.json({data:{viewer:{accounts:[account]}}});
};
const server=createServer(async(req,res)=>{
  try {
    calls.push(req.url);
    const response=await worker.fetch(new Request('http://127.0.0.1'+req.url),env);
    res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());
  } catch {res.writeHead(500);res.end('test server failed');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:process.env.PULSE_CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
try {
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*', route=>route.continue());
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.locator('#updated').filter({hasText:'Updated '}).waitFor();
  for(const days of [1,7,30,0]) {
    await page.locator(`[data-days="${days}"]`).click();
    await page.locator('#updated').filter({hasText:'Updated '}).waitFor();
    assert.ok((await page.locator('#app').innerText()).includes(days===0?'All available history':`${days} day window`));
    assert.ok(calls.includes(days===0?'/api/lifetime':`/api/analytics?days=${days}`));
  }
  mode='empty';await page.locator('#refresh').click();
  await page.locator('#app').filter({hasText:'No analytics data for this range.'}).waitFor();
  mode='error';await page.locator('#refresh').click();
  await page.locator('#app').filter({hasText:'PERMISSION_ERROR'}).waitFor();
  assert.ok(!(await page.content()).includes('test-secret'));
  mode='data';await page.locator('[data-days="7"]').click();
  await page.locator('#updated').filter({hasText:'Updated '}).waitFor();
  assert.deepEqual(errors,[]);
  await page.screenshot({path:'/tmp/pulse-browser.png',fullPage:true});
  console.log('Browser passed: four ranges, data, empty, permission error, recovery, no JS errors or secret exposure.');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
