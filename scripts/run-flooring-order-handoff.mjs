import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
// Execute full shipping modules; expose private functions only inside this isolated test VM.
const fields={},storage=new Map();
const A={id:'A',jobNumber:'ORDER-A',customerName:'Alice',soldToAddress:'Address A',delivery:'Deliver A',items:[],depositPaid:0};
const B={id:'B',jobNumber:'ORDER-B',customerName:'Bob',soldToAddress:'Address B',delivery:'Deliver B',items:[],depositPaid:0};
let selected=B,invoiceJob=null;
const box={console,Date,JSON,Math,Number,String,Array,Object,Map,Set,alert(){},confirm:()=>true,setTimeout(){},clearTimeout(){},jobs:[A,B],active:()=>selected,calc:()=>({total:1000}),saveStore(){storage.set('jobs',JSON.stringify(box.jobs))},prepareInvoice(){invoiceJob=JSON.parse(JSON.stringify(selected))},addEventListener(){},open:()=>({}),document:{readyState:'loading',getElementById:id=>fields[id]||null,querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v))}};box.window=box;vm.createContext(box);
function load(file,expose){let s=read('flooring/'+file);const end=s.lastIndexOf('})();');assert(end>=0);s=s.slice(0,end)+expose+'\n'+s.slice(end);vm.runInContext(s,box,{filename:file});}
load('po-safe-v040r1.js','window.testPO={previewPayload,validateItems,issueDigital,setupIssue(r){records=[r];editingId=r.id;settings={initialized:true,nextNumber:500};},nextNumber(){return settings.nextNumber},setRecord(r){records=[r];editingId=r.id;}};');
const po={id:'PO-A',jobId:'A',jobNumber:'ORDER-A',customerName:'Saved Alice',items:[{style:'Oak',qty:'2'}]};
let p=box.testPO.previewPayload(po);assert.equal(p.customerName,'Alice');assert.equal(p.soldToAddress,'Address A');assert.equal(p.invoiceNumber,'ORDER-A');assert.equal(p.items[0].style,'Oak');
p=box.testPO.previewPayload({...po,jobId:'deleted'});assert.equal(p.customerName,'Saved Alice');assert.equal(p.soldToAddress,'');
p=box.testPO.previewPayload({id:'stock',items:[]});assert.equal(p.customerName,'');assert.equal(p.invoiceNumber,'');
box.testPO.setRecord(po);assert.equal(box.runluPOLinkedJob().id,'A');
load('po-delivery-bridge-v043r4.js','');fields.poDeliverySafe={value:'Deliver B'};box.RUNLUPODelivery043R3.restore();assert.equal(fields.poDeliverySafe.value,'Deliver A');box.testPO.setRecord({id:'stock',items:[]});box.RUNLUPODelivery043R3.restore();assert.equal(fields.poDeliverySafe.value,'');
selected=A;load('payment-shared-v046r1.js','window.testPayment={addPayment,removePayment,saveDepositRequired};');
fields.testAmount={value:'200'};box.testPayment.addPayment('test','Accounting');assert.equal(A.depositPaid,200);assert.equal(A.balanceDue,800);assert.equal(invoiceJob.balanceDue,800);assert.equal(B.depositPaid,0);
fields.testAmount.value='300';box.testPayment.addPayment('test','PO');assert.equal(A.depositPaid,500);assert.equal(A.balanceDue,500);
box.testPayment.removePayment(0);assert.equal(A.depositPaid,300);assert.equal(invoiceJob.balanceDue,700);
fields.testDepositRequired={value:'400'};box.testPayment.saveDepositRequired('test');assert.equal(A.depositRequired,400);assert.equal(A.depositPaid,300);assert.equal(A.depositPaidConfirmed,false);
selected=B;fields.testAmount.value='50';box.testPayment.addPayment('test','PO');assert.equal(B.depositPaid,50);assert.equal(A.depositPaid,300);
assert(read('flooring/index-v040.html').includes('po-safe-v040r1.js?v=20261003b'));
const entry=read('flooring/index-v071-pricing-workspace.html');assert(entry.includes('po-delivery-bridge-v043r4.js?v=20261003'));assert(entry.includes('payment-shared-v046r1.js?v=20261003'));
console.log('PASS: cross-order PO ownership, missing/stock context, delivery clearing, partial payments, deletion, deposit terms, order isolation and production wiring. No network or production storage used.');

assert.equal(box.testPO.validateItems({items:[]}),false);
assert.equal(box.testPO.validateItems({items:[]},true),true);
for(const qty of ['0','-1','abc','Infinity']) assert.equal(box.testPO.validateItems({items:[{style:'Oak',qty}]}),false);
assert.equal(box.testPO.validateItems({items:[{style:'Oak',qty:'2.5'}]}),true);
fields.poModeSafe={value:'digital'};fields.poNumberSafe={value:'123'};
box.testPO.setupIssue({...po,poNumber:'123'});
const before=JSON.stringify([...storage]);
box.testPO.issueDigital();box.testPO.issueDigital();
assert.equal(box.testPO.nextNumber(),500);assert.equal(JSON.stringify([...storage]),before);
console.log('PASS: empty/invalid PO lines rejected; reissuing a numbered PO neither consumes a number nor writes storage.');
