import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';
const root=new URL('../../',import.meta.url);
async function page(options={}){
 const html=await fs.readFile(new URL('forum.html',root),'utf8');
 const dom=new JSDOM(html,{url:'https://runlu.ca/forum.html',runScripts:'outside-only'});
 const w=dom.window,calls=[];
 w.TextEncoder=TextEncoder;w.AbortController=AbortController;
 w.localStorage.setItem('runlu_forum_prototype_budget_v01','999999');
 w.localStorage.setItem('runlu_forum_prototype_posts_v01',JSON.stringify([{id:'test-post',title:'A test discussion',body:'What do you think?',category:'humanity',mode:'roundtable',created:new Date().toISOString(),author:'You',seats:['OpenAI','Gemini'],replies:[]} ]));
 const status={providers:{OpenAI:false,Claude:false,Gemini:false},provider_details:{OpenAI:{configured:true},Gemini:{configured:true}},budget:{reserved_usd:0.2,daily_budget_usd:2}};
 w.fetch=async(url,init)=>{
  const body=JSON.parse(init.body);calls.push(body);
  if(options.statusFail && body.action==='status')throw new Error('offline');
  if(body.action==='status')return {ok:true,json:async()=>status};
  if(options.respond) return options.respond(body);
  status.providers.Gemini=true;status.provider_details.Gemini.verified=true;
  return {ok:true,json:async()=>({results:[{provider:'Gemini',text:'<script>unsafe</script>Real-shaped test reply',model:'test-model'}],budget:{reserved_usd:0.25}})};
 };
 for(const file of ['forum-ai-config.js','forum.js','forum-live-ai.js'])vm.runInContext(await fs.readFile(new URL(file,root),'utf8'),dom.getInternalVMContext());
 await new Promise(r=>setTimeout(r,15));
 vm.runInContext("openThread('test-post')",dom.getInternalVMContext());
 return {dom,w,calls};
}
test('server budget overrides tampered local budget; configured is not connected',async()=>{
 const p=await page();try{
 assert.equal(p.w.document.getElementById('budgetValue').textContent,'$0.20 / $2.00');
 const gemini=p.w.document.querySelector('[data-seat="Gemini"] small');assert.match(gemini.textContent,/not verified/);
 assert.equal(p.w.document.querySelector('[data-live-provider="Gemini"]').disabled,false);
 }finally{p.dom.window.close();}
});
test('roundtable sends explicit two-round request, stores escaped genuine results, updates status',async()=>{
 const p=await page();try{
 await p.w.document.getElementById('liveRoundtable').onclick();
 await new Promise(r=>setTimeout(r,20));
 const req=p.calls.find(c=>!c.action);assert.deepEqual(req.providers,['OpenAI','Gemini']);assert.equal(req.rounds,2);
 assert.match(p.w.document.querySelector('[data-seat="Gemini"] small').textContent,/Connected/);
 assert.equal(p.w.document.querySelector('.reply script'),null);
 assert.match(p.w.document.querySelector('.reply p').textContent,/<script>/);
 }finally{p.dom.window.close();}
});
test('failed status clears availability and budget instead of claiming connection',async()=>{
 const p=await page({statusFail:true});try{
 assert.equal(p.w.document.getElementById('budgetValue').textContent,'— / $2.00');
 assert.equal(p.w.document.querySelector('[data-live-provider="Gemini"]').disabled,true);
 }finally{p.dom.window.close();}
});
test('gateway denial displays explanation and restores controls without adding mock reply',async()=>{
 const p=await page({respond:async()=>({ok:false,status:402,json:async()=>({error:'DAILY_BUDGET_EXHAUSTED'})})});try{
 await p.w.document.querySelector('[data-live-provider="Gemini"]').onclick();
 assert.match(p.w.document.getElementById('liveAiState').textContent,/exhausted/);
 assert.equal(p.w.document.querySelectorAll('.reply').length,0);
 assert.equal(p.w.document.querySelector('[data-live-provider="Gemini"]').disabled,false);
 }finally{p.dom.window.close();}
});
