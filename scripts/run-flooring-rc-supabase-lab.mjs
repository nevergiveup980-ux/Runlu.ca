import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const source=fs.readFileSync(new URL('../flooring/carpet-rc-tracking-v092.js',import.meta.url),'utf8');
const sourceSha256=crypto.createHash('sha256').update(source).digest('hex');
const cycles=Math.max(25,Math.min(500,Number(process.env.RUNLU_RC_LAB_CYCLES||250)));
const INVENTORY='runlu_carpet_inventory_v52',OPERATIONS='runlu_operations_log_v52',REGISTRY='runlu_carpet_rc_registry_v1';
const clone=x=>JSON.parse(JSON.stringify(x));
const must=(c,m)=>{if(!c)throw new Error(m)};
const wait=()=>new Promise(r=>setTimeout(r,0));

class FakeElement{
  constructor(doc,tag='div'){this.doc=doc;this.tagName=String(tag).toUpperCase();this.id='';this.dataset={};this.style={};this.hidden=false;this.disabled=false;this.value='';this.textContent='';this.className='';this.children=[];this.listeners={};this.attributes={};this.nextElementSibling=null;this.classList={contains:c=>String(this.className).split(/\s+/).includes(c),toggle:(c,on)=>{const xs=new Set(String(this.className).split(/\s+/).filter(Boolean));const yes=on==null?!xs.has(c):!!on;yes?xs.add(c):xs.delete(c);this.className=[...xs].join(' ');return yes}}}
  set innerHTML(v){this._html=String(v??'');this.doc.registerHtml(this._html)}
  get innerHTML(){return this._html||''}
  appendChild(x){this.children.push(x);this.doc.register(x);return x}
  prepend(x){this.children.unshift(x);this.doc.register(x);return x}
  insertAdjacentElement(_where,x){return this.appendChild(x)}
  addEventListener(type,fn){(this.listeners[type]||(this.listeners[type]=[])).push(fn)}
  async trigger(type='click'){for(const fn of this.listeners[type]||[])await fn({target:this,preventDefault(){},stopPropagation(){}})}
  querySelector(){return null}
  querySelectorAll(){return []}
  setAttribute(k,v){this.attributes[k]=String(v)}
  getAttribute(k){return this.attributes[k]??null}
}

function fakeDocument(){
  const ids=new Map();
  const doc={
    readyState:'loading',
    ids,
    listeners:{},
    documentElement:{dataset:{}},
    createElement(tag){return new FakeElement(doc,tag)},
    getElementById(id){return ids.get(String(id))||null},
    querySelector(sel){if(sel==='main')return doc.main;return null},
    querySelectorAll(){return[]},
    addEventListener(type,fn){(doc.listeners[type]||(doc.listeners[type]=[])).push(fn)},
    register(el){if(el?.id)ids.set(String(el.id),el);return el},
    registerHtml(html){
      const re=/<([a-zA-Z0-9]+)([^>]*?\sid=["']([^"']+)["'][^>]*)>/g;let m;
      while((m=re.exec(html))){const id=m[3];if(ids.has(id))continue;const el=new FakeElement(doc,m[1]);el.id=id;const val=/\svalue=["']([^"']*)["']/.exec(m[2]);if(val)el.value=val[1];ids.set(id,el)}
    }
  };
  doc.head=new FakeElement(doc,'head');doc.body=new FakeElement(doc,'body');doc.main=new FakeElement(doc,'main');
  const origHead=doc.head.appendChild.bind(doc.head);doc.head.appendChild=x=>{const y=origHead(x);doc.register(x);return y};
  return doc;
}

