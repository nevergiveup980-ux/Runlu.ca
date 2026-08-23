/* RUNLU Deerfoot Flooring OS · Sales Handover + Pricing Policy sync V0.1.5
   Keeps handover state synchronized and separates company pricing policy from salesperson special-order decisions.
   Special pricing reasons remain attached to item history and are carried to the Deerfoot invoice Notes area. */
(function(){
  'use strict';
  const REASONS=['Repeat Customer','Referral','Friend','Family','Contractor','Senior','Large Order / Volume','Employee','Manager-approved special price','Other / Custom'];
  const PROFILE_LABELS={standard:'Standard / Regular',contractor:'Contractor',repeat:'Repeat Customer',referral:'Referral / Friend',large:'Large Order / Volume',employee:'Employee',custom:'Custom Override'};

  function installHandoverSync(){
    const btn=document.getElementById('handoverExecute');if(!btn||btn.dataset.syncHook==='1')return;btn.dataset.syncHook='1';
    btn.addEventListener('click',()=>setTimeout(()=>{
      const result=document.getElementById('handoverResult');
      if(result&&/is now Former\./.test(result.textContent||'')) location.reload();
    },180));
  }

  function ensurePricingSettings(){
    const sales=document.getElementById('sales');
    const grid=document.getElementById('pricingProfileGrid');
    if(!sales||!grid)return;
    let section=document.getElementById('settings');
    if(!section){
      section=document.createElement('section');section.id='settings';section.className='page';
      section.innerHTML='<div class="card"><div class="statusLine"><div><h2>Settings</h2><div class="muted">Company-wide operating policies. Salespeople use these defaults but do not redefine the company policy for each salesperson.</div></div><span class="tag">Company Policy</span></div></div><div id="companyPricingSettings"></div>';
      sales.insertAdjacentElement('afterend',section);
    }
    const card=grid.closest('.card');
    const host=document.getElementById('companyPricingSettings');
    if(card&&host&&card.parentElement!==host){
      host.appendChild(card);
      const h=card.querySelector('h3');if(h)h.textContent='Company Pricing Policy';
      const muted=card.querySelector('.statusLine .muted');if(muted)muted.textContent='Company defaults are reference policies. Sales may apply a different price to a specific order; the original default, actual markup and reason remain with that item.';
      const note=card.querySelector('.salesPricingNote');if(note)note.innerHTML='<b>Policy vs. order:</b> These percentages belong to the company, not to an individual salesperson. Special-order decisions such as repeat, referral, friend, family, contractor, senior or volume pricing are handled on the Job / Order and remain visible for Accounting review.';
    }
    const nav=document.getElementById('nav');
    if(nav&&!nav.querySelector('[data-page="settings"]')){
      const btn=document.createElement('button');btn.dataset.page='settings';btn.textContent='Settings';btn.onclick=()=>go('settings');
      const salesBtn=nav.querySelector('[data-page="sales"]');salesBtn?salesBtn.insertAdjacentElement('afterend',btn):nav.appendChild(btn);
    }
  }

  function ensureReasonList(){
    if(document.getElementById('specialPricingReasons'))return;
    const dl=document.createElement('datalist');dl.id='specialPricingReasons';dl.innerHTML=REASONS.map(x=>'<option value="'+x.replace(/"/g,'&quot;')+'"></option>').join('');document.body.appendChild(dl);
  }

  function postProcessPricingEditor(){
    ensureReasonList();
    const editor=document.getElementById('itemsEditor');if(!editor)return;
    editor.querySelectorAll('.itemRow').forEach((row,i)=>{
      row.querySelectorAll('label').forEach(label=>{
        if(label.textContent.trim()==='Pricing Profile')label.textContent='Pricing Type';
        if(label.textContent.trim()==='Price Override Reason')label.textContent='Special Pricing / Invoice Note';
      });
      const labels=[...row.querySelectorAll('label')];
      const reasonLabel=labels.find(x=>x.textContent.trim()==='Special Pricing / Invoice Note');
      const reasonInput=reasonLabel?.parentElement?.querySelector('input');
      if(reasonInput){reasonInput.setAttribute('list','specialPricingReasons');reasonInput.placeholder='repeat / referral / friend / family / contractor / senior…'}
      const x=typeof editingItems!=='undefined'?editingItems[i]:null;
      if(x&&!row.querySelector('.pricingAuditLine')){
        const audit=document.createElement('div');audit.className='wide muted pricingAuditLine';audit.style.fontSize='12px';audit.style.marginTop='-3px';
        const def=x.defaultMarkupPct===''||x.defaultMarkupPct==null?'Not set':Number(x.defaultMarkupPct)+'%';
        const applied=x.markupPct===''||x.markupPct==null?'Not set':Number(x.markupPct)+'%';
        audit.textContent='Company default: '+def+' · Applied to this order: '+applied+(x.overrideReason?' · Reason: '+x.overrideReason:'');
        const remove=row.querySelector('button.red');remove?row.insertBefore(audit,remove):row.appendChild(audit);
      }
    });
  }

  function installPricingHooks(){
    if(window.__runluPricingPolicyV039)return;window.__runluPricingPolicyV039=true;
    const oldRender=window.renderItemsEditor;
    if(typeof oldRender==='function')window.renderItemsEditor=function(){const r=oldRender.apply(this,arguments);postProcessPricingEditor();return r};
    const oldApply=window.applyPricingProfile;
    if(typeof oldApply==='function')window.applyPricingProfile=function(i,id){
      const r=oldApply.apply(this,arguments);
      try{
        const x=editingItems[i];
        if(x&&!x.overrideReason&&id!=='standard'&&id!=='custom')x.overrideReason=PROFILE_LABELS[id]||'';
        if(x&&id==='custom'&&x.overrideReason==='Custom pricing')x.overrideReason='';
        if(typeof renderItemsEditor==='function')renderItemsEditor();
      }catch(_){ }
      return r;
    };
    const oldPrepare=window.prepareInvoice;
    if(typeof oldPrepare==='function')window.prepareInvoice=function(){
      let j=null,original='';
      try{
        j=typeof active==='function'?active():null;
        if(j){
          original=String(j.notes||'');
          const reasons=[...new Set((j.items||[]).map(x=>String(x.overrideReason||'').trim()).filter(Boolean))];
          if(reasons.length){const line='Special pricing: '+reasons.join('; ');j.notes=original?original+'\n'+line:line}
        }
      }catch(_){ }
      const r=oldPrepare.apply(this,arguments);
      if(j)j.notes=original;
      return r;
    };
    const oldGo=window.go;
    window.go=function(id){
      if(id==='settings'){
        ensurePricingSettings();
        document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='settings'));
        document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.page==='settings'));
        window.scrollTo({top:0,behavior:'smooth'});return;
      }
      const r=oldGo.apply(this,arguments);setTimeout(()=>{ensurePricingSettings();postProcessPricingEditor()},0);return r;
    };
    ensurePricingSettings();postProcessPricingEditor();
    document.title='RUNLU Deerfoot Flooring OS V0.3.9';
    const pill=document.querySelector('header .pill');if(pill)pill.textContent='V0.3.9 Pricing Policy + Special Orders';
  }

  window.addEventListener('load',()=>{
    setTimeout(installHandoverSync,650);setTimeout(installHandoverSync,1200);
    setTimeout(()=>{ensurePricingSettings();installPricingHooks()},900);
  });
})();

/* V0.3.10 loader: visible salesperson-owned Special Pricing / Order Override panel in Sales. */
(function(){
  function load(){if(document.querySelector('script[data-runlu-special-pricing]'))return;const s=document.createElement('script');s.dataset.runluSpecialPricing='1';s.src='sales-special-pricing-v010.js?v=010';document.body.appendChild(s)}
  window.addEventListener('load',()=>setTimeout(load,1000));
})();

/* V0.3.11 loader: Sales summary → lists → customer/job detail drill-down. */
(function(){
  function load(){if(document.querySelector('script[data-runlu-sales-drilldown]'))return;const s=document.createElement('script');s.dataset.runluSalesDrilldown='1';s.src='sales-drilldown-v010.js?v=010';document.body.appendChild(s)}
  window.addEventListener('load',()=>setTimeout(load,1350));
})();