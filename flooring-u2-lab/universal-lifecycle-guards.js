/* RUNLU Flooring OS Universal · U1 Lifecycle Guards
   Shared forward-only lifecycle rules for destructive/terminal actions. */
(function(){
'use strict';
const rank={
 job:{Draft:0,'In Progress':1,Completed:2,Archived:3},
 po:{Draft:0,Issued:1,Sent:2,Confirmed:3,'Partially Received':4,Received:5,Completed:6,Cancelled:99},
 inbound:{Scheduled:0,'In Progress':1,'Picked Up':2,'Partially Received':3,'Exception Review':3,Ready:4,Completed:5,Cancelled:99},
 installation:{'Ready to Schedule':0,Scheduled:1,Completed:2},
 invoice:{Draft:0,Issued:1,'Partially Paid':2,Paid:3},
 supplierAccounting:{Pending:0,Review:1,'Ready to Pay':2,Paid:3}
};
const terminal={po:new Set(['Completed','Cancelled']),inbound:new Set(['Completed','Cancelled']),installation:new Set(['Completed']),invoice:new Set(['Paid']),supplierAccounting:new Set(['Paid'])};
function transition(type,from,to){if(from===to)return {ok:true};if(terminal[type]?.has(from))return {ok:false,reason:from+' is terminal and cannot move backward.'};const a=rank[type]?.[from],b=rank[type]?.[to];if(a==null||b==null)return {ok:false,reason:'Unknown lifecycle state.'};if(b<a&&to!=='Cancelled')return {ok:false,reason:'Backward lifecycle transition blocked: '+from+' → '+to};return {ok:true}}
function canDelete(type,record){if(type==='job'){const id=record.id,linked=(window.RUNLUUniversalPO?.pos()||[]).some(x=>x.jobId===id)||(window.RUNLUUniversalInstallation?.rows()||[]).some(x=>x.jobId===id)||(window.RUNLUUniversalBilling?.rows()||[]).some(x=>x.jobId===id);return linked?{ok:false,reason:'Job has downstream records. Archive it instead.'}:{ok:true}}if(type==='po'){const linked=(window.RUNLUUniversalInbound?.tasks()||[]).some(x=>x.poId===record.id);if(record.poNumber)return {ok:false,reason:'Issued PO numbers remain in the ledger and are never deleted/reused.'};return linked?{ok:false,reason:'PO has inbound records. Cancel it instead.'}:{ok:true}}if(type==='invoice'&&record.invoiceNumber)return {ok:false,reason:'Issued customer invoices remain in the ledger.'};return {ok:true}}
function assert(type,from,to){const r=transition(type,from,to);if(!r.ok)alert(r.reason);return r.ok}
window.RUNLUUniversalGuards=Object.freeze({transition,canDelete,assert,rank});
})();