function initialRows(){
  return [
    {user_id:'LAB-USER',dataset_key:INVENTORY,record_id:'RC2350',payload:{roll:'RC2350',manufacturerRoll:'6112',po:'181516',collection:'Gentle Guardian',colour:'Quartz',lot:'987270',width:12,originalLength:123.75,length:100.5,location:'14C',status:'Active'},updated_at:'2026-09-14T10:00:00Z',deleted_at:null},
    {user_id:'LAB-USER',dataset_key:INVENTORY,record_id:'RC9999',payload:{roll:'RC9999',manufacturerRoll:'LAB-MILL-99',po:'LAB-PO-99',collection:'Synthetic Carpet',colour:'Blue',lot:'LAB-LOT',width:12,originalLength:90,length:90,location:'3A',status:'Active'},updated_at:'2026-09-14T11:00:00Z',deleted_at:null},
    {user_id:'LAB-USER',dataset_key:OPERATIONS,record_id:'OP-1',payload:{roll:'RC2350',type:'Carpet Cutting',completedAt:'2026-09-14T12:00:00Z'},updated_at:'2026-09-14T12:00:00Z',deleted_at:null},
    {user_id:'LAB-USER',dataset_key:OPERATIONS,record_id:'OP-2',payload:{roll:'RC2350',type:'Transfer',completedAt:'2026-09-14T13:00:00Z'},updated_at:'2026-09-14T13:00:00Z',deleted_at:null},
    {user_id:'LAB-USER',dataset_key:REGISTRY,record_id:'RC2350',payload:{rcNumber:'RC2350',status:'ASSIGNED',assignedByDepartment:'Finance',assignedAt:'2026-09-14',poNumber:'181516',manufacturerRoll:'6112',collection:'Gentle Guardian',colour:'Quartz',dyeLot:'987270',width:'12',originalLength:123.75,notes:'LAB existing registry',workflow:'COMPANY_SIMULATION_FINANCE_ASSIGNED',linkedInventoryRecordId:'RC2350',version:'0.3.92'},updated_at:'2026-09-14T09:00:00Z',deleted_at:null}
  ];
}

function fakeSupabase(){
  const state={rows:initialRows(),reads:[],writes:[],unexpected:[],session:{user:{id:'LAB-USER',email:'lab@invalid.example'}}};
  class Builder{
    constructor(table){this.table=table;this.filters=[];this.sort=null;this.max=500}
    select(cols){this.cols=cols;return this}
    eq(k,v){this.filters.push(['eq',k,v]);return this}
    is(k,v){this.filters.push(['is',k,v]);return this}
    order(k,o={}){this.sort=[k,!!o.ascending];return this}
    limit(n){this.max=Number(n)||500;return Promise.resolve(this.result())}
    result(){
      if(this.table!=='warehouse_records'){state.unexpected.push('select table '+this.table);return{data:null,error:new Error('LAB blocked table '+this.table)}}
      let rows=state.rows.filter(r=>this.filters.every(([op,k,v])=>op==='eq'?r[k]===v:(v==null?r[k]==null:r[k]===v)));
      if(this.sort){const[k,asc]=this.sort;rows=rows.slice().sort((a,b)=>String(a[k]||'').localeCompare(String(b[k]||''))*(asc?1:-1))}
      rows=rows.slice(0,this.max).map(r=>({record_id:r.record_id,payload:clone(r.payload),updated_at:r.updated_at}));
      state.reads.push({table:this.table,filters:clone(this.filters),count:rows.length});return{data:rows,error:null}
    }
  }
  const client={
    auth:{
      async getSession(){return{data:{session:state.session},error:null}},
      onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},
      async signInWithPassword(){return{data:{session:state.session},error:null}}
    },
    from(table){
      if(table!=='warehouse_records'){state.unexpected.push('from '+table);throw Error('LAB blocked table '+table)}
      const b=new Builder(table);
      b.insert=async row=>{
        const x=clone(row);state.writes.push(x);
        if(x.dataset_key!==REGISTRY)return{data:null,error:{message:'LAB blocked write outside RC registry'}};
        if(state.rows.some(r=>r.dataset_key===x.dataset_key&&r.record_id===x.record_id&&r.deleted_at==null))return{data:null,error:{code:'23505',message:'duplicate key value violates unique constraint'}};
        state.rows.push({...x,updated_at:new Date().toISOString(),deleted_at:null});return{data:[clone(x)],error:null}
      };
      return b;
    }
  };
  return{state,createClient(){return client}};
}

async function boot(){
  const doc=fakeDocument(),supabase=fakeSupabase();let externalLoads=0;
  class MutationObserver{observe(){}disconnect(){}}
  const win={document:doc,console,MutationObserver,supabase:{createClient:()=>supabase.createClient()},addEventListener(){},scrollTo(){},setTimeout,clearTimeout,setInterval,clearInterval};win.window=win;
  const box={window:win,document:doc,console,MutationObserver,setTimeout,clearTimeout,setInterval,clearInterval,Date,JSON,Math,Number,String,Array,Object,Boolean,RegExp,Error,TypeError,Promise,Map,Set};
  const originalAppend=doc.head.appendChild.bind(doc.head);doc.head.appendChild=el=>{if(el?.src)externalLoads++;return originalAppend(el)};
  vm.createContext(box,{name:'RUNLU RC Fake Supabase LAB'});vm.runInContext(source,box,{filename:'carpet-rc-tracking-v092.js',timeout:1500});
  const api=win.RUNLUCarpetRCTrackingV092;must(api&&typeof api.refresh==='function'&&typeof api.combined==='function','actual RC module API missing');
  await wait();await api.refresh(true);await wait();
  return{api,doc,supabase,externalLoads:()=>externalLoads};
}

