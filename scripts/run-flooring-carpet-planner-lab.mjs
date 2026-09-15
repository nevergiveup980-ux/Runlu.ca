import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const MODULE_URL=new URL('../flooring/carpet-line-rc-v093.js',import.meta.url);
const source=fs.readFileSync(MODULE_URL,'utf8');
const sourceSha256=crypto.createHash('sha256').update(source).digest('hex');
const cycles=Math.max(250,Number(process.env.RUNLU_PLANNER_CYCLES||3000));

const JOBS_STORE='runlu_deerfoot_flooring_jobs_v1';
const ACTIVE_STORE='runlu_deerfoot_flooring_active_job_v1';
const DRAFT_PREFIX='runlu_carpet_line_rc_draft_v093:';
const must=(c,m)=>{if(!c)throw new Error(m)};

function memoryStorage(){
  const map=new Map(),writes=[];
  return {
    getItem(k){k=String(k);return map.has(k)?map.get(k):null},
    setItem(k,v){k=String(k);writes.push(k);map.set(k,String(v))},
    removeItem(k){k=String(k);writes.push(k);map.delete(k)},
    clear(){map.clear();writes.length=0},
    seed(k,v){map.set(String(k),typeof v==='string'?v:JSON.stringify(v))},
    raw(k){return map.has(String(k))?map.get(String(k)):null},
    json(k,f=null){try{const v=JSON.parse(this.raw(k)||'null');return v==null?f:v}catch{return f}},
    snapshot(){return Object.fromEntries([...map.entries()].sort((a,b)=>a[0].localeCompare(b[0])))},
    writes(){return writes.slice()},
    clearWrites(){writes.length=0}
  };
}

class FakeElement{
  constructor(tag,doc){this.tagName=String(tag||'div').toUpperCase();this.doc=doc;this.children=[];this.parentNode=null;this.style={};this.dataset={};this.listeners={};this.attributes={};this._id='';this.className='';this.value='';this.textContent='';this._innerHTML=''}
  set id(v){this._id=String(v||'');this.doc?.register(this)}
  get id(){return this._id}
  set innerHTML(v){
    this._innerHTML=String(v??'');
    if(String(this.className).split(/\s+/).includes('rc093strip')){
      const rc=new FakeElement('input',this.doc);rc.dataset.rc093='rc';
      const cuts=new FakeElement('input',this.doc);cuts.dataset.rc093='cuts';
      const tag=new FakeElement('span',this.doc);tag.className='rc093tag';
      const facts=new FakeElement('div',this.doc);facts.className='rc093facts';
      const plan=new FakeElement('div',this.doc);plan.className='rc093plan';
      this.children=[rc,cuts,tag,facts,plan];
      for(const x of this.children){x.parentNode=this;this.doc?.register(x)}
    }
  }
  get innerHTML(){return this._innerHTML}
  get options(){return this.tagName==='DATALIST'?Array.from({length:(this._innerHTML.match(/<option\b/g)||[]).length}):[]}
  get classList(){const self=this;return{contains(c){return String(self.className).split(/\s+/).includes(c)},toggle(c,on){const s=new Set(String(self.className).split(/\s+/).filter(Boolean));const next=on===undefined?!s.has(c):!!on;next?s.add(c):s.delete(c);self.className=[...s].join(' ');return next},add(c){if(!this.contains(c))self.className=(self.className+' '+c).trim()}}}
  appendChild(x){if(!x)return x;x.parentNode=this;this.children.push(x);this.doc?.register(x);return x}
  prepend(x){if(!x)return x;x.parentNode=this;this.children.unshift(x);this.doc?.register(x);return x}
  querySelector(sel){
    const match=e=>sel==='.rc093strip'?e.classList.contains('rc093strip'):sel==='.rc093tag'?e.classList.contains('rc093tag'):sel==='.rc093facts'?e.classList.contains('rc093facts'):sel==='.rc093plan'?e.classList.contains('rc093plan'):sel==='[data-rc093="rc"]'?e.dataset?.rc093==='rc':sel==='[data-rc093="cuts"]'?e.dataset?.rc093==='cuts':false;
    const walk=e=>{for(const c of e.children){if(match(c))return c;const r=walk(c);if(r)return r}return null};return walk(this)
  }
  querySelectorAll(sel){if(sel===':scope > .itemRow')return this.children.filter(x=>x.classList.contains('itemRow'));const out=[];const walk=e=>{for(const c of e.children){if(sel==='.rc093strip'&&c.classList.contains('rc093strip'))out.push(c);walk(c)}};walk(this);return out}
  addEventListener(type,fn){(this.listeners[type]||(this.listeners[type]=[])).push(fn)}
  dispatch(type){for(const fn of this.listeners[type]||[])fn({type,target:this})}
  setAttribute(k,v){this.attributes[String(k)]=String(v)}
  getAttribute(k){return Object.prototype.hasOwnProperty.call(this.attributes,String(k))?this.attributes[String(k)]:null}
  closest(){return null}
}

