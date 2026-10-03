'use strict';
const fs=require('fs'),vm=require('vm');
const context={window:{},structuredClone:global.structuredClone,console,confirm:()=>false};
vm.createContext(context);
vm.runInContext(fs.readFileSync('flooring-universal/universal-interrupted-resolver.js','utf8'),context);
const R=context.window.RUNLUUniversalInterruptedResolver,K=R.KEYS;
function fixture(key,rows,audits=[]){return {[key]:rows,[K.audit]:audits}}
function tx(type,action,meta,phase){return {id:'tx-1',type,action,meta,phase,startedAt:'2026-09-26T00:00:00.000Z'}}
function audit(entityType,entityId,action,meta={}){return {entityType,entityId,action,meta,createdAt:'2026-09-26T00:00:01.000Z'}}
function check(name,t,f,expect,confidence){const r=R.classifyFixture(t,f);if(r.verdict!==expect)throw new Error(name+': expected '+expect+', got '+r.verdict+' '+JSON.stringify(r));if(confidence&&r.confidence!==confidence)throw new Error(name+': expected confidence '+confidence+', got '+r.confidence+' '+JSON.stringify(r));console.log('PASS '+name)}
check('PO audit/business split',tx('Supplier PO','issue',{poId:'po1'},'AUDIT_SAVED'),fixture(K.po,[{id:'po1',status:'Draft'}],[audit('Supplier PO','po1','issue')]),'UNCERTAIN');
check('PO business milestone contradiction',tx('Supplier PO','issue',{poId:'po1'},'BUSINESS_SAVED'),fixture(K.po,[{id:'po1',status:'Draft'}],[audit('Supplier PO','po1','issue')]),'UNCERTAIN');
check('Receiving audit/business split',tx('Receiving','reconcile',{inboundId:'in1'},'AUDIT_SAVED'),fixture(K.inbound,[{id:'in1',status:'Pending',receivedAt:null}],[audit('Receiving','in1','reconcile')]),'UNCERTAIN');
check('Installation audit/business split',tx('Installation','complete',{installationId:'i1'},'AUDIT_SAVED'),fixture(K.install,[{id:'i1',status:'Scheduled'}],[audit('Installation','i1','status')]),'UNCERTAIN');
check('Invoice audit/business split',tx('Customer Invoice','issue',{invoiceId:'v1'},'AUDIT_SAVED'),fixture(K.invoice,[{id:'v1',status:'Draft',invoiceNumber:''}],[audit('Customer Invoice','v1','issue')]),'UNCERTAIN');
check('Payment exact id absent after audit',tx('Customer Payment','record',{invoiceId:'v1',paymentId:'pay1'},'AUDIT_SAVED'),fixture(K.invoice,[{id:'v1',payments:[]}],[audit('Customer Payment','v1','record',{paymentId:'pay1'})]),'UNCERTAIN');
check('Supplier accounting audit/business split',tx('Supplier Accounting','mark-paid',{accountingId:'a1'},'AUDIT_SAVED'),fixture(K.accounting,[{id:'a1',status:'Ready to Pay'}],[audit('Supplier Accounting','a1','status')]),'UNCERTAIN');
check('Applied payment exact id',tx('Customer Payment','record',{invoiceId:'v1',paymentId:'pay1'},'BUSINESS_SAVED'),fixture(K.invoice,[{id:'v1',payments:[{id:'pay1'}]}],[audit('Customer Payment','v1','record',{paymentId:'pay1'})]),'LIKELY_APPLIED');
check('Applied installation',tx('Installation','complete',{installationId:'i1'},'BUSINESS_SAVED'),fixture(K.install,[{id:'i1',status:'Completed',completedAt:'2026-09-26T00:00:02.000Z'}],[audit('Installation','i1','status')]),'LIKELY_APPLIED');
check('Recovery interrupted at BEGIN stays manual review',tx('Recovery','backup-restore',{},'BEGIN'),{},'UNCERTAIN','REVIEW');
check('Recovery interrupted after local replacement stays manual review',tx('Recovery','backup-restore',{},'LOCAL_REPLACED'),{},'UNCERTAIN','REVIEW');
check('Recovery interrupted after mirror reconciliation is reviewable as applied',tx('Recovery','backup-restore',{},'MIRROR_RECONCILED'),{},'LIKELY_APPLIED','HIGH');
check('Mirror-to-local recovery interrupted after parity verification is reviewable as applied',tx('Recovery','mirror-to-local-restore',{},'PARITY_VERIFIED'),{},'LIKELY_APPLIED','HIGH');
console.log(JSON.stringify({suite:'production resolver fixture matrix',checks:13,result:'PASS'}));
