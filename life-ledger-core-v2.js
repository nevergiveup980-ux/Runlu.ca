(()=>{
'use strict';

const VERSION='2.3';

function clone(x){return JSON.parse(JSON.stringify(x))}
function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
function round2(v){return Math.round((n(v)+Number.EPSILON)*100)/100}
function id(){return `${Date.now()}-${Math.random().toString(36).slice(2,9)}`}
function validWeek(v){return /^W[1-5]$/.test(String(v||''))?String(v):''}
function weekBucket(date){const d=Number(String(date||'').slice(8,10));if(!d)return '';return `W${Math.min(5,Math.floor((d-1)/7)+1)}`}
function dateForWeek(year,month,week){const w=Number(String(week).slice(1));const day=w===5?29:(w-1)*7+3;return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`}
function normalizeWeekDate(date,year,month,week){const w=validWeek(week);if(!w)return date;if(weekBucket(date)===w)return date;return dateForWeek(year,month,w)}

function isAdjustment(e){return Number.isFinite(Number(e?.adjustmentDelta))}
function effectAmount(e){if(!e)return 0;return round2(isAdjustment(e)?Number(e.adjustmentDelta):Math.abs(n(e.amount)))}
function cashEffect(e){const effect=effectAmount(e);if(e?.type==='Income')return effect;if(e?.type==='Expense')return -effect;return 0}

function totals(entries,prefix=''){
  let income=0,expense=0;(entries||[]).forEach(e=>{if(prefix&&!String(e.date||'').startsWith(prefix))return;const effect=effectAmount(e);if(e.type==='Income')income+=effect;else if(e.type==='Expense')expense+=effect});income=round2(income);expense=round2(expense);return{income,expense,balance:round2(income-expense)}
}
function itemTotal(entries,{item,year,month,week=''}){const prefix=`${year}-${String(month).padStart(2,'0')}`,w=validWeek(week);return round2((entries||[]).filter(e=>e.item===item&&String(e.date||'').startsWith(prefix)&&(!w||weekBucket(e.date)===w)).reduce((s,e)=>s+effectAmount(e),0))}
function categoryTotals(entries,prefix=''){const out={};(entries||[]).forEach(e=>{if(prefix&&!String(e.date||'').startsWith(prefix))return;if(e.type!=='Expense')return;const k=e.category||'Other';out[k]=round2((out[k]||0)+effectAmount(e))});return out}

function addNormal(entries,input){
  const amount=Math.abs(round2(input.amount));if(!amount)throw new Error('Amount must be greater than zero.');if(!String(input.item||'').trim())throw new Error('Item is required.');
  let date=input.date;const noteWeek=String(input.source||'').includes('Sheet')?validWeek(input.week||input.note):validWeek(input.week);if(noteWeek){const y=Number(String(date||'').slice(0,4)),m=Number(String(date||'').slice(5,7));if(y&&m)date=normalizeWeekDate(date,y,m,noteWeek)}
  const rec={id:input.id||id(),date,type:input.type,item:String(input.item).trim(),category:input.category||'Other',account:input.account||'',amount,note:input.note||'',source:input.source||'Entry'};
  return{entries:[...entries,rec],record:rec,undo:{removeIds:[rec.id]}}
}
function adjustVisibleTotal(entries,input){
  const week=validWeek(input.week),current=itemTotal(entries,{...input,week}),target=Math.max(0,round2(input.target)),delta=round2(target-current);if(Math.abs(delta)<0.005)return{entries:[...entries],record:null,undo:null,current,target,delta:0};
  const date=normalizeWeekDate(input.date,input.year,input.month,week);const rec={id:input.id||id(),date,type:input.type,item:input.item,category:input.category||'Other',account:input.account||'',amount:Math.abs(delta),adjustmentDelta:delta,note:input.note||`Set visible total${week?` ${week}`:''} to ${target.toFixed(2)}`,source:week?'Sheet week adjustment':'Sheet adjustment'};return{entries:[...entries,rec],record:rec,undo:{removeIds:[rec.id]},current,target,delta,week}
}
function clearVisibleTotal(entries,input){
  const week=validWeek(input.week),current=itemTotal(entries,{...input,week});if(Math.abs(current)<0.005)return{entries:[...entries],record:null,undo:null,current,delta:0};const delta=round2(-current),date=normalizeWeekDate(input.date,input.year,input.month,week);const rec={id:input.id||id(),date,type:input.type,item:input.item,category:input.category||'Other',account:input.account||'',amount:Math.abs(delta),adjustmentDelta:delta,note:input.note||`Clear visible total${week?` ${week}`:''}`,source:week?'Sheet week reversal':'Sheet reversal'};return{entries:[...entries,rec],record:rec,undo:{removeIds:[rec.id]},current,delta,week}
}
function undo(entries,token){if(!token?.removeIds?.length)return[...entries];const ids=new Set(token.removeIds.map(String));return entries.filter(e=>!ids.has(String(e.id))}
function recurringPresentation(entries,{item,year,month}){const prefix=`${year}-${String(month).padStart(2,'0')}`,rows=(entries||[]).filter(e=>e.item===item&&String(e.date||'').startsWith(prefix)),weeks={W1:0,W2:0,W3:0,W4:0,W5:0};rows.forEach(e=>{const w=weekBucket(e.date);if(w)weeks[w]=round2(weeks[w]+effectAmount(e))});return{runningTotal:round2(rows.reduce((s,e)=>s+effectAmount(e),0)),weeks}}
function validate(entries){const issues=[],ids=new Set;(entries||[]).forEach((e,i)=>{if(!e||typeof e!=='object')return issues.push({index:i,issue:'not-object'});if(!e.id)issues.push({index:i,issue:'missing-id'});else if(ids.has(String(e.id)))issues.push({index:i,issue:'duplicate-id'});else ids.add(String(e.id));if(!/^\d{4}-\d{2}-\d{2}$/.test(String(e.date||'')))issues.push({index:i,issue:'invalid-date'});if(!['Income','Expense','Transfer'].includes(e.type))issues.push({index:i,issue:'invalid-type'});if(!e.item)issues.push({index:i,issue:'missing-item'});if(!Number.isFinite(Number(e.amount)))issues.push({index:i,issue:'invalid-amount'});if(isAdjustment(e)&&!Number.isFinite(Number(e.adjustmentDelta)))issues.push({index:i,issue:'invalid-adjustment'})});return issues}
function exportCanonical(entries){return clone(entries)}
window.RUNLU_LEDGER_CORE={VERSION,effectAmount,cashEffect,totals,itemTotal,categoryTotals,addNormal,adjustVisibleTotal,clearVisibleTotal,undo,weekBucket,dateForWeek,recurringPresentation,validate,exportCanonical,round2};
})();