function fakeDocument(){
  const doc={readyState:'complete',all:new Set(),ids:new Map(),listeners:{},register(e){if(!e)return;e.doc=this;this.all.add(e);if(e.id)this.ids.set(e.id,e);for(const c of e.children||[])this.register(c)},getElementById(id){return this.ids.get(String(id))||null},createElement(tag){return new FakeElement(tag,this)},querySelectorAll(sel){if(sel==='.rc093strip')return [...this.all].filter(x=>x.classList?.contains('rc093strip'));return[]},addEventListener(type,fn){(this.listeners[type]||(this.listeners[type]=[])).push(fn)}};
  doc.head=new FakeElement('head',doc);doc.body=new FakeElement('body',doc);doc.register(doc.head);doc.register(doc.body);
  const editor=new FakeElement('div',doc);editor.id='itemsEditor';const row=new FakeElement('div',doc);row.className='itemRow';editor.appendChild(row);doc.body.appendChild(editor);
  return{doc,editor,row};
}

function syntheticRolls(){
  const inv=(rc,length,width='12',extra={})=>({record_id:rc,payload:{roll:rc,length,originalLength:100,width,location:'2A',collection:'LAB Carpet',colour:'Quartz',lot:'LAB-LOT',manufacturerRoll:'M-'+rc,po:'PO-'+rc,status:'Active',...extra}});
  const reg=(rc,extra={})=>({record_id:rc,payload:{rcNumber:rc,status:'ASSIGNED',assignedAt:'2026-09-15',collection:'LAB Carpet',colour:'Quartz',dyeLot:'LAB-LOT',width:'12',originalLength:100,...extra}});
  return [
    {rc:'RC100',inventory:inv('RC100',50),registry:reg('RC100'),source:'registry'},
    {rc:'RC200',inventory:null,registry:reg('RC200',{manufacturerRoll:'M-RC200',poNumber:'PO-RC200'}),source:'registry'},
    {rc:'RC300',inventory:inv('RC300',30),registry:reg('RC300'),source:'registry'},
    {rc:'RC400',inventory:inv('RC400',40,'10'),registry:reg('RC400',{width:'10'}),source:'registry'}
  ];
}

