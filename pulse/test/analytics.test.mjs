import {test, afterEach} from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index-canonical.js';
import {queryHistory} from '../src/cloudflare.js';
const originalFetch = globalThis.fetch;
afterEach(() => {globalThis.fetch = originalFetch;});
const env = {CF_ANALYTICS_TOKEN: 'test-private-token', CF_ACCOUNT_ID: 'test-account', RUNLU_HISTORY_EPOCH: new Date(Date.now()-10*86400000).toISOString()};
const limits = {enabled:true, maxDuration:86400, notOlderThan:2678400, maxPageSize:10000};
function reply(account) {return Response.json({data:{viewer:{accounts:[account]}}});}
function mock({empty=false, settings=limits, error}={}) {
  const calls=[];
  globalThis.fetch = async (url, init) => {
    assert.equal(url,'https://api.cloudflare.com/client/v4/graphql');
    assert.equal(init.method,'POST');
    const body=JSON.parse(init.body); calls.push(body);
    if(error) return error();
    if(body.query.includes('PulseLimits')) return reply({settings:{rumPageloadEventsAdaptiveGroups:settings}});
    assert.ok(+new Date(body.variables.end)-+new Date(body.variables.start)<=settings.maxDuration*1000);
    assert.ok(body.query.includes('datetime_lt: $end'));
    assert.ok(!body.query.includes('datetime_leq: $end'));
    assert.ok(!/clientIP|userId|email/.test(body.query));
    const count=empty?0:5;
    const rows=empty?[]:[{count,sum:{visits:2}}];
    const group=(dimension,value)=>rows.map(r=>({...r,dimensions:{[dimension]:value}}));
    const account={totals:rows,pages:group('requestPath','/book/index.html')};
    if(body.query.includes('firstSeen:')) account.firstSeen=empty?[]:[{dimensions:{date:body.variables.start.slice(0,10)}}];
    else Object.assign(account,{trend:rows.map(r=>({...r,dimensions:{datetimeHour:body.variables.start,requestPath:'/book/index.html'}})), countries:group('countryName','CA'),browsers:group('userAgentBrowser','Firefox'),devices:group('deviceType','desktop'),referrers:group('refererHost','')});
    return reply(account);
  };
  return calls;
}
for(const path of ['/api/analytics?days=1','/api/analytics?days=7','/api/analytics?days=30','/api/lifetime']) {
  for(const empty of [false,true]) test(`${path}: ${empty?'empty':'populated'}`,async()=>{
    const calls=mock({empty});
    const response=await worker.fetch(new Request('https://pulse.test'+path),env);
    assert.equal(response.status,200);
    const data=await response.json();
    assert.equal(data.meta.empty,empty);
    assert.equal(data.summary.rawPageViews,empty?0:(calls.length-1)*5);
    assert.equal(data.summary.visits,empty?0:(calls.length-1)*2);
    if(data.pages&&!empty) assert.equal(data.pages[0].name,'Book');
    assert.ok(!JSON.stringify(data).includes(env.CF_ANALYTICS_TOKEN));
  });
}
for(const status of [401,403,429,500]) test(`upstream HTTP ${status}`,async()=>{
  mock({error:()=>new Response('not json test-private-token',{status})});
  const response=await worker.fetch(new Request('https://pulse.test/api/lifetime'),env);
  const data=await response.json();
  assert.equal(data.error,status===401||status===403?'PERMISSION_ERROR':status===429?'RATE_LIMITED':'API_ERROR');
  assert.equal(data.upstreamStatus,status);
  assert.ok(!JSON.stringify(data).includes(env.CF_ANALYTICS_TOKEN));
});
test('HTTP 200 GraphQL permissions fail safely',async()=>{
  mock({error:()=>Response.json({errors:[{message:'not authorized test-private-token'}]})});
  const res=await worker.fetch(new Request('https://pulse.test/api/lifetime'),env);
  assert.equal(res.status,403); assert.ok(!(await res.text()).includes(env.CF_ANALYTICS_TOKEN));
});
for(const path of ['/api/lifetime','/api/analytics?days=30']) test('missing config '+path,async()=>{
  globalThis.fetch=()=>{throw Error('must not query');};
  const res=await worker.fetch(new Request('https://pulse.test'+path),{});
  assert.equal(res.status,503);assert.equal((await res.json()).error,'CONFIGURATION_ERROR');
});
test('invalid timezone',async()=>{
  const res=await worker.fetch(new Request('https://pulse.test/api/analytics'),{...env,RUNLU_TIME_ZONE:'bad'});
  assert.equal((await res.json()).error,'CONFIGURATION_ERROR');
});
test('invalid epoch',async()=>{
  const res=await worker.fetch(new Request('https://pulse.test/api/lifetime'),{...env,RUNLU_HISTORY_EPOCH:'bad'});
  assert.equal((await res.json()).error,'CONFIGURATION_ERROR');
});
test('retention clips history explicitly',async()=>{
  mock();const res=await worker.fetch(new Request('https://pulse.test/api/lifetime'),{...env,RUNLU_HISTORY_EPOCH:'2020-01-01'});
  const data=await res.json();assert.equal(res.status,200);assert.equal(data.meta.coverage.retentionLimited,true);
  assert.ok(+new Date(data.meta.coverage.start)>Date.now()-limits.notOlderThan*1000);
});
test('saturated groups split without duplicate totals',async()=>{
  let reads=0;
  globalThis.fetch=async(url,init)=>{
    const {query,variables:v}=JSON.parse(init.body);
    if(query.includes('PulseLimits'))return reply({settings:{rumPageloadEventsAdaptiveGroups:{...limits,maxPageSize:2}}});
    reads++;
    return reply({totals:[{count:10,sum:{visits:4}}],pages:reads===1?[{},{ }]:[{count:10,sum:{visits:4},dimensions:{requestPath:'/'}}]});
  };
  const end=new Date(),start=new Date(+end-3600000);
  const result=await queryHistory(env,'query { pages(limit: 500 filter: {datetime_leq: $end}) }',start,end);
  assert.equal(reads,3);assert.equal(result.account.totals[0].count,20);
});
test('network failure is classified',async()=>{
  globalThis.fetch=async()=>{throw Error('test-private-token');};
  const res=await worker.fetch(new Request('https://pulse.test/api/lifetime'),env);
  assert.equal((await res.json()).error,'API_UNAVAILABLE');
});
test('HTML exposes all four ranges and safe errors',async()=>{
  const res=await worker.fetch(new Request('https://pulse.test/'),{});const html=await res.text();
  for(const days of [0,1,7,30])assert.ok(html.includes(`data-days="${days}"`));
  assert.ok(html.includes('No analytics data for this range.'));
  assert.ok(!html.includes(env.CF_ANALYTICS_TOKEN));
  for(const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new Function(script[1]);
});
for(const date of ['2026-03-09T16:00:00Z','2026-11-02T16:00:00Z']) test(`local midnight across DST ${date}`,async(t)=>{
  t.mock.timers.enable({apis:['Date'],now:new Date(date)});
  const calls=mock();
  const res=await worker.fetch(new Request('https://pulse.test/api/analytics?days=7'),env);
  assert.equal(res.status,200);
  const start=calls[1].variables.start;
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Edmonton',hour:'2-digit',hourCycle:'h23',minute:'2-digit'}).format(new Date(start));
  assert.equal(parts,'00:00');
  assert.equal(start.slice(0,10),date.startsWith('2026-03')?'2026-03-03':'2026-10-27');
});
test('disabled dataset is a permission error',async()=>{
  mock({settings:{...limits,enabled:false}});
  const res=await worker.fetch(new Request('https://pulse.test/api/lifetime'),env);
  assert.equal((await res.json()).error,'PERMISSION_ERROR');
});
test('missing analytics groups must not masquerade as empty',async()=>{
  mock(); const fetchMock=globalThis.fetch;
  globalThis.fetch=async(url,init)=>JSON.parse(init.body).query.includes('PulseLimits')?fetchMock(url,init):reply({});
  const res=await worker.fetch(new Request('https://pulse.test/api/lifetime'),env);
  assert.equal((await res.json()).error,'API_ERROR');
});
test('upstream time limits are distinguished',async()=>{
  mock({error:()=>Response.json({errors:[{message:'time range is too large'}]})});
  const res=await worker.fetch(new Request('https://pulse.test/api/lifetime'),env);
  assert.equal((await res.json()).error,'TIME_RANGE_ERROR');
});
