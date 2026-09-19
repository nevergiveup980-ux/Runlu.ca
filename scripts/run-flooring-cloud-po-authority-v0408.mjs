import fs from 'node:fs';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

const source=fs.readFileSync(new URL('../flooring/po-safe-v040.js',import.meta.url),'utf8');
const checks=[];
function test(name,fn){const t=performance.now();try{fn();checks.push({name,pass:true,ms:+(performance.now()-t).toFixed(2)})}catch(e){checks.push({name,pass:false,error:e.message,ms:+(performance.now()-t).toFixed(2)})}}
function sliceBetween(a,b){const i=source.indexOf(a),j=source.indexOf(b,i+1);assert(i>=0&&j>i,'missing slice '+a);return source.slice(i,j)}

test('PO module compiles after cloud-authority hardening',()=>new Function(source));

test('Digital issue uses central atomic RPC with idempotency key',()=>{
  const s=sliceBetween('async function issueDigital()','async function initNumber()');
  assert(s.includes("rpc('flooring_issue_digital_po'"));
  assert(s.includes('p_issue_key:r.issueKey'));
  assert(s.includes('persistIssueKey(r)'));
});

test('Digital issue has no local-number fallback or local counter increment',()=>{
  const s=sliceBetween('async function issueDigital()','async function initNumber()');
  assert.equal(s.includes('settings.nextNumber'),false);
  assert.equal(s.includes('while(taken('),false);
  assert(s.includes('Local numbering will not be used as a fallback'));
});

test('Issue key is persisted before the central RPC is attempted',()=>{
  const s=sliceBetween('async function issueDigital()','async function initNumber()');
  assert(s.indexOf('persistIssueKey(r)')<s.indexOf("rpc('flooring_issue_digital_po'"));
});

test('Manual issued PO is also checked by central authority',()=>{
  const s=sliceBetween('async function recordManual()','async function issueDigital()');
  assert(s.includes("rpc('flooring_record_manual_po'"));
  assert(s.includes('Cloud PO Authority sign-in is required'));
  assert(s.includes('recoverManualCloudRow(r)'));
});

test('Central counter initialization uses server RPC',()=>{
  const s=sliceBetween('async function initNumber()','function previewPayload');
  assert(s.includes("rpc('flooring_initialize_po_counter'"));
  assert(s.includes('CENTRAL digital PO counter'));
});

test('Counter state is read from the shared flooring_po_counters table',()=>{
  assert(source.includes("from('flooring_po_counters').select('*').eq('environment',ENV).maybeSingle()"));
  assert(source.includes("msg.textContent='Next digital PO: '+cloudCounter.next_number"));
});

test('Cloud authority reuses the existing Flooring staff auth session',()=>{
  assert(source.includes("const AUTH_STORAGE='runlu-flooring-auth-v1'"));
  assert(source.includes('persistSession:true'));
  assert(source.includes('signInWithPassword'));
});

test('Validation environment stays training while production PO mutation lock remains active',()=>{
  assert(source.includes("const ENV='training'"));
  assert.equal(source.includes("const ENV='production'"),false);
});

test('Issued cloud row is mirrored locally without inventing a new PO number',()=>{
  const s=sliceBetween('function adoptCloudRow','async function refreshCloudAuthority');
  assert(s.includes('row.po_number'));
  assert(s.includes('cloudId:row.id'));
  assert(s.includes('issueKey:row.issue_key'));
});

test('Draft save remains local and does not allocate a digital number',()=>{
  const s=sliceBetween('function saveDraft()','async function recordManual()');
  assert(s.includes('upsert(r)'));
  assert.equal(s.includes('poNumber=String'),false);
  assert.equal(s.includes('flooring_issue_digital_po'),false);
});

test('No browser direct insert/update/delete against central PO ledger',()=>{
  assert.equal(/from\(['"]flooring_supplier_orders['"]\)\.(insert|update|delete|upsert)/.test(source),false);
});

for(const c of checks)console.log((c.pass?'PASS':'FAIL')+'  '+c.name+'  '+c.ms+'ms'+(c.error?'  '+c.error:''));
const failed=checks.filter(x=>!x.pass);
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