function boot({saveMode='ok'}={}){
  const localStorage=memoryStorage(),sessionStorage=memoryStorage(),{doc:document,row}=fakeDocument(),rolls=syntheticRolls();
  localStorage.seed(ACTIVE_STORE,'LAB-JOB');
  localStorage.seed(JOBS_STORE,[{id:'LAB-JOB',jobNumber:'LAB-1001',items:[{style:'LAB Carpet',colour:'Quartz',qty:'40 LF'}]}]);
  const physicalBefore=JSON.stringify(rolls);
  let networkCalls=0,alerts=0;
  const quiet={log(){},info(){},warn(){},error(){},debug(){}};
  class MutationObserver{observe(){}disconnect(){}}
  const blocked=n=>function(){networkCalls++;throw new Error('LAB blocked network API: '+n)};
  const window={document,localStorage,sessionStorage,console:quiet,MutationObserver,scrollTo(){},addEventListener(){},setTimeout(fn){if(typeof fn==='function')fn();return 1},clearTimeout(){},setInterval(){return 1},clearInterval(){},RUNLUCarpetRCTrackingV092:{combined(){return rolls},async refresh(){return true}}};
  window.window=window;
  window.editItem=(i,k,v)=>{const jobs=localStorage.json(JOBS_STORE,[]),job=jobs.find(x=>x.id==='LAB-JOB');if(!job||!job.items?.[i])throw new Error('LAB editItem missing row');job.items[i][k]=v;localStorage.setItem(JOBS_STORE,JSON.stringify(jobs))};
  window.removeItem=()=>true;window.addItem=()=>true;window.loadEditor=()=>true;
  window.saveJob=saveMode==='throw'?()=>{throw new Error('LAB simulated save failure')}:()=>true;
  const sandbox={window,document,localStorage,sessionStorage,console:quiet,MutationObserver,setTimeout:window.setTimeout,clearTimeout:window.clearTimeout,setInterval:window.setInterval,clearInterval:window.clearInterval,alert(){alerts++},fetch:blocked('fetch'),XMLHttpRequest:class{constructor(){networkCalls++;throw new Error('LAB blocked XMLHttpRequest')}},WebSocket:class{constructor(){networkCalls++;throw new Error('LAB blocked WebSocket')}},EventSource:class{constructor(){networkCalls++;throw new Error('LAB blocked EventSource')}},URL,URLSearchParams,Date,JSON,Math,Number,String,Array,Object,Boolean,RegExp,Error,TypeError,Promise,Map,Set};
  vm.createContext(sandbox,{name:'RUNLU Carpet Planner LAB'});vm.runInContext(source,sandbox,{filename:'carpet-line-rc-v093.js',timeout:1000});
  const api=window.RUNLUCarpetLineRCV093;must(api&&typeof api.parseCuts==='function'&&typeof api.planning==='function','actual V093 API missing');
  const strip=row.querySelector('.rc093strip');must(strip,'actual V093 did not decorate Job line');
  const rcInput=strip.querySelector('[data-rc093="rc"]'),cutsInput=strip.querySelector('[data-rc093="cuts"]'),tag=strip.querySelector('.rc093tag'),plan=strip.querySelector('.rc093plan');
  must(rcInput&&cutsInput&&tag&&plan,'actual V093 planner controls missing');
  return{api,window,document,row,strip,rcInput,cutsInput,tag,plan,rolls,physicalBefore,localStorage,sessionStorage,network:()=>networkCalls,alerts:()=>alerts};
}

function setField(e,field,value){const input=field==='rc'?e.rcInput:e.cutsInput;input.value=value;input.dispatch('input')}
function physicalUnchanged(e){return JSON.stringify(e.rolls)===e.physicalBefore}
function allowedWrites(e){const lw=e.localStorage.writes(),sw=e.sessionStorage.writes();return lw.every(k=>k===JOBS_STORE)&&sw.every(k=>k.startsWith(DRAFT_PREFIX))}
function check(name,fn){try{return{name,pass:true,...(fn()||{})}}catch(e){return{name,pass:false,error:e.message||String(e)}}}

