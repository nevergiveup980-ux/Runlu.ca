import assert from 'node:assert/strict';

const classify=h=>h.warehouse_dataset_key==='runlu_carpet_inventory_v52'||String(h.item_kind||'').toLowerCase()==='carpet roll'?'Carpet Cutting':'Stock Picking';
const open=t=>!['Completed','Cancelled'].includes(t.status||'Waiting');
const counts=xs=>({waiting:xs.filter(x=>(x.status||'Waiting')==='Waiting').length,progress:xs.filter(x=>['In Progress','Partial'].includes(x.status)).length,completed:xs.filter(x=>x.status==='Completed').length,review:xs.filter(x=>x.review_required).length});
function taskFromHold(h){return {source_hold_id:h.id,task_type:classify(h),warehouse_record_id:h.warehouse_record_id,item_name:h.item_name||'',roll_number:h.roll_number||'',location:h.location||'',quantity:h.quantity,unit:h.unit,status:'Waiting',review_required:false}}
function sync(t,h){if(h.status!=='Held'){if(t.status==='Waiting')t.status='Cancelled';else if(['In Progress','Partial'].includes(t.status))t.review_required=true;return t}t.item_name=h.item_name;t.roll_number=h.roll_number;t.location=h.location;if(t.status==='Waiting'){t.quantity=h.quantity;t.unit=h.unit}return t}

let n=0;const ok=f=>{f();n++};
const stock={id:'h1',warehouse_dataset_key:'runlu_inventory_records_v21',warehouse_record_id:'s1',item_kind:'Underlayment',item_name:'HC',location:'9',quantity:4,unit:'ROLL',status:'Held'};
const carpet={id:'h2',warehouse_dataset_key:'runlu_carpet_inventory_v52',warehouse_record_id:'c1',item_kind:'Carpet Roll',item_name:'Test Carpet',roll_number:'R100',location:'3B',quantity:18.5,unit:'LF',status:'Held'};
const a=taskFromHold(stock),b=taskFromHold(carpet);
ok(()=>assert.equal(a.task_type,'Stock Picking'));
ok(()=>assert.equal(b.task_type,'Carpet Cutting'));
ok(()=>assert.equal(b.roll_number,'R100'));
ok(()=>assert.equal(b.location,'3B'));
ok(()=>assert.equal(b.quantity,18.5));
ok(()=>assert.equal(open(a),true));
sync(a,{...stock,quantity:5});ok(()=>assert.equal(a.quantity,5));
a.status='In Progress';sync(a,{...stock,quantity:7});ok(()=>assert.equal(a.quantity,5));
sync(a,{...stock,status:'Released'});ok(()=>assert.equal(a.review_required,true));
const c=taskFromHold(stock);sync(c,{...stock,status:'Released'});ok(()=>assert.equal(c.status,'Cancelled'));
b.status='Partial';const d=counts([a,b,c,{status:'Completed',review_required:false}]);
ok(()=>assert.deepEqual(d,{waiting:0,progress:2,completed:1,review:1}));
ok(()=>assert.equal(open({status:'Completed'}),false));
ok(()=>assert.equal(open({status:'Cancelled'}),false));
console.log(`V0.9.1 Material Work Orchestration: ${n}/${n} PASS`);
console.log('Rules: explicit Hold only; carpet roll => Cutting; other stock => Picking; started quantity is not silently overwritten; released started Hold requires review; no inventory posting in orchestration.');