async function save(e,values){
  for(const [id,v] of Object.entries(values)){const el=e.doc.getElementById(id);must(el,'missing form element '+id);el.value=String(v??'')}
  const btn=e.doc.getElementById('rc092save');must(btn,'save button missing');await btn.trigger('click');await wait();
}
function test(name,fn){return Promise.resolve().then(fn).then(detail=>({name,pass:true,...(detail||{})}),err=>({name,pass:false,error:err?.message||String(err)}))}

async function runScenarios(){
  const tests=[];
  tests.push(await test('Exact RC module loads with fake Supabase and no SDK/network load',async()=>{const e=await boot();must(e.api.version==='0.3.92','module version '+e.api.version);must(e.api.autoGenerateRC===false,'autoGenerateRC boundary changed');must(e.api.readOnlyInventory===true,'readOnlyInventory boundary changed');must(e.externalLoads()===0,'module attempted external SDK load');must(e.supabase.state.unexpected.length===0,'unexpected backend access');return{moduleVersion:e.api.version}}));
  tests.push(await test('Refresh reads only the three approved datasets',async()=>{const e=await boot(),sets=new Set(e.supabase.state.reads.map(x=>x.filters.find(f=>f[1]==='dataset_key')?.[2]).filter(Boolean));must(sets.has(INVENTORY)&&sets.has(OPERATIONS)&&sets.has(REGISTRY),'approved dataset read missing');must([...sets].every(x=>[INVENTORY,OPERATIONS,REGISTRY].includes(x)),'unexpected dataset read '+[...sets]);must(e.supabase.state.writes.length===0,'refresh wrote backend');return{datasets:[...sets]}}));
  tests.push(await test('Combined view links Finance RC to exact Carpet Inventory RC',async()=>{const e=await boot(),all=e.api.combined(),x=all.find(v=>v.rc==='RC2350');must(x&&x.registry&&x.inventory,'RC2350 did not link');must(x.inventory.payload.length===100.5,'physical length changed');const legacy=all.find(v=>v.rc==='RC9999');must(legacy&&legacy.inventory&&!legacy.registry,'unregistered inventory roll missing');return{combinedCount:all.length}}));
  tests.push(await test('Blank Finance RC is rejected without any backend write',async()=>{const e=await boot(),before=JSON.stringify(e.supabase.state.rows);await save(e,{rc092rc:'',rc092po:'X'});must(e.supabase.state.writes.length===0,'blank RC wrote backend');must(JSON.stringify(e.supabase.state.rows)===before,'blank RC mutated rows');return{safeReject:true}}));
  tests.push(await test('Duplicate Finance RC is rejected without overwrite',async()=>{const e=await boot(),before=JSON.stringify(e.supabase.state.rows);await save(e,{rc092rc:'rc2350',rc092po:'SHOULD-NOT-WRITE'});must(e.supabase.state.writes.length===0,'duplicate RC reached insert');must(JSON.stringify(e.supabase.state.rows)===before,'duplicate RC overwrote data');return{safeReject:true}}));
  tests.push(await test('New Finance RC insert writes registry only and auto-links exact inventory',async()=>{const e=await boot(),invBefore=JSON.stringify(e.supabase.state.rows.filter(r=>r.dataset_key===INVENTORY)),opsBefore=JSON.stringify(e.supabase.state.rows.filter(r=>r.dataset_key===OPERATIONS));await save(e,{rc092rc:'rc9999',rc092po:'LAB-PO-99',rc092mill:'LAB-MILL-99',rc092date:'2026-09-14',rc092collection:'Synthetic Carpet',rc092colour:'Blue',rc092lot:'LAB-LOT',rc092width:'12',rc092length:'90',rc092assignedBy:'Finance',rc092notes:'LAB registration'});must(e.supabase.state.writes.length===1,'expected one registry insert');const w=e.supabase.state.writes[0];must(w.dataset_key===REGISTRY&&w.record_id==='RC9999','wrong write target');must(w.payload.rcNumber==='RC9999'&&w.payload.assignedByDepartment==='Finance','Finance identity not preserved');must(w.payload.linkedInventoryRecordId==='RC9999','inventory exact-link id missing');must(JSON.stringify(e.supabase.state.rows.filter(r=>r.dataset_key===INVENTORY))===invBefore,'inventory mutated');must(JSON.stringify(e.supabase.state.rows.filter(r=>r.dataset_key===OPERATIONS))===opsBefore,'operations mutated');const x=e.api.combined().find(v=>v.rc==='RC9999');must(x&&x.registry&&x.inventory,'new RC did not link after refresh');return{writeDataset:w.dataset_key,linked:true}}));
  return{pass:tests.every(x=>x.pass),passed:tests.filter(x=>x.pass).length,failed:tests.filter(x=>!x.pass).length,tests};
}

