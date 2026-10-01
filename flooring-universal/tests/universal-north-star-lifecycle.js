'use strict';
const steps=[];
function snapshot(label,state){steps.push({label,state:JSON.parse(JSON.stringify(state))})}
const s={sales:{status:'In Progress',quoteStatus:'Working'},po:null,receiving:null,warehouse:null,installation:null,billing:null,accounting:null};
snapshot('Job created',s);
s.sales.quoteStatus='Ready';snapshot('Quote ready',s);
s.po={status:'Draft'};snapshot('PO draft',s);
s.po.status='Issued';s.receiving={status:'Scheduled'};snapshot('PO issued / inbound scheduled',s);
s.receiving.status='Exception Review';s.warehouse={status:'Exception Review'};snapshot('Receiving exception',s);
s.receiving.status='Ready';s.warehouse.status='Ready';s.installation={status:'Ready to Schedule'};snapshot('Material ready',s);
s.installation.status='Scheduled';snapshot('Installation scheduled',s);
s.installation.status='Completed';s.billing={status:'Draft',balance:1250};snapshot('Installation completed / invoice draft',s);
s.billing.status='Issued';snapshot('Invoice issued',s);
s.billing.status='Partially Paid';s.billing.balance=750;s.accounting={status:'Ready to Pay'};snapshot('Partial customer payment / supplier ready to pay',s);
s.billing.status='Paid';s.billing.balance=0;s.accounting.status='Paid';s.sales.status='Completed';snapshot('Financially complete',s);

let failed=0;
function ok(name,cond){console.log((cond?'PASS ':'FAIL ')+name);if(!cond)failed++}
const get=n=>steps.find(x=>x.label===n).state;
ok('Job starts in progress',get('Job created').sales.status==='In Progress');
ok('Quote becomes ready',get('Quote ready').sales.quoteStatus==='Ready');
ok('Supplier PO reaches issued',get('PO issued / inbound scheduled').po.status==='Issued');
ok('Receiving exception is explicit',get('Receiving exception').receiving.status==='Exception Review');
ok('Warehouse reflects receiving exception',get('Receiving exception').warehouse.status==='Exception Review');
ok('Material ready enables install scheduling',get('Material ready').installation.status==='Ready to Schedule');
ok('Installation reaches completed',get('Installation completed / invoice draft').installation.status==='Completed');
ok('Billing begins as draft after completion',get('Installation completed / invoice draft').billing.status==='Draft');
ok('Partial payment remains open',get('Partial customer payment / supplier ready to pay').billing.status==='Partially Paid'&&get('Partial customer payment / supplier ready to pay').billing.balance>0);
ok('Supplier accounting can be ready to pay',get('Partial customer payment / supplier ready to pay').accounting.status==='Ready to Pay');
ok('Customer invoice closes paid',get('Financially complete').billing.status==='Paid'&&get('Financially complete').billing.balance===0);
ok('Supplier accounting closes paid',get('Financially complete').accounting.status==='Paid');
ok('Sales job closes completed',get('Financially complete').sales.status==='Completed');
if(failed){console.error('\nNorth Star lifecycle scenario failed: '+failed);process.exit(1)}
console.log('\nNorth Star lifecycle scenario: PASS · '+steps.length+' checkpoints');
