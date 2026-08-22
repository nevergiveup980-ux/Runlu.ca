/* RUNLU Deerfoot Flooring OS V0.2.3 — Deerfoot right-bottom checkbox bridge */
(function(){
  function ensure(j){
    if(!j)return;
    if(typeof j.paidBox1!=='boolean')j.paidBox1=typeof j.depositPaidConfirmed==='boolean'?j.depositPaidConfirmed:Number(j.depositPaid||0)>0;
    if(typeof j.paidBox2!=='boolean')j.paidBox2=typeof j.balancePaid==='boolean'?j.balancePaid:false;
    if(typeof j.balanceDueBox!=='boolean')j.balanceDueBox=false;
    if(typeof j.productViewedBeforeInstall!=='boolean')j.productViewedBeforeInstall=false;
    j.depositPaidConfirmed=j.paidBox1;
    j.balancePaid=j.paidBox2;
  }
  function relabel(id,text){
    const el=document.getElementById(id),lab=el?.closest('label');if(!lab)return;
    Array.from(lab.childNodes).forEach(n=>{if(n.nodeType===3)n.textContent=' '+text});
  }
  function ensureUI(){
    const box=document.getElementById('invoiceFormChecks');if(!box)return;
    relabel('invoiceDepositPaidCheck','PAID Box 1');
    relabel('invoiceBalancePaidCheck','PAID Box 2');
    relabel('invoiceProductViewedCheck','Customer viewed product before install');
    if(!document.getElementById('invoiceBalanceDueBoxCheck')){
      const grid=box.querySelector('div[style*="display:grid"]')||box;
      const lab=document.createElement('label');lab.style.cssText='display:flex;gap:9px;align-items:center;margin:0;color:#25312b;font-size:13px';
      lab.innerHTML='<input id="invoiceBalanceDueBoxCheck" type="checkbox" style="width:20px;height:20px"> BALANCE DUE Box';
      grid.appendChild(lab);
    }
    const note=box.querySelector('.muted');if(note)note.textContent='The two PAID boxes and the separate BALANCE DUE box now match the original Deerfoot paper form. Payment Method remains single-choice.';
  }
  function syncUI(){
    const j=active();if(!j)return;ensure(j);ensureUI();
    const a=document.getElementById('invoiceDepositPaidCheck'),b=document.getElementById('invoiceBalancePaidCheck'),c=document.getElementById('invoiceProductViewedCheck'),d=document.getElementById('invoiceBalanceDueBoxCheck');
    if(a)a.checked=!!j.paidBox1;if(b)b.checked=!!j.paidBox2;if(c)c.checked=!!j.productViewedBeforeInstall;if(d)d.checked=!!j.balanceDueBox;
  }
  function readUI(){
    const j=active();if(!j)return;ensure(j);ensureUI();
    const a=document.getElementById('invoiceDepositPaidCheck'),b=document.getElementById('invoiceBalancePaidCheck'),c=document.getElementById('invoiceProductViewedCheck'),d=document.getElementById('invoiceBalanceDueBoxCheck');
    if(a)j.paidBox1=!!a.checked;if(b)j.paidBox2=!!b.checked;if(c)j.productViewedBeforeInstall=!!c.checked;if(d)j.balanceDueBox=!!d.checked;
    j.depositPaidConfirmed=j.paidBox1;j.balancePaid=j.paidBox2;
  }
  function square(el,checked,stacked){
    if(!el)return;el.style.display='flex';el.style.alignItems='center';el.style.justifyContent='center';el.style.fontWeight='700';el.style.fontSize='7pt';el.style.lineHeight='1';
    if(stacked){el.style.margin='1mm auto 0';el.style.width='3.6mm';el.style.height='3.6mm'}
    el.textContent=checked?'✓':'';
  }
  function ensureBalanceBox(d){
    const band=d.querySelector('.priceBand'),row=d.querySelector('.priceBand .balanceRow');if(!row)return null;
    if(band)band.style.height='154.5mm';
    row.style.display='grid';row.style.gridTemplateColumns='21.5mm 15mm 6.5mm';row.style.height='14mm';
    let chk=row.querySelector('.balanceCheckCell');if(!chk){chk=d.createElement('div');chk.className='balanceCheckCell';chk.style.cssText='border-left:.32mm solid #62686b;display:flex;align-items:center;justify-content:center';row.appendChild(chk)}
    let b=chk.querySelector('.balanceDueCheckBox');if(!b){b=d.createElement('span');b.className='balanceDueCheckBox';b.style.cssText='width:3.6mm;height:3.6mm;border:.28mm solid #62686b;background:#fff';chk.appendChild(b)}
    return b;
  }
  function renderIntoInvoiceFrame(){
    const j=active(),frame=document.getElementById('invoiceFrame');if(!j||!frame)return;ensure(j);
    let d=null;try{d=frame.contentDocument||frame.contentWindow?.document}catch(e){return}if(!d)return;
    const paid=Array.from(d.querySelectorAll('.priceBand .miniBox'));square(paid[0],!!j.paidBox1,true);square(paid[1],!!j.paidBox2,true);
    const bb=ensureBalanceBox(d);square(bb,!!j.balanceDueBox,false);
    d.querySelectorAll('.paycheck').forEach(el=>el.classList.toggle('on',String(el.dataset.pay||'').toLowerCase()===String(j.paymentMethod||'').toLowerCase()));
    const notice=d.querySelector('.noticeBlock');if(notice){
      let pv=notice.querySelector('.productViewedBox');
      if(!pv){const walker=d.createTreeWalker(notice,NodeFilter.SHOW_TEXT);let node=null;while(walker.nextNode()){if((walker.currentNode.textContent||'').includes('□')){node=walker.currentNode;break}}if(node){node.textContent=node.textContent.replace('□','');pv=d.createElement('span');pv.className='productViewedBox';pv.style.cssText='display:inline-flex;align-items:center;justify-content:center;width:3.2mm;height:3.2mm;border:.22mm solid #62686b;vertical-align:-.55mm;margin-left:.6mm;font-size:7pt;font-weight:700';node.parentNode.insertBefore(pv,node.nextSibling)}}
      if(pv)pv.textContent=j.productViewedBeforeInstall?'✓':'';
    }
  }
  prepareInvoice=function(){
    const j=active();if(!j)return;if(document.getElementById('accounting')?.classList.contains('active'))readUI();ensure(j);saveStore();
    const c=calc(j),payload={...j,paidBox1:j.paidBox1,paidBox2:j.paidBox2,balanceDueBox:j.balanceDueBox,subtotal:c.subtotal,gst:c.gst,grandTotal:c.total,balanceDue:c.balance,invoiceDate:j.invoiceDate||j.date||new Date().toISOString().slice(0,10)};
    localStorage.setItem(INV,JSON.stringify(payload));const f=byId('invoiceFrame');if(f){f.onload=()=>setTimeout(renderIntoInvoiceFrame,30);f.src='deerfoot-invoice.html?job='+encodeURIComponent(j.jobNumber||'')+'&checks=023&t='+Date.now()}
  };
  const baseLoad=loadAccounting;loadAccounting=function(){baseLoad();setTimeout(syncUI,0)};
  const baseSave=saveAccounting;saveAccounting=function(){readUI();baseSave();saveStore()};
  window.addEventListener('load',()=>{setTimeout(syncUI,0);const f=document.getElementById('invoiceFrame');if(f)f.addEventListener('load',()=>setTimeout(renderIntoInvoiceFrame,30))});
})();

