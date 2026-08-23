/* RUNLU Deerfoot Flooring OS · Sales Handover + Pricing Policy sync V0.1.8
   Keeps handover state synchronized and separates Pricing from system-wide Settings.
   Loads Special Pricing, Sales Drill-down and Service & Claims reliably after the base workspace is ready. */
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

  function ensurePricingPage(){
    const sales=document.getElementById('sales');
    const grid=document.getElementById('pricingProfileGrid');
    if(!sales||!grid)return;
    let section=document.getElementById('pricing');
    const legacy=document.getElementById('settings');
    if(!section&&legacy&&document.getElementById('companyPricingSettings')){legacy.id='pricing';section=legacy}
    if(!section){
      section=document.createElement('section');section.id='pricing';section.className='page';
      section.innerHTML='<div class="card"><div class="statusLine"><div><h2>Pricing</h2><div class="muted">Company-wide pricing policy. Sales uses these defaults and may apply documented order-level overrides.</div></div><span class="tag">Pricing Policy</span></div></div><div id="companyPricingSettings"></div>';
      sales.insertAdjacentElement('afterend',section);
    }else{
      const h2=section.querySelector('h2');if(h2)h2.textContent='Pricing';
      const topMuted=section.querySelector('.card .statusLine .muted');if(topMuted)topMuted.textContent='Company-wide pricing policy. Sales uses these defaults and may apply documented order-level overrides.';
      const tag=section.querySelector('.card .statusLine .tag');if(tag)tag.textContent='Pricing Policy';
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
    if(nav){
      const legacyBtn=nav.querySelector('[data-page="settings"]');
      if(legacyBtn&&!nav.querySelector('[data-page="pricing"]')){legacyBtn.dataset.page='pricing';legacyBtn.textContent='Pricing';legacyBtn.onclick=()=>go('pricing')}
      if(!nav.querySelector('[data-page="pricing"]')){
        const btn=document.createElement('button');btn.dataset.page='pricing';btn.textContent='Pricing';btn.onclick=()=>go('pricing');
        const salesBtn=nav.querySelector('[data-page="sales"]');salesBtn?salesBtn.insertAdjacentElement('afterend',btn):nav.appendChild(btn);
      }
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
    if(window.__runluPricingPolicyV0313)return;window.__runluPricingPolicyV0313=true;
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
      if(id==='pricing'){
        ensurePricingPage();
        document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='pricing'));
        document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.page==='pricing'));
        window.scrollTo({top:0,behavior:'smooth'});return;
      }
      const r=oldGo.apply(this,arguments);setTimeout(()=>{ensurePricingPage();postProcessPricingEditor()},0);return r;
    };
    ensurePricingPage();postProcessPricingEditor();
  }

  function loadModule(src,key){
    if(document.querySelector(`script[data-runlu-module="${key}"]`))return;
    const s=document.createElement('script');s.dataset.runluModule=key;s.src=src;document.body.appendChild(s);
  }
  function loadFeatureModules(){
    loadModule('sales-special-pricing-v010.js?v=011','special-pricing');
    loadModule('sales-drilldown-v010.js?v=0312','sales-drilldown');
    loadModule('service-claims-v010.js?v=010','service-claims');
  }
  function boot(){
    setTimeout(installHandoverSync,120);setTimeout(installHandoverSync,600);
    setTimeout(()=>{ensurePricingPage();installPricingHooks()},180);
    setTimeout(loadFeatureModules,260);
  }
  if(document.readyState==='loading')window.addEventListener('load',boot);else boot();
})();