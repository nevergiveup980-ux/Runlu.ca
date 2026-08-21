/* RUNLU Deerfoot Flooring OS V0.2.2 — safe invoice checkbox bridge */
(function(){
  function ensure(j){
    if(!j)return;
    if(typeof j.depositPaidConfirmed!=='boolean')j.depositPaidConfirmed=Number(j.depositPaid||0)>0;
    if(typeof j.balancePaid!=='boolean'){const c=calc(j);j.balancePaid=c.total>0&&c.balance<=0}
    if(typeof j.productViewedBeforeInstall!=='boolean')j.productViewedBeforeInstall=false;
  }
  function syncUI(){
    const j=active();if(!j)return;ensure(j);
    const a=document.getElementById('invoiceDepositPaidCheck'),b=document.getElementById('invoiceBalancePaidCheck'),c=document.getElementById('invoiceProductViewedCheck');
    if(a)a.checked=!!j.depositPaidConfirmed;if(b)b.checked=!!j.balancePaid;if(c)c.checked=!!j.productViewedBeforeInstall;
  }
  function readUI(){
    const j=active();if(!j)return;ensure(j);
    const a=document.getElementById('invoiceDepositPaidCheck'),b=document.getElementById('invoiceBalancePaidCheck'),c=document.getElementById('invoiceProductViewedCheck');
    if(a)j.depositPaidConfirmed=!!a.checked;if(b)j.balancePaid=!!b.checked;if(c)j.productViewedBeforeInstall=!!c.checked;
  }
  prepareInvoice=function(){
    const j=active();if(!j)return;
    if(document.getElementById('accounting')?.classList.contains('active'))readUI();
    ensure(j);saveStore();
    const c=calc(j),payload={...j,subtotal:c.subtotal,gst:c.gst,grandTotal:c.total,balanceDue:c.balance,invoiceDate:j.invoiceDate||j.date||new Date().toISOString().slice(0,10)};
    localStorage.setItem(INV,JSON.stringify(payload));
    const f=byId('invoiceFrame');if(f)f.src='deerfoot-invoice.html?job='+encodeURIComponent(j.jobNumber||'')+'&checks=022&t='+Date.now();
  };
  window.addEventListener('load',()=>setTimeout(syncUI,0));
})();