/* V0.3.0 — Deerfoot Estimate / Assessment integration */
(function(){
  try{if(Array.isArray(NAV)&&!NAV.some(x=>x[0]==='estimate'))NAV.splice(1,0,['estimate','Estimate'])}catch(e){}
  function injectEstimate(){
    const main=document.querySelector('main');if(!main)return;
    if(!document.getElementById('estimate')){
      const section=document.createElement('section');section.id='estimate';section.className='page';section.innerHTML='<div class="card"><div class="statusLine"><div><h2>Estimate / Assessment</h2><div class="muted">Deerfoot V0.3 Visual Final · assessment can create a Draft Job / Order.</div></div><button class="action blue" onclick="window.open(\'estimate-assessment.html\',\'_blank\')">Open Full Screen</button></div></div><div class="frameWrap" style="height:78vh"><iframe id="estimateFrame" src="estimate-assessment.html?v=030" title="Deerfoot Estimate Assessment"></iframe></div>';
      const jobsSection=document.getElementById('jobs');main.insertBefore(section,jobsSection||main.firstChild);
    }
    const grid=document.querySelector('#command .grid3');if(grid&&!document.getElementById('estimateModule')){
      const btn=document.createElement('button');btn.id='estimateModule';btn.className='module';btn.onclick=()=>go('estimate');btn.innerHTML='<span class="ico">📋</span><strong>Estimate / Assessment</strong><small>Field assessment, measurement, labour detail and one-tap Draft Job creation.</small>';grid.insertBefore(btn,grid.firstChild);
    }
  }
  injectEstimate();
  window.addEventListener('load',injectEstimate);
  window.addEventListener('message',e=>{
    if(e.origin!==location.origin||e.data?.type!=='runlu-estimate-job-created')return;
    try{jobs=JSON.parse(localStorage.getItem(STORE)||'[]');activeId=localStorage.getItem(ACTIVE)||e.data.jobId;renderAll();go('jobs')}catch(err){}
  });
})();
