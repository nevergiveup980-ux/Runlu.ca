import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHandler, generate, fetchJSON, SafeError, POLICY } from '../../supabase/functions/runlu-forum-ai/core.mjs';
const request = body => new Request('https://forum.test', { method: 'POST', body: JSON.stringify(body) });
function setup(options = {}) {
  const calls = [], events = [];
  const ledger = {
    reserve: async (_, n) => { events.push(['reserve', n]); return 'batch'; },
    record: async (...v) => { events.push(['record', ...v]); },
    finish: async id => { events.push(['finish', id]); },
    status: async () => ({ budget: { reserved_usd: 0.05 }, verified: {} }),
    ...options.ledger,
  };
  const fetcher = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    events.push(['upstream']);
    if (options.failure) return new Response(JSON.stringify({ error: { message: 'secret-key-sensitive-prompt' } }), { status: options.failure });
    const provider = url.includes('googleapis') ? 'Gemini' : url.includes('openai') ? 'OpenAI' : 'Claude';
    const payload = provider === 'Gemini' ? { candidates: [{ content: { parts: [{ text: 'Gemini real-shaped response' }] } }], usageMetadata: { promptTokenCount: 30, candidatesTokenCount: 15, thoughtsTokenCount: 5 } } : provider === 'OpenAI' ? { choices: [{ message: { content: 'OpenAI viewpoint' } }], usage: { prompt_tokens: 30, completion_tokens: 15 } } : { content: [{ type: 'text', text: 'Claude viewpoint' }], usage: { input_tokens: 30, output_tokens: 15 } };
    return Response.json(options.payload || payload);
  };
  return { handler: createHandler({ env: options.env || (() => 'test-secret'), fetcher, ledger }), calls, events };
}
test('Gemini uses official API, header-only key and capped output', async () => {
  const s = setup(); const res = await s.handler(request({ title: 'Test', providers: ['Gemini'] }));
  const d = await res.json(); assert.equal(d.results[0].provider, 'Gemini');
  assert.equal(s.calls[0].url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent');
  assert.equal(s.calls[0].init.headers['x-goog-api-key'], 'test-secret');
  assert.equal(s.calls[0].body.generationConfig.maxOutputTokens, 700);
  assert.equal(JSON.stringify(d).includes('test-secret'), false);
  assert.deepEqual(s.events[0], ['reserve', 1]);
});
test('two rounds alternate OpenAI/Gemini with preceding reply and stop at four turns', async () => {
  const s = setup(); const d = await (await s.handler(request({ title: 'Debate', providers: ['OpenAI', 'Gemini'], rounds: 2 }))).json();
  assert.deepEqual(d.results.map(x => x.provider), ['OpenAI','Gemini','OpenAI','Gemini']);
  assert.deepEqual(s.events[0], ['reserve',4]);
  assert.match(s.calls[1].body.contents[0].parts[0].text, /OpenAI viewpoint/);
  assert.match(s.calls[2].body.messages[1].content, /Gemini real-shaped response/);
});
test('all three seats remain callable', async () => {
  const s=setup();const d=await(await s.handler(request({title:'Test',providers:['OpenAI','Claude','Gemini']}))).json();
  assert.equal(d.results.length,3);assert.equal(s.calls[1].body.max_tokens,700);
});
for (const body of [{ title: 'x', rounds: 99 }, { title:'x', rounds: 0 }, {title:'x',providers:['Gemini','Gemini']}, {title:'x',providers:['bad']}, {title: {}}, { title: '中'.repeat(4000) }, {title:'x',providers:[]}, {action:'unknown'}]) test(`reject unsafe input ${JSON.stringify(body).slice(0,70)}`, async()=>{
  const s=setup();const r=await s.handler(request(body));assert.ok(r.status>=400);assert.equal(s.calls.length,0);assert.equal(s.events.length,0);
});
for (const code of ['DAILY_BUDGET_EXHAUSTED','FORUM_BUSY','RATE_LIMITED','CLIENT_DAILY_LIMIT','BUDGET_SERVICE_UNAVAILABLE']) test(`fail closed for ${code}`, async()=>{
  const s=setup({ledger:{reserve:async()=>{throw new SafeError(code,429);}}});
  const r=await s.handler(request({title:'x',providers:['Gemini']}));assert.equal(r.status,429);assert.equal(s.calls.length,0);
});
for (const status of [401,402,403,404,429,500]) test(`upstream ${status} stops debate and redacts errors`, async()=>{
 const s=setup({failure:status});const d=await(await s.handler(request({title:'x',providers:['Gemini','OpenAI'],rounds:2}))).json();
 assert.equal(s.calls.length,1);assert.equal(d.results.length,1);assert.ok(d.results[0].error);assert.equal(JSON.stringify(d).includes('sensitive'),false);assert.equal(s.events.at(-1)[0],'finish');
});
test('empty or blocked replies do not become verified connections',async()=>{
 for(const payload of [{candidates:[]},{promptFeedback:{blockReason:'SAFETY'}}]){
 const s=setup({payload});const d=await(await s.handler(request({title:'x',providers:['Gemini']}))).json();assert.ok(d.results[0].error);assert.equal(s.events.find(e=>e[0]==='record')[3],false);
 }
});
test('presence of key never claims connected; no provider calls from status',async()=>{
 const s=setup();const d=await(await s.handler(request({action:'status'}))).json();assert.equal(d.providers.Gemini,false);assert.equal(d.provider_details.Gemini.configured,true);assert.equal(s.calls.length,0);
});
test('missing key prevents any billed call',async()=>{
 const s=setup({env:()=>''});assert.equal((await s.handler(request({title:'x',providers:['Gemini']}))).status,503);assert.equal(s.events.length,0);
});
test('streamed oversized body rejected',async()=>{
 const s=setup();const r=await s.handler(request({title:'a'.repeat(25000)}));assert.equal(r.status,413);assert.equal(s.calls.length,0);
});
test('timeout includes response body; original upstream errors never escape', async()=>{
 const stalled=async(_url,{signal})=>({json:()=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('secret','AbortError'))))});
 await assert.rejects(fetchJSON(stalled,'https://test',{},5), e=>e.code==='API_TIMEOUT');
 await assert.rejects(fetchJSON(async()=>{throw new Error('secret');},'https://test',{}),e=>e.code==='UPSTREAM_UNAVAILABLE');
});
test('unknown usage cannot be accepted or marked connected',async()=>{
 const s=setup({payload:{candidates:[{content:{parts:[{text:'Hello'}]}}]}});
 const d=await(await s.handler(request({title:'x',providers:['Gemini']}))).json();assert.equal(d.results[0].error,'USAGE_BOUND_VIOLATION');
});
test('origin and method restrictions',async()=>{
 const s=setup();const r=await s.handler(new Request('https://forum.test',{method:'POST',headers:{Origin:'https://evil.test'},body:'{}'}));assert.equal(r.status,403);
 assert.equal((await s.handler(new Request('https://forum.test'))).status,405);
});
test('conservative reservation exceeds maximum priced token usage for every seat',()=>{
 for(const [input,output] of [[0.4,1.6],[3,15],[0.3,2.5]]) assert.ok(((POLICY.inputBytes+512)*input+POLICY.outputTokens*output)/1e6<POLICY.callUSD);
});
