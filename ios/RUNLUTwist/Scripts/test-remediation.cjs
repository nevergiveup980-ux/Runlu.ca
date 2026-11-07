// Real browser DOM tests; separate from the actual WKWebView XCTest run.
const {chromium,webkit}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const html=path.resolve(process.env.TWIST_TEST_HTML||path.join(__dirname,'../RUNLUTwist/Web/twist.html'));
const out=path.resolve(process.env.TWIST_TEST_OUTPUT||path.join(__dirname,'../Reports/remediation-browser-results.json'));
const results=[];let failures=0;
const answers=[1,1,3,0,1,1,1,0,0,1];
async function run(){for(const [engine,type] of Object.entries({chromium,webkit})){
 const browser=await type.launch({headless:true});
 async function test(name,fn,{seed={},native=false,width=390,height=844,denied=false}={}){
  const ctx=await browser.newContext({viewport:{width,height},offline:true});
  const page=await ctx.newPage();let errors=[];page.on('pageerror',e=>errors.push(String(e)));let requests=[];page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
  await page.addInitScript(({seed,native,denied})=>{
   if(!sessionStorage.getItem('seeded')){localStorage.clear();for(const [k,v]of Object.entries(seed))localStorage.setItem(k,v);sessionStorage.setItem('seeded','1')}
   if(native){window.__twistNativeSnapshot=JSON.parse(sessionStorage.getItem('snapshot')||'{}');window.webkit={messageHandlers:{twist:{postMessage(m){if(m.type==='save')sessionStorage.setItem('snapshot',JSON.stringify(m.values));window.lastNativeMessage=m;}}}}}
   if(denied){Storage.prototype.getItem=function(){throw new Error('denied')};Storage.prototype.setItem=function(){throw new Error('denied')};}
  },{seed,native,denied});
  try{await page.goto('file://'+html);await fn(page);assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);results.push({engine,name,status:'PASS'});}catch(e){failures++;results.push({engine,name,status:'FAIL',error:String(e)});}finally{await ctx.close();}
 }
 for(const lang of ['en','zh'])await test('all 20 classics, reasoning, reflection, share, persistence: '+lang,async p=>{
  await p.selectOption('#language',lang);assert.match(await p.locator('#intro').innerText(),lang==='en'?/Think first/:/先想一想/);
  assert.equal(await p.locator('input,textarea').count(),0);
  for(let i=0;i<20;i++){
   assert((await p.locator('#question').innerText()).length>5);
   assert(await p.locator('#reflection').isHidden());
   await p.locator('#reasoningChoices button').nth(i%3).click();assert((await p.locator('#reasoningFeedback').innerText()).length>8);
   if(i===0)await p.click('#hintBtn');await p.click('#answerBtn');
   assert(await p.locator('#reflection').isVisible());await p.locator('#reflectionChoices button').nth(i%3).click();await p.click('#gotBtn');
   if(i<19)await p.click('#nextBtn');
  }
  assert.match(await p.locator('#points').innerText(),/195/);assert.match(await p.locator('#reflectionFeedback').innerText(),/20 \/ 20/);
  await p.reload();assert.match(await p.locator('#counter').innerText(),/20/);assert.equal(await p.locator('#language').inputValue(),lang);
  assert.equal(await p.locator('#reasoningChoices [aria-pressed="true"]').count(),1);assert.equal(await p.locator('#reflectionChoices [aria-pressed="true"]').count(),1);
  await p.click('#reviewBtn');assert.match(await p.locator('#counter').innerText(),/01/);
  await p.click('#shareBtn');assert.equal((await p.evaluate(()=>window.lastNativeMessage)).type,'share');assert(!JSON.stringify(await p.evaluate(()=>window.lastNativeMessage)).includes('file:'));
  p.once('dialog',d=>d.dismiss());await p.click('#resetBtn');assert.match(await p.locator('#solved').innerText(),/20 \/ 20/);
  p.once('dialog',d=>d.accept());await p.click('#resetBtn');assert.match(await p.locator('#solved').innerText(),/0 \/ 20/);assert(await p.locator('#reflection').isHidden());
 },{native:true});
 for(const lang of ['en','zh'])await test('10 studio answers/explanations, previous/next, restore and reset: '+lang,async p=>{
  await p.selectOption('#language',lang);
  for(let i=0;i<10;i++){
   assert.match(await p.locator('#studioCounter').innerText(),new RegExp((i+1)+' / 10'));
   assert((await p.locator('#studioQuestion').innerText()).length>10);
   await p.locator('#studioOptions button').nth(answers[i]).click();assert.match(await p.locator('#studioResult').innerText(),lang==='en'?/^Correct deduction\./:/^推理正确/);
   assert((await p.locator('#studioResult').innerText()).length>20);
   await p.reload();assert(await p.locator('#studioResult').isVisible());
   if(i<9)await p.click('#studioNext');
  }
  assert.match(await p.locator('#studioScore').innerText(),/10 \/ 10/);assert(await p.locator('#studioNext').isDisabled());await p.click('#studioPrev');assert.match(await p.locator('#studioCounter').innerText(),/9 \/ 10/);
  p.once('dialog',d=>d.accept());await p.click('#resetBtn');assert.match(await p.locator('#studioScore').innerText(),/10 \/ 10/);
  p.once('dialog',d=>d.accept());await p.click('#studioReset');assert.match(await p.locator('#studioScore').innerText(),/0 \/ 0/);assert(await p.locator('#studioPrev').isDisabled());
 },{native:true});
 await test('incorrect studio answer is scored and locked, revisit unchanged',async p=>{await p.locator('#studioOptions button').nth(0).click();assert.match(await p.locator('#studioResult').innerText(),/^Not quite/);assert.match(await p.locator('#studioScore').innerText(),/0 \/ 1/);await p.click('#studioNext');await p.click('#studioPrev');assert(await p.locator('#studioOptions button').nth(1).isDisabled());});
 for(const bad of ['{broken','7','"text"','[]','null','{"__proto__":2,"-1":1,"99":1,"0":99}'])await test('damaged selections/studio: '+bad,async p=>{await p.locator('#reasoningChoices button').nth(1).click();await p.click('#answerBtn');await p.locator('#reflectionChoices button').nth(0).click();await p.locator('#studioOptions button').nth(1).click();assert.match(await p.locator('#studioResult').innerText(),/^Correct/);},{seed:{'twist-reasoning-v1':bad,'twist-reflections-v1':bad,'twist-studio-v1':bad,'runlu-twist-node001-v1':bad}});
 await test('native five-key recovery after WebKit localStorage eviction + privacy round trip',async p=>{
  await p.locator('#reasoningChoices button').nth(1).click();await p.click('#answerBtn');await p.locator('#reflectionChoices button').nth(2).click();await p.locator('#studioOptions button').nth(1).click();await p.selectOption('#language','zh');
  const snapshot=await p.evaluate(()=>JSON.parse(sessionStorage.getItem('snapshot')));assert.equal(Object.keys(snapshot).length,5);
  await p.evaluate(()=>localStorage.clear());await p.reload();assert.equal(await p.locator('#reflectionChoices [aria-pressed="true"]').count(),1);assert.match(await p.locator('#studioScore').innerText(),/1 \/ 1/);
  await p.getByRole('link',{name:'Privacy / 隐私',exact:true}).click();await p.getByRole('link',{name:'← Game / 返回游戏',exact:true}).click();assert.match(await p.locator('#studioScore').innerText(),/1 \/ 1/);assert.equal(await p.locator('#language').inputValue(),'zh');
 },{native:true});
 for(const [width,height]of [[320,568],[390,844],[844,390]])await test('offline viewport '+width+'x'+height,async p=>{
  for(const l of ['en','zh']){await p.selectOption('#language',l);assert(await p.locator('#question').isVisible());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await p.locator('#reasoningChoices button').first().getAttribute('aria-pressed'),'false');}
  await p.screenshot({path:path.join(path.dirname(out),`twist11-${engine}-${width}x${height}.png`),fullPage:true});
 },{width,height});
 await browser.close();
 }
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify({kind:'Playwright real DOM on bundled file URL, offline; not actual iOS WKWebView',passed:results.length-failures,failed:failures,results},null,2));console.log(JSON.stringify({passed:results.length-failures,failed:failures,results},null,2));if(failures)process.exitCode=1;
}
run().catch(e=>{console.error(e);process.exitCode=1});
