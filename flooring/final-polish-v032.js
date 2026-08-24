/* RUNLU Deerfoot Flooring OS · Final Polish V0.3.32
   Pricing + Settings workspaces and responsive-shell authority.
   Validation stage: settings remain browser-local; no network or inventory writes.
*/
(function(){
  'use strict';
  if(window.__runluFinalPolish032)return;
  window.__runluFinalPolish032=true;

  const VERSION='V0.3.32 Pricing + Settings + Responsive';
  const PRICING_KEY='runlu_deerfoot_sales_pricing_settings_v1';
  const SETTINGS_KEY='runlu_deerfoot_system_settings_v1';
  const by=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const number=v=>{const n=Number(v);return Number.isFinite(n)?n:0};

  const PROFILE_DEFS=[
    ['standard','Standard / Regular',''],
    ['contractor','Contractor',''],
    ['repeat','Repeat Customer',''],
    ['referral','Referral / Friend',''],
    ['large','Large Order / Volume',''],
    ['employee','Employee',10]
  ];

  const SETTINGS_DEFAULTS={
    company:{name:'Deerfoot Carpet & Flooring',address:'',phone:'',email:'',website:'',gst:''},
    numbering:{jobMode:'Existing / Manual',invoiceMode:'Job-linked',poMode:'Digital PO Sequence',claimPoPattern:'C######'},
    warehouse:{url:'https://warehouse.runlu.ca/',mode:'Linked Workspace'},
    serviceClaims:{claimPoPattern:'C######',requireOriginalJob:true},
    notifications:{pickup:true,backorder:true,serviceClaim:true},
    environment:{mode:'Training / Validation',productionLocked:true}
  };

  function readJson(key,fallback){
    try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&typeof v==='object'?v:fallback()}catch(_){return fallback()}
  }
  function pricingDefaults(){return {profiles:Object.fromEntries(PROFILE_DEFS.map(([id,,d])=>[id,d])),updatedAt:''}}
  function readPricing(){const p=readJson(PRICING_KEY,pricingDefaults);return {...pricingDefaults(),...p,profiles:{...pricingDefaults().profiles,...(p.profiles||{})}}}
  function writePricing(p){p.updatedAt=new Date().toISOString();localStorage.setItem(PRICING_KEY,JSON.stringify(p));window.flooringPricingSettings=p}
  function cloneSettings(){return JSON.parse(JSON.stringify(SETTINGS_DEFAULTS))}
  function readSettings(){
    const s=readJson(SETTINGS_KEY,cloneSettings);
    return {...cloneSettings(),...s,
      company:{...SETTINGS_DEFAULTS.company,...(s.company||{})},
      numbering:{...SETTINGS_DEFAULTS.numbering,...(s.numbering||{})},
      warehouse:{...SETTINGS_DEFAULTS.warehouse,...(s.warehouse||{})},
      serviceClaims:{...SETTINGS_DEFAULTS.serviceClaims,...(s.serviceClaims||{})},
      notifications:{...SETTINGS_DEFAULTS.notifications,...(s.notifications||{})},
      environment:{...SETTINGS_DEFAULTS.environment,...(s.environment||{})}
    };
  }
  function writeSettings(s){localStorage.setItem(SETTINGS_KEY,JSON.stringify(s));window.flooringSystemSettings=s}
  function activeJob(){try{return typeof window.active==='function'?window.active():null}catch(_){return null}}

  function ensureResponsiveCss(){
    if(document.querySelector('link[data-runlu-final-responsive="032"]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';link.href='final-responsive-v032.css?v=032';link.dataset.runluFinalResponsive='032';
    document.head.appendChild(link);
  }

  function markVersion(){
    const pill=document.querySelector('header .pill');if(pill)pill.textContent=VERSION;
    document.title='RUNLU Deerfoot Flooring OS V0.3.32';
  }

  function ensureNavButton(id,label){
    const nav=by('nav');if(!nav)return null;
    let b=nav.querySelector(`[data-page="${id}"]`);
    if(!b){b=document.createElement('button');b.type='button';b.dataset.page=id;b.textContent=label;nav.appendChild(b)}
    if(!b.dataset.runluFinalBound){b.dataset.runluFinalBound='1';b.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();openPage(id)})}
    return b;
  }
  function normalizeNav(){
    const nav=by('nav');if(!nav)return;
    ensureNavButton('pricing','Pricing');ensureNavButton('systemsettings','Settings');
    const showroom=nav.querySelector('[data-page="showroom"]'),estimate=nav.querySelector('[data-page="estimate"]');
    if(showroom&&estimate&&showroom.nextElementSibling!==estimate)showroom.insertAdjacentElement('afterend',estimate);
  }

  function ensureCommandModules(){
    const grid=by('command')?.querySelector('.grid3');if(!grid)return;
    if(!by('pricingModuleFinal')){
      const b=document.createElement('button');b.id='pricingModuleFinal';b.className='module';b.innerHTML='<span class="ico">💲</span><strong>Pricing</strong><small>Company markup profiles, pricing readiness and active-order pricing visibility.</small>';
      b.addEventListener('click',()=>openPage('pricing'));grid.appendChild(b);
    }
    if(!by('settingsModuleFinal')){
      const b=document.createElement('button');b.id='settingsModuleFinal';b.className='module';b.innerHTML='<span class="ico">⚙️</span><strong>Settings</strong><small>Company identity, workflow rules, Warehouse link, notifications and environment controls.</small>';
      b.addEventListener('click',()=>openPage('systemsettings'));grid.appendChild(b);
    }
  }

  function ensurePricingPage(){
    if(by('pricing'))return;
    const sec=document.createElement('section');sec.id='pricing';sec.className='page';
    sec.innerHTML=`
      <div class="card"><div class="statusLine"><div><h2>Pricing</h2><div class="muted">Company pricing defaults and active-order pricing visibility. No pricing rule is assumed unless it is entered here.</div></div><span class="tag">Sales-controlled</span></div></div>
      <div class="pricingFinalGrid">
        <div class="card"><h3>Markup Profiles</h3><div class="muted">Saved as company defaults on this device during validation. Blank means no default is known.</div><div id="pricingFinalProfiles" class="pricingFinalProfiles"></div><div class="actions"><button class="action" id="pricingFinalReload">Reload</button><button class="action primary" id="pricingFinalSave">Save Pricing</button></div><div id="pricingFinalSaved" class="muted pricingFinalMessage"></div></div>
        <div class="card"><h3>Active Order Pricing</h3><div id="pricingFinalActive" class="notice">Select or create a Job / Order to review pricing readiness.</div><div id="pricingFinalLines" class="pricingFinalLines"></div></div>
      </div>
      <div class="card"><h3>Pricing Guardrails</h3><div class="pricingFinalRules"><div><b>Cost first</b><span>Gross profit and margin are only meaningful when Cost / Unit is known.</span></div><div><b>Override trace</b><span>Special pricing should keep the applied markup and reason with the order line.</span></div><div><b>No invented defaults</b><span>Unknown company rules remain blank until a real Deerfoot policy is confirmed.</span></div><div><b>Invoice follows order</b><span>The final invoice uses the selling prices already approved on the Job / Order.</span></div></div></div>`;
    document.querySelector('main')?.appendChild(sec);
    by('pricingFinalSave')?.addEventListener('click',savePricing);
    by('pricingFinalReload')?.addEventListener('click',()=>{renderPricing();by('pricingFinalSaved').textContent='Saved pricing reloaded.'});
  }

  function renderPricing(){
    ensurePricingPage();const p=readPricing();window.flooringPricingSettings=p;
    const profiles=by('pricingFinalProfiles');if(profiles)profiles.innerHTML=PROFILE_DEFS.map(([id,label])=>`<label class="pricingFinalField"><span>${esc(label)}</span><span class="pricingFinalPct"><input id="pricingFinal_${id}" type="number" inputmode="decimal" step="0.1" min="-100" value="${esc(p.profiles[id]??'')}" placeholder="Set %"><em>% markup</em></span>${id==='employee'?'<small>Initialized at 10% from the existing Deerfoot validation profile; change it if the confirmed rule differs.</small>':'<small>Leave blank until the real rule is confirmed.</small>'}</label>`).join('');
    const j=activeJob(),box=by('pricingFinalActive'),lines=by('pricingFinalLines');
    if(!j){if(box)box.innerHTML='<b>No active Job / Order.</b><br>Select a Job to review its pricing readiness.';if(lines)lines.innerHTML='';return}
    const items=Array.isArray(j.items)?j.items:[];let knownCost=0,override=0;
    items.forEach(x=>{const q=parseFloat(String(x.qty||'').replace(/,/g,''))||0,unitCost=number(x.cost),lineCost=number(x.costTotal)||(q&&unitCost?q*unitCost:0);if(lineCost>0)knownCost++;if(x.overrideReason||x.pricingOverride)override++});
    if(box)box.innerHTML=`<b>${esc(j.jobNumber||'No #')} · ${esc(j.customerName||'Unnamed customer')}</b><br>${items.length} item line(s) · ${knownCost}/${items.length} with known cost · ${override} override line(s)`;
    if(lines)lines.innerHTML=items.length?items.map(x=>{const unitCost=number(x.cost),sell=number(x.price),markup=unitCost>0?((sell/unitCost-1)*100):null;return `<div class="pricingFinalLine"><div><b>${esc(x.style||'Item')}${x.colour?' · '+esc(x.colour):''}</b><small>${esc(x.qty||'Qty —')} · ${esc(x.supplier||'Supplier —')}</small></div><div><b>${unitCost>0?'Cost $'+unitCost.toFixed(2):'Cost pending'}</b><small>${sell>0?'Sell $'+sell.toFixed(2):'Sell pending'}${markup!==null?' · '+markup.toFixed(1)+'% markup':''}</small></div></div>`}).join(''):'<div class="muted">No item lines on the active Job.</div>';
  }
  function savePricing(){
    const p=readPricing();PROFILE_DEFS.forEach(([id])=>{const raw=by('pricingFinal_'+id)?.value??'';p.profiles[id]=raw===''?'':Number(raw)});writePricing(p);const m=by('pricingFinalSaved');if(m)m.textContent='Pricing settings saved.';renderPricing();
  }

  function ensureSettingsPage(){
    if(by('systemsettings'))return;
    const sec=document.createElement('section');sec.id='systemsettings';sec.className='page';
    sec.innerHTML=`
      <div class="card"><div class="statusLine"><div><h2>System Settings</h2><div class="muted">System-wide configuration for Deerfoot Flooring OS. Pricing remains in the separate Pricing workspace.</div></div><span class="tag">System-wide</span></div><div class="notice" style="margin-top:10px"><b>Validation-stage settings:</b> these values are stored locally until central configuration and permissions are formally enabled.</div></div>
      <div class="settingsFinalGrid">
        <div class="card"><h3>Company Profile</h3><div class="formgrid"><div class="full"><label>Company Name</label><input id="settingCompanyName"></div><div class="full"><label>Address</label><input id="settingCompanyAddress" placeholder="Set when confirmed"></div><div><label>Phone</label><input id="settingCompanyPhone"></div><div><label>Email</label><input id="settingCompanyEmail"></div><div><label>Website</label><input id="settingCompanyWebsite"></div><div><label>GST Number</label><input id="settingCompanyGst"></div></div></div>
        <div class="card"><h3>Numbering & Documents</h3><div class="settingsFinalReadout"><b>Job / Order #</b><span id="settingJobMode"></span></div><div class="settingsFinalReadout"><b>Standard PO</b><span id="settingPoMode"></span></div><div class="settingsFinalReadout"><b>Claim PO</b><span>C###### · C followed by six digits</span></div><div class="settingsFinalReadout"><b>Invoice #</b><span id="settingInvoiceMode"></span></div></div>
        <div class="card"><h3>Warehouse Integration</h3><label>Warehouse OS URL</label><input id="settingWarehouseUrl"><label>Integration Mode</label><input id="settingWarehouseMode" readonly><div class="notice" style="margin-top:10px">Supplier Pickup and Stock Receiving stay on the shared workflow; inventory posting remains guarded by an exact Warehouse inventory target.</div></div>
        <div class="card"><h3>Service / Claims & Notifications</h3><label class="settingsFinalToggle"><input id="settingRequireOriginalJob" type="checkbox"> Prefer linking Service / Claims to the original Job</label><label class="settingsFinalToggle"><input id="settingNotifyPickup" type="checkbox"> Pickup / receiving updates</label><label class="settingsFinalToggle"><input id="settingNotifyBackorder" type="checkbox"> Backorder / supplier delay</label><label class="settingsFinalToggle"><input id="settingNotifyClaims" type="checkbox"> Service / Claim updates</label></div>
        <div class="card settingsFinalWide"><h3>Environment & Display</h3><div class="formgrid"><div><label>Current Mode</label><input id="settingEnvironment" readonly></div><div><label>Production Status</label><input id="settingProduction" readonly></div><div><label>Responsive Workspace</label><input value="Automatic · phone / tablet / desktop / wide screen" readonly></div><div><label>Viewport</label><input id="settingViewport" readonly></div></div></div>
      </div>
      <div class="card"><div class="actions settingsFinalActions"><button class="action" id="settingsFinalReload">Reload Saved</button><button class="action primary" id="settingsFinalSave">Save System Settings</button></div><div id="settingsFinalSaved" class="muted pricingFinalMessage"></div></div>`;
    document.querySelector('main')?.appendChild(sec);
    by('settingsFinalSave')?.addEventListener('click',saveSettings);
    by('settingsFinalReload')?.addEventListener('click',()=>{renderSettings();by('settingsFinalSaved').textContent='Saved settings reloaded.'});
  }
  function renderSettings(){
    ensureSettingsPage();const s=readSettings(),c=s.company,n=s.numbering,w=s.warehouse,sc=s.serviceClaims,no=s.notifications,e=s.environment;window.flooringSystemSettings=s;
    by('settingCompanyName').value=c.name||'';by('settingCompanyAddress').value=c.address||'';by('settingCompanyPhone').value=c.phone||'';by('settingCompanyEmail').value=c.email||'';by('settingCompanyWebsite').value=c.website||'';by('settingCompanyGst').value=c.gst||'';
    by('settingJobMode').textContent=n.jobMode;by('settingPoMode').textContent=n.poMode;by('settingInvoiceMode').textContent=n.invoiceMode;by('settingWarehouseUrl').value=w.url;by('settingWarehouseMode').value=w.mode;by('settingRequireOriginalJob').checked=sc.requireOriginalJob!==false;by('settingNotifyPickup').checked=no.pickup!==false;by('settingNotifyBackorder').checked=no.backorder!==false;by('settingNotifyClaims').checked=no.serviceClaim!==false;by('settingEnvironment').value=e.mode;by('settingProduction').value=e.productionLocked!==false?'Locked':'Enabled';by('settingViewport').value=`${window.innerWidth} × ${window.innerHeight} CSS px`;
  }
  function saveSettings(){
    const s=readSettings();s.company={name:by('settingCompanyName').value.trim(),address:by('settingCompanyAddress').value.trim(),phone:by('settingCompanyPhone').value.trim(),email:by('settingCompanyEmail').value.trim(),website:by('settingCompanyWebsite').value.trim(),gst:by('settingCompanyGst').value.trim()};s.warehouse={...s.warehouse,url:by('settingWarehouseUrl').value.trim()||SETTINGS_DEFAULTS.warehouse.url,mode:SETTINGS_DEFAULTS.warehouse.mode};s.serviceClaims={...s.serviceClaims,claimPoPattern:'C######',requireOriginalJob:!!by('settingRequireOriginalJob').checked};s.notifications={pickup:!!by('settingNotifyPickup').checked,backorder:!!by('settingNotifyBackorder').checked,serviceClaim:!!by('settingNotifyClaims').checked};s.environment={mode:'Training / Validation',productionLocked:true};writeSettings(s);const m=by('settingsFinalSaved');if(m)m.textContent='System settings saved.';renderSettings();
  }

  function openPage(id){
    if(id==='pricing')renderPricing();else if(id==='systemsettings')renderSettings();
    const target=by(id);if(!target)return;
    document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===id));
    document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===id));
    try{window.scrollTo({top:0,behavior:'smooth'})}catch(_){window.scrollTo(0,0)}
  }
  window.openRunluPricing=()=>openPage('pricing');
  window.openRunluSettings=()=>openPage('systemsettings');

  function syncViewport(){const el=by('settingViewport');if(el)el.value=`${window.innerWidth} × ${window.innerHeight} CSS px`}
  function boot(){
    ensureResponsiveCss();ensurePricingPage();ensureSettingsPage();normalizeNav();ensureCommandModules();markVersion();renderPricing();renderSettings();
    window.addEventListener('resize',syncViewport,{passive:true});
    setTimeout(()=>{normalizeNav();ensureCommandModules();markVersion()},80);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('pageshow',()=>{ensureResponsiveCss();normalizeNav();ensureCommandModules();markVersion();syncViewport()});
})();