async function runStress(n){
  const e=await boot(),inventoryBefore=JSON.stringify(e.supabase.state.rows.filter(r=>r.dataset_key===INVENTORY)),operationsBefore=JSON.stringify(e.supabase.state.rows.filter(r=>r.dataset_key===OPERATIONS));let failure=null;
  for(let i=0;i<n;i++){
    const rc='LABRC'+String(i+1).padStart(5,'0');
    try{await save(e,{rc092rc:rc,rc092po:'LAB-PO-'+i,rc092mill:'MILL-'+i,rc092date:'2026-09-14',rc092collection:'Synthetic Stress Carpet',rc092colour:i%2?'Quartz':'Blue',rc092lot:'LOT-'+(i%7),rc092width:'12',rc092length:String(80+(i%40)),rc092assignedBy:'Finance',rc092notes:'stress '+i});const w=e.supabase.state.writes.at(-1);must(w&&w.dataset_key===REGISTRY&&w.record_id===rc,'registry write mismatch '+i);must(w.payload.rcNumber===rc,'RC normalized incorrectly '+i);must(w.payload.assignedByDepartment==='Finance','Finance source changed '+i)}catch(err){failure={cycle:i,rc,error:err?.message||String(err)};break}
  }
  try{must(JSON.stringify(e.supabase.state.rows.filter(r=>r.dataset_key===INVENTORY))===inventoryBefore,'stress mutated inventory');must(JSON.stringify(e.supabase.state.rows.filter(r=>r.dataset_key===OPERATIONS))===operationsBefore,'stress mutated operations');must(e.supabase.state.writes.every(w=>w.dataset_key===REGISTRY),'stress wrote non-registry dataset');must(e.supabase.state.unexpected.length===0,'unexpected backend access: '+e.supabase.state.unexpected.join(','));must(e.externalLoads()===0,'external SDK/network load attempted')}catch(err){failure=failure||{cycle:n,error:err?.message||String(err)}}
  return{pass:!failure,cyclesRequested:n,cyclesCompleted:failure?Math.min(failure.cycle,n):n,registryWrites:e.supabase.state.writes.length,failure,unexpectedBackendAccess:e.supabase.state.unexpected};
}

const scenarios=await runScenarios(),stress=await runStress(cycles);
const report={schema:'runlu.flooring.rc-fake-supabase-lab.v1',version:'0.3.0',environment:'NODE_VM_EXACT_RC_MODULE_FAKE_SUPABASE',generatedAt:new Date().toISOString(),actualModule:'flooring/carpet-rc-tracking-v092.js',actualModuleSha256:sourceSha256,pass:scenarios.pass&&stress.pass,scenarios,stress,isolation:{realSupabaseAccess:false,realAuthAccess:false,networkSdkLoadAllowed:false,backend:'in-memory fake Supabase',writeAllowlist:[REGISTRY],readAllowlist:[INVENTORY,OPERATIONS,REGISTRY]},boundaries:['Executes the exact repository Carpet RC Tracking V0.3.92 source.','The fake Supabase implements only the query/auth methods this module is allowed to use and fails closed on other tables.','This proves module behavior against the fake transport; it does not modify or certify live Supabase data.']};
fs.writeFileSync('flooring-rc-supabase-lab-report.json',JSON.stringify(report,null,2));
console.log(`${scenarios.pass?'PASS':'FAIL'} · RC fake Supabase scenarios · ${scenarios.passed}/${scenarios.tests.length}`);console.log(`${stress.pass?'PASS':'FAIL'} · RC registry stress · ${stress.cyclesCompleted}/${stress.cyclesRequested} Finance RC assignments`);console.log(`Actual module SHA-256 · ${sourceSha256}`);console.log('Isolation · in-memory fake Supabase · real backend/network access: NONE');if(!report.pass){for(const x of scenarios.tests.filter(x=>!x.pass))console.error(x.name+': '+x.error);if(stress.failure)console.error(stress.failure);process.exit(1)}console.log('RC FAKE SUPABASE LAB: PASS');