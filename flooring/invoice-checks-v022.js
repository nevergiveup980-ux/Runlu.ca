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
  function square(el,checked){
    if(!el)return;el.style.display='inline-flex';el.style.alignItems='center';el.style.justifyContent='center';el.style.fontWeight='700';el.style.fontSize='7pt';el.style.lineHeight='1';el.textContent=checked?'✓':'';
  }
  function renderIntoInvoiceFrame(){
    const j=active(),frame=document.getElementById('invoiceFrame');if(!j||!frame)return;ensure(j);
    let d=null;try{d=frame.contentDocument||frame.contentWindow?.document}catch(e){return}if(!d)return;
    const paid=Array.from(d.querySelectorAll('.priceBand .miniBox'));square(paid[0],!!j.depositPaidConfirmed);square(paid[1],!!j.balancePaid);
    d.querySelectorAll('.paycheck').forEach(el=>el.classList.toggle('on',String(el.dataset.pay||'').toLowerCase()===String(j.paymentMethod||'').toLowerCase()));
    const notice=d.querySelector('.noticeBlock');if(notice){
      let box=notice.querySelector('.productViewedBox');
      if(!box){
        const walker=d.createTreeWalker(notice,NodeFilter.SHOW_TEXT);let node=null;
        while(walker.nextNode()){if((walker.currentNode.textContent||'').includes('□')){node=walker.currentNode;break}}
        if(node){node.textContent=node.textContent.replace('□','');box=d.createElement('span');box.className='productViewedBox';box.style.width='3.2mm';box.style.height='3.2mm';box.style.border='.22mm solid #62686b';box.style.verticalAlign='-0.55mm';box.style.marginLeft='.6mm';node.parentNode.insertBefore(box,node.nextSibling)}
      }
      square(box,!!j.productViewedBeforeInstall);
    }
  }
  prepareInvoice=function(){
    const j=active();if(!j)return;
    if(document.getElementById('accounting')?.classList.contains('active'))readUI();
    ensure(j);saveStore();
    const c=calc(j),payload={...j,subtotal:c.subtotal,gst:c.gst,grandTotal:c.total,balanceDue:c.balance,invoiceDate:j.invoiceDate||j.date||new Date().toISOString().slice(0,10)};
    localStorage.setItem(INV,JSON.stringify(payload));
    const f=byId('invoiceFrame');if(f){f.onload=()=>{setTimeout(renderIntoInvoiceFrame,30)};f.src='deerfoot-invoice.html?job='+encodeURIComponent(j.jobNumber||'')+'&checks=022&t='+Date.now()}
  };
  window.addEventListener('load',()=>{setTimeout(syncUI,0);const f=document.getElementById('invoiceFrame');if(f)f.addEventListener('load',()=>setTimeout(renderIntoInvoiceFrame,30))});
})();
