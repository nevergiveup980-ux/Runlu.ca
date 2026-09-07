(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.RUNLUV083Regression=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const EPS=1e-9;
  const round2=n=>Math.round((Number(n)+Number.EPSILON)*100)/100;
  function must(c,m){if(!c) throw new Error(m)}
  function expectReject(name,fn){try{fn();return{name,pass:false,error:'unsafe action was accepted'}}catch(e){return{name,pass:true,error:null,detail:e.message}}}
  function assert(name,fn){try{fn();return{name,pass:true,error:null}}catch(e){return{name,pass:false,error:e.message}}}
  function state(){return{day:0,inventory:{X:20},orders:{},holds:[],payments:[],refunds:[],credits:[],returns:[],vendorBills:[],events:[]}}
  function order(s,id,revenue,cost){must(!s.orders[id],'duplicate order');s.orders[id]={id,revenue,cost,returnedCost:0,invoice:null,status:'Order',paid:0,writtenOff:0}}
  function hold(s,id,item,qty){must(qty>0,'hold qty positive');must(s.orders[id]&&s.orders[id].status!=='Cancelled','active order required');const held=s.holds.filter(h=>h.item===item&&h.status==='Held').reduce((a,h)=>a+h.qty,0);must(qty<=s.inventory[item]-held,'over-hold blocked');must(!s.holds.some(h=>h.order===id&&h.item===item&&h.status==='Held'),'duplicate active hold');s.holds.push({order:id,item,qty,status:'Held'})}
  function releaseOrderHolds(s,id){s.holds.filter(h=>h.order===id&&h.status==='Held').forEach(h=>h.status='Released')}
  function consume(s,id,item,qty){const h=s.holds.find(h=>h.order===id&&h.item===item&&h.status==='Held');must(h,'order hold required');must(qty>0&&qty<=h.qty,'consume exceeds hold');must(qty<=s.inventory[item],'consume exceeds physical');s.inventory[item]-=qty;h.qty-=qty;h.consumed=(h.consumed||0)+qty;if(h.qty===0)h.status='Consumed'}
  function returnedQty(s,id,item){return s.returns.filter(r=>r.order===id&&r.item===item).reduce((a,r)=>a+r.qty,0)}
  function consumedQty(s,id,item){return s.holds.filter(h=>h.order===id&&h.item===item).reduce((a,h)=>a+(h.consumed||0),0)}
  function returnStock(s,id,item,qty,key){must(qty>0,'return qty positive');must(!s.returns.some(r=>r.key===key),'duplicate return blocked');must(returnedQty(s,id,item)+qty<=consumedQty(s,id,item),'return exceeds consumed');s.inventory[item]+=qty;s.returns.push({order:id,item,qty,key})}
  function invoice(s,id,net,taxRate=.05,day=s.day){const o=s.orders[id];must(o,'order missing');must(o.status!=='Cancelled','cancelled order cannot invoice');must(!o.invoice,'duplicate invoice blocked');must(net>=0,'invoice net negative');o.invoice={net:round2(net),taxRate,tax:round2(net*taxRate),total:round2(net*(1+taxRate)),day};o.status='Invoiced'}
  function creditTotal(s,id){return round2(s.credits.filter(c=>c.order===id).reduce((a,c)=>a+c.total,0))}
  function creditNet(s,id){return round2(s.credits.filter(c=>c.order===id).reduce((a,c)=>a+c.net,0))}
  function refundTotal(s,id){return round2(s.refunds.filter(r=>r.order===id).reduce((a,r)=>a+r.amount,0))}
  function netCash(s,id){const o=s.orders[id];return round2((o?.paid||0)-refundTotal(s,id))}
  function ar(s,id){const o=s.orders[id];if(!o?.invoice)return 0;return round2(Math.max(0,o.invoice.total-creditTotal(s,id)-netCash(s,id)-(o.writtenOff||0)))}
  function pay(s,id,amount,key,day=s.day){const o=s.orders[id];must(o?.invoice,'invoice required');must(o.status!=='Cancelled','cancelled order payment blocked');must(amount>0,'payment positive');must(!s.payments.some(p=>p.key===key),'duplicate payment blocked');must(amount<=ar(s,id)+EPS,'overpayment blocked');o.paid=round2(o.paid+amount);s.payments.push({order:id,amount,key,day})}
  function creditMemo(s,id,net,key){const o=s.orders[id];must(o?.invoice,'invoice required');must(net>0,'credit positive');must(!s.credits.some(c=>c.key===key),'duplicate credit blocked');must(creditNet(s,id)+net<=o.invoice.net+EPS,'credit exceeds invoice net');const tax=round2(net*o.invoice.taxRate),total=round2(net+tax);s.credits.push({order:id,net:round2(net),tax,total,key});if(creditNet(s,id)>=o.invoice.net-EPS)o.status='Credited'}
  function refund(s,id,amount,key){const o=s.orders[id];must(o?.invoice,'invoice required');must(amount>0,'refund positive');must(!s.refunds.some(r=>r.key===key),'duplicate refund blocked');const refundable=Math.min(o.paid-refundTotal(s,id),creditTotal(s,id)-refundTotal(s,id));must(amount<=refundable+EPS,'refund exceeds paid/credited amount');s.refunds.push({order:id,amount:round2(amount),key})}
  function writeOff(s,id,amount){const o=s.orders[id];must(o?.invoice,'invoice required');must(amount>0&&amount<=ar(s,id)+EPS,'write-off exceeds A/R');o.writtenOff=round2(o.writtenOff+amount);if(ar(s,id)<=EPS)o.status='WrittenOff'}
  function cancel(s,id){const o=s.orders[id];must(o,'order missing');must(!o.invoice,'invoiced order requires credit workflow');o.status='Cancelled';releaseOrderHolds(s,id)}
  function po(s,id,amount){must(amount>=0,'PO amount negative');return{id,amount:round2(amount)}}
  function vendorBill(s,p,bill,key,orderId){must(bill>=0,'bill negative');must(!s.vendorBills.some(v=>v.key===key),'duplicate vendor bill');const v={key,po:p.id,order:orderId,committed:p.amount,actual:round2(bill),variance:round2(bill-p.amount)};s.vendorBills.push(v);return v}
  function adjustedRevenue(s,id){const o=s.orders[id];return round2((o?.revenue||0)-creditNet(s,id))}
  function adjustedCost(s,id){const o=s.orders[id];return round2((o?.cost||0)-(o?.returnedCost||0))}
  function commission(s,id,rate=.10){return round2(Math.max(0,(adjustedRevenue(s,id)-adjustedCost(s,id))*rate))}
  function merchandiseReturn(s,id,item,qty,returnKey,creditNetAmount,creditKey,costRecovery){returnStock(s,id,item,qty,returnKey);creditMemo(s,id,creditNetAmount,creditKey);const o=s.orders[id];must(costRecovery>=0&&o.returnedCost+costRecovery<=o.cost+EPS,'returned cost invalid');o.returnedCost=round2(o.returnedCost+costRecovery)}
  function quarter(day){return Math.floor(Number(day)/90)+1}
  function commissionQuarter(s,id,basis){const o=s.orders[id];must(o?.invoice,'invoice required');if(basis==='invoiceDate')return quarter(o.invoice.day);if(basis==='paymentDate'){const p=s.payments.filter(x=>x.order===id).slice(-1)[0];must(p,'payment required');return quarter(p.day)}throw new Error('unknown date basis')}
  function suite(){const out=[];
    out.push(assert('GST invoice preserves net/tax/total',()=>{let s=state();order(s,'O1',1000,600);invoice(s,'O1',1000,.05);must(s.orders.O1.invoice.net===1000,'net');must(s.orders.O1.invoice.tax===50,'tax');must(s.orders.O1.invoice.total===1050,'total')}));
    out.push(assert('Credit memo reduces A/R without pretending it is payment',()=>{let s=state();order(s,'O1',1000,600);invoice(s,'O1',1000,.05);creditMemo(s,'O1',200,'C1');must(ar(s,'O1')===840,'A/R should be 840');must(s.orders.O1.paid===0,'credit became payment')}));
    out.push(expectReject('Credit memo cannot exceed original invoice net',()=>{let s=state();order(s,'O1',1000,600);invoice(s,'O1',1000,.05);creditMemo(s,'O1',1100,'C1')}));
    out.push(assert('Paid order + credit + refund keeps A/R at zero',()=>{let s=state();order(s,'O1',1000,600);invoice(s,'O1',1000,.05);pay(s,'O1',1050,'P1');creditMemo(s,'O1',200,'C1');refund(s,'O1',210,'R1');must(ar(s,'O1')===0,'A/R reopened');must(netCash(s,'O1')===840,'net cash wrong')}));
    out.push(expectReject('Refund cannot exceed credited and paid amount',()=>{let s=state();order(s,'O1',1000,600);invoice(s,'O1',1000,.05);pay(s,'O1',1050,'P1');creditMemo(s,'O1',200,'C1');refund(s,'O1',220,'R1')}));
    out.push(assert('Bad debt write-off closes A/R but is not cash',()=>{let s=state();order(s,'O1',1000,600);invoice(s,'O1',1000,.05);pay(s,'O1',200,'P1');writeOff(s,'O1',850);must(ar(s,'O1')===0,'A/R not closed');must(netCash(s,'O1')===200,'write-off became cash');must(s.orders.O1.status==='WrittenOff','status')}));
    out.push(assert('Pre-invoice cancellation releases active Holds',()=>{let s=state();order(s,'O1',1000,600);hold(s,'O1','X',10);cancel(s,'O1');must(s.holds[0].status==='Released','hold not released');must(s.inventory.X===20,'physical inventory changed')}));
    out.push(expectReject('Invoiced Order cannot use simple Cancel path',()=>{let s=state();order(s,'O1',1000,600);invoice(s,'O1',1000,.05);cancel(s,'O1')}));
    out.push(assert('Partial merchandise return restores stock exactly once',()=>{let s=state();order(s,'O1',1000,600);hold(s,'O1','X',8);consume(s,'O1','X',8);returnStock(s,'O1','X',3,'RET1');must(s.inventory.X===15,'inventory should be 15');must(returnedQty(s,'O1','X')===3,'return qty')}));
    out.push(expectReject('Duplicate return key is rejected',()=>{let s=state();order(s,'O1',1000,600);hold(s,'O1','X',8);consume(s,'O1','X',8);returnStock(s,'O1','X',3,'RET1');returnStock(s,'O1','X',3,'RET1')}));
    out.push(expectReject('Return cannot exceed quantity actually consumed',()=>{let s=state();order(s,'O1',1000,600);hold(s,'O1','X',4);consume(s,'O1','X',4);returnStock(s,'O1','X',5,'RET1')}));
    out.push(assert('Vendor Bill variance preserves committed PO cost',()=>{let s=state();let p=po(s,'PO1',7300);let v=vendorBill(s,p,7550,'VB1','O1');must(v.committed===7300,'committed overwritten');must(v.actual===7550,'actual');must(v.variance===250,'variance')}));
    out.push(expectReject('Duplicate Vendor Bill key is rejected',()=>{let s=state();let p=po(s,'PO1',7300);vendorBill(s,p,7550,'VB1','O1');vendorBill(s,p,7550,'VB1','O1')}));
    out.push(assert('Return/credit adjusts gross-profit commission base',()=>{let s=state();order(s,'O1',1000,600);hold(s,'O1','X',10);consume(s,'O1','X',10);invoice(s,'O1',1000,0);merchandiseReturn(s,'O1','X',2,'RET1',200,'C1',120);must(adjustedRevenue(s,'O1')===800,'revenue');must(adjustedCost(s,'O1')===480,'cost');must(commission(s,'O1',.10)===32,'commission')}));
    out.push(assert('Invoice-date vs payment-date quarter stays distinct',()=>{let s=state();s.day=80;order(s,'O1',1000,600);invoice(s,'O1',1000,0,80);s.day=95;pay(s,'O1',1000,'P1',95);must(commissionQuarter(s,'O1','invoiceDate')===1,'invoice quarter');must(commissionQuarter(s,'O1','paymentDate')===2,'payment quarter')}));
    out.push(expectReject('Cancelled Order cannot be invoiced later',()=>{let s=state();order(s,'O1',1000,600);cancel(s,'O1');invoice(s,'O1',1000,.05)}));
    out.push(expectReject('Duplicate invoice is rejected',()=>{let s=state();order(s,'O1',1000,600);invoice(s,'O1',1000,.05);invoice(s,'O1',1000,.05)}));
    out.push(expectReject('Duplicate payment key is rejected even when balance remains',()=>{let s=state();order(s,'O1',1000,600);invoice(s,'O1',1000,0);pay(s,'O1',400,'P1');pay(s,'O1',100,'P1')}));
    return out;
  }
  function run(cycles=1){let last=[],fails=0;for(let i=0;i<cycles;i++){last=suite();fails+=last.filter(x=>!x.pass).length}return{pass:fails===0,cycles,assertions:last.length*cycles,failed:fails,passed:last.length*cycles-fails,tests:last}}
  return{version:'0.3.83',suite,run};
});