function scenarios(){
  const t=[];
  t.push(check('Actual V093 loads and declares 3-inch read-only planning contract',()=>{const e=boot();must(e.api.version==='0.3.93','version '+e.api.version);must(e.api.cutAllowanceFeet===0.25,'cut allowance is not 0.25 ft');must(e.api.readOnlyInventory===true,'read-only inventory contract missing');must(e.network()===0,'network attempted');return{moduleVersion:e.api.version,cutAllowanceFeet:e.api.cutAllowanceFeet}}));
  t.push(check('Parser accepts feet/inches and width x length notation',()=>{const e=boot(),cuts=e.api.parseCuts("12x24′9″, 12x17′");must(cuts.length===2,'expected 2 cuts');must(Math.abs(cuts[0].width-12)<1e-9&&Math.abs(cuts[0].length-24.75)<1e-9,'first cut parse');must(Math.abs(cuts[1].length-17)<1e-9,'second cut parse');return{cuts}}));
  t.push(check('Two cuts include exactly two 3-inch allowances',()=>{const e=boot(),cuts=e.api.parseCuts("12x20',12x10'"),p=e.api.planning({current:50,width:12,widthText:'12'},cuts);must(p.label==='ENOUGH','expected ENOUGH');must(Math.abs(p.required-30.5)<1e-9,'required should be 30.5');must(Math.abs(p.remaining-19.5)<1e-9,'remaining should be 19.5');return{required:p.required,remaining:p.remaining}}));
  t.push(check('Exact edge uses entire roll without false shortage',()=>{const e=boot(),cuts=e.api.parseCuts("12x20',12x10'"),p=e.api.planning({current:30.5,width:12,widthText:'12'},cuts);must(p.label==='ENOUGH','exact edge should be ENOUGH');must(Math.abs(p.remaining)<1e-9,'remaining not zero');return{remaining:p.remaining}}));
  t.push(check('Short roll reports shortage after allowance',()=>{const e=boot(),cuts=e.api.parseCuts("12x20',12x10'"),p=e.api.planning({current:30,width:12,widthText:'12'},cuts);must(p.kind==='bad'&&String(p.label).startsWith('SHORT'),'shortage not detected');must(Math.abs(p.remaining+0.5)<1e-9,'shortage should be 0.5 ft');return{label:p.label,remaining:p.remaining}}));
  t.push(check('Width overrun is rejected before length approval',()=>{const e=boot(),cuts=e.api.parseCuts("13x10'"),p=e.api.planning({current:100,width:12,widthText:'12'},cuts);must(p.label==='WIDTH CHECK','width check missing');return{label:p.label}}));
  t.push(check('Missing physical length stays advisory',()=>{const e=boot(),cuts=e.api.parseCuts("12x10'"),p=e.api.planning({current:null,width:12,widthText:'12'},cuts);must(p.label==='LENGTH NOT AVAILABLE','missing length status wrong');return{label:p.label}}));
  t.push(check('Known RC + planned cuts write Job/draft only, never physical roll',()=>{const e=boot();e.localStorage.clearWrites();e.sessionStorage.clearWrites();setField(e,'rc','RC100');setField(e,'cuts',"12x20', 12x10'");const job=e.localStorage.json(JOBS_STORE,[])[0];must(job.items[0].rcNumber==='RC100','RC not mirrored to Job line');must(job.items[0].plannedCuts==="12x20', 12x10'",'planned cuts not mirrored');must(e.tag.textContent==='ENOUGH','UI planner not ENOUGH');must(physicalUnchanged(e),'physical inventory object mutated');must(allowedWrites(e),'unexpected storage write');must(e.network()===0,'network attempted');return{tag:e.tag.textContent,localWrites:e.localStorage.writes(),sessionWrites:e.sessionStorage.writes()}}));
  t.push(check('Unknown RC never mutates inventory and reports not found',()=>{const e=boot();e.localStorage.clearWrites();e.sessionStorage.clearWrites();setField(e,'rc','RC-NOT-THERE');setField(e,'cuts',"12x5'");must(e.tag.textContent==='RC NOT FOUND','unknown RC status wrong');must(physicalUnchanged(e),'physical inventory mutated');must(allowedWrites(e),'unexpected write');return{tag:e.tag.textContent}}));
  t.push(check('Finance RC without inventory reports Awaiting Receiving',()=>{const e=boot();setField(e,'rc','RC200');must(e.tag.textContent==='AWAITING RECEIVING','awaiting status wrong');must(physicalUnchanged(e),'physical inventory mutated');return{tag:e.tag.textContent}}));
  t.push(check('Narrow physical roll catches planned width mismatch',()=>{const e=boot();setField(e,'rc','RC400');setField(e,'cuts',"12x10'");must(e.tag.textContent==='WIDTH CHECK','UI width mismatch not caught');must(physicalUnchanged(e),'physical inventory mutated');return{tag:e.tag.textContent}}));
  t.push(check('Successful Job save clears only planner draft after Job fields mirrored',()=>{const e=boot();setField(e,'rc','RC100');setField(e,'cuts',"12x8'");const dk=DRAFT_PREFIX+'LAB-JOB';must(e.sessionStorage.raw(dk)!=null,'draft not created');e.localStorage.clearWrites();e.sessionStorage.clearWrites();must(e.window.saveJob()===true,'base save result changed');must(e.sessionStorage.raw(dk)===null,'planner draft not cleared after successful save');must(physicalUnchanged(e),'physical inventory mutated by save wrapper');must(e.sessionStorage.writes().every(k=>k===dk),'unexpected session write');return{draftCleared:true}}));
  t.push(check('Thrown base save failure preserves planner draft and physical roll',()=>{const e=boot({saveMode:'throw'});setField(e,'rc','RC100');setField(e,'cuts',"12x8'");const dk=DRAFT_PREFIX+'LAB-JOB',before=e.sessionStorage.raw(dk);let threw=false;try{e.window.saveJob()}catch{threw=true}must(threw,'simulated save failure did not throw');must(e.sessionStorage.raw(dk)===before,'draft cleared after failed save');must(physicalUnchanged(e),'physical inventory mutated on failed save');return{draftPreserved:true}}));
  return{pass:t.every(x=>x.pass),passed:t.filter(x=>x.pass).length,failed:t.filter(x=>!x.pass).length,tests:t};
}

