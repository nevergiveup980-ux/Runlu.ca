(()=>{
'use strict';

const VERSION='2.1';

function clone(x){return JSON.parse(JSON.stringify(x))}
function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
function round2(v){return Math.round((n(v)+Number.EPSILON)*100)/100}
function id(){return `${Date.now()}-${Math.random().toString(36).slice(2,9)}`}

function isAdjustment(e){return Number.isFinite(Number(e?.adjustmentDelta))}
function effectAmount(e){
  if(!e)return 0;
  return round2(isAdjustment(e)?Number(e.adjustmentDelta):Math.abs(n(e.amount)));
}
function cashEffect(e){
  const effect=effectAmount(e);
  if(e?.type==='Income')return effect;
  if(e?.type==='Expense')return -effect;
  return 0;
}

function totals(entries,prefix=''){
  let income=0,expense=0;
  (entries||[]).forEach(e=>{
    if(prefix && !String(e.date||'').startsWith(prefix))return;
    const effect=effectAmount(e);
    if(e.type==='Income')income+=effect;
    else if(e.type==='Expense')expense+=effect;
  });
  income=round2(income);expense=round2(expense);
  return {income,expense,balance:round2(income-expense)};
}

function itemTotal(entries,{item,year,month}){
  const prefix=`${year}-${String(month).padStart(2,'0')}`;
  return round2((entries||[]).filter(e=>e.item===item&&String(e.date||'').startsWith(prefix)).reduce((s,e)=>s+effectAmount(e),0));
}

function categoryTotals(entries,prefix=''){
  const out={};
  (entries||[]).forEach(e=>{
    if(prefix && !String(e.date||'').startsWith(prefix))return;
    if(e.type!=='Expense')return;
    const k=e.category||'Other';
    out[k]=round2((out[k]||0)+effectAmount(e));
  });
  return out;
}

function addNormal(entries,input){
  const amount=Math.abs(round2(input.amount));
  if(!amount)throw new Error('Amount must be greater than zero.');
  const rec={
    id:input.id||id(),date:input.date,type:input.type,item:input.item,
    category:input.category||'Other',account:input.account||'',amount,
    note:input.note||'',source:input.source||'Entry'
  };
  return {entries:[...entries,rec],record:rec,undo:{removeIds:[rec.id]}};
}

function adjustVisibleTotal(entries,input){
  const current=itemTotal(entries,input);
  const target=Math.max(0,round2(input.target));
  const delta=round2(target-current);
  if(Math.abs(delta)<0.005)return {entries:[...entries],record:null,undo:null,current,target,delta:0};
  const rec={
    id:input.id||id(),date:input.date,type:input.type,item:input.item,
    category:input.category||'Other',account:input.account||'',amount:Math.abs(delta),
    adjustmentDelta:delta,note:input.note||`Set visible total to ${target.toFixed(2)}`,
    source:'Sheet adjustment'
  };
  return {entries:[...entries,rec],record:rec,undo:{removeIds:[rec.id]},current,target,delta};
}

function clearVisibleTotal(entries,input){
  const current=itemTotal(entries,input);
  if(Math.abs(current)<0.005)return {entries:[...entries],record:null,undo:null,current,delta:0};
  const delta=round2(-current);
  const rec={
    id:input.id||id(),date:input.date,type:input.type,item:input.item,
    category:input.category||'Other',account:input.account||'',amount:Math.abs(delta),
    adjustmentDelta:delta,note:input.note||'Clear visible total',source:'Sheet reversal'
  };
  return {entries:[...entries,rec],record:rec,undo:{removeIds:[rec.id]},current,delta};
}

function undo(entries,token){
  if(!token?.removeIds?.length)return [...entries];
  const ids=new Set(token.removeIds.map(String));
  return entries.filter(e=>!ids.has(String(e.id)));
}

function weekBucket(date){
  const d=Number(String(date||'').slice(8,10));
  if(!d)return '';
  return `W${Math.min(5,Math.floor((d-1)/7)+1)}`;
}

function recurringPresentation(entries,{item,year,month}){
  const prefix=`${year}-${String(month).padStart(2,'0')}`;
  const rows=(entries||[]).filter(e=>e.item===item&&String(e.date||'').startsWith(prefix));
  const weeks={W1:0,W2:0,W3:0,W4:0,W5:0};
  rows.forEach(e=>{const w=weekBucket(e.date);if(w)weeks[w]=round2(weeks[w]+effectAmount(e))});
  return {runningTotal:round2(rows.reduce((s,e)=>s+effectAmount(e),0)),weeks};
}

function validate(entries){
  const issues=[];const ids=new Set;
  (entries||[]).forEach((e,i)=>{
    if(!e||typeof e!=='object')return issues.push({index:i,issue:'not-object'});
    if(!e.id)issues.push({index:i,issue:'missing-id'});else if(ids.has(String(e.id)))issues.push({index:i,issue:'duplicate-id'});else ids.add(String(e.id));
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(e.date||'')))issues.push({index:i,issue:'invalid-date'});
    if(!['Income','Expense','Transfer'].includes(e.type))issues.push({index:i,issue:'invalid-type'});
    if(!e.item)issues.push({index:i,issue:'missing-item'});
    if(!Number.isFinite(Number(e.amount)))issues.push({index:i,issue:'invalid-amount'});
    if(isAdjustment(e)&&!Number.isFinite(Number(e.adjustmentDelta)))issues.push({index:i,issue:'invalid-adjustment'});
  });
  return issues;
}

function exportCanonical(entries){return clone(entries)}

window.RUNLU_LEDGER_CORE={VERSION,effectAmount,cashEffect,totals,itemTotal,categoryTotals,addNormal,adjustVisibleTotal,clearVisibleTotal,undo,weekBucket,recurringPresentation,validate,exportCanonical,round2};
})();