function stress(n){
  const e=boot();e.localStorage.clearWrites();e.sessionStorage.clearWrites();let failure=null;
  for(let i=0;i<n;i++){
    try{
      const rc=i%11===0?'RC-NOT-THERE':i%7===0?'RC200':i%5===0?'RC400':i%3===0?'RC300':'RC100';
      const a=5+(i%19),b=3+(i%13),width=i%17===0?13:12,cuts=`${width}x${a}', 12x${b}'`;
      setField(e,'rc',rc);setField(e,'cuts',cuts);
      must(physicalUnchanged(e),'physical inventory changed at cycle '+i);
      must(allowedWrites(e),'unexpected storage write at cycle '+i);
      must(e.network()===0,'network attempted at cycle '+i);
      if(rc==='RC-NOT-THERE')must(e.tag.textContent==='RC NOT FOUND','unknown RC invariant '+i);
      if(rc==='RC200')must(e.tag.textContent==='AWAITING RECEIVING','awaiting invariant '+i);
      if(rc==='RC400'&&width===13)must(e.tag.textContent==='WIDTH CHECK','width invariant '+i);
    }catch(err){failure={cycle:i,error:err.message||String(err),tag:e.tag.textContent,localWrites:e.localStorage.writes().slice(-10),sessionWrites:e.sessionStorage.writes().slice(-10)};break}
  }
  const job=e.localStorage.json(JOBS_STORE,[])[0];
  return{pass:!failure,cyclesRequested:n,cyclesCompleted:failure?failure.cycle:n,failure,networkCalls:e.network(),finalJobLine:job?.items?.[0]||null,physicalInventoryUnchanged:physicalUnchanged(e)};
}

const s=scenarios(),st=stress(cycles);
const report={schema:'runlu.flooring.carpet-planner-lab.v1',version:'0.4.0',environment:'NODE_VM_ACTUAL_V093_WITH_SYNTHETIC_RC_DATA_AND_MINI_DOM',generatedAt:new Date().toISOString(),actualModule:'flooring/carpet-line-rc-v093.js',actualModuleSha256:sourceSha256,actualModuleVersion:s.tests[0]?.moduleVersion||null,pass:s.pass&&st.pass,scenarios:s,stress:st,isolation:{productionSupabaseAccess:false,networkApisBlocked:true,hostLocalStorageAccess:false,hostSessionStorageAccess:false,physicalInventoryRepresentation:'synthetic in-memory RC entries',allowedWrites:['runlu_deerfoot_flooring_jobs_v1','runlu_carpet_line_rc_draft_v093:<job-id>'],forbiddenBusinessMutations:['Carpet Inventory','Finance RC Registry','Cut History','Receiving','Transfer','Shipping','PO']},contracts:['Planning executes the exact repository V0.3.93 parser/planner and real Job-line input handlers.','Each parsed planned cut adds 0.25 ft / 3 inches allowance.','Planner edits may mirror RC Number and Planned Cuts to the synthetic Job line and session draft only.','Selecting/changing RC or planned cuts must never reserve, deduct, relocate, receive, transfer, ship, cut, or otherwise mutate physical carpet inventory.','This LAB is isolated module-path verification, not browser end-to-end certification.']};
fs.writeFileSync('flooring-carpet-planner-lab-report.json',JSON.stringify(report,null,2));
console.log(`${s.pass?'PASS':'FAIL'} · Actual V093 planner scenarios · ${s.passed}/${s.tests.length}`);
console.log(`${st.pass?'PASS':'FAIL'} · Actual V093 planner stress · ${st.cyclesCompleted}/${st.cyclesRequested} edit cycles`);
console.log(`Module SHA-256 · ${sourceSha256}`);
console.log('Isolation · synthetic RC data + memory-only Job/session stores · network blocked · production Supabase access: NONE');
if(!report.pass){console.error('CARPET PLANNER LAB: FAIL');for(const x of s.tests.filter(x=>!x.pass))console.error(x.name+': '+x.error);if(st.failure)console.error(st.failure);process.exit(1)}
console.log('CARPET PLANNER LAB: PASS');