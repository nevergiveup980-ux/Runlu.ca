/* RUNLU Deerfoot Flooring OS · System Settings V0.1.0
   System-wide configuration shell. Pricing lives in its own Pricing workspace. */
(function(){
  'use strict';
  const STORE='runlu_deerfoot_system_settings_v1';
  const DEFAULTS={
    company:{name:'Deerfoot Carpet & Flooring',address:'',phone:'',email:'',website:'',gst:''},
    numbering:{jobMode:'Existing / Manual',invoiceMode:'Job-linked',poMode:'Digital PO Sequence',claimPoPattern:'C######'},
    warehouse:{url:'https://warehouse.runlu.ca/',mode:'Linked Workspace'},
    serviceClaims:{claimPoPattern:'C######',requireOriginalJob:true},
    notifications:{pickup:true,backorder:true,serviceClaim:true},
    environment:{mode:'Training / Validation',productionLocked:true}
  };
  const by=id=>document.getElementById(id);
  function read(){try{return {...DEFAULTS,...JSON.parse(localStorage.getItem(STORE)||'{}')}}catch(_){return structuredClone(DEFAULTS)}}
  function write(v){localStorage.setItem(STORE,JSON.stringify(v));window.flooringSystemSettings=v}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function ensureStyle(){if(by('systemSettingsStyle'))return;const s=document.createElement('style');s.id='systemSettingsStyle';s.textContent=`
    .sysGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.sysGrid .full{grid-column:1/-1}.sysSection{border:1px solid #dce5e0;border-radius:14px;padding:14px;background:#fff}.sysSection h3{margin:0 0 4px}.sysSection .muted{margin-bottom:10px}.sysFields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.sysFields .full{grid-column:1/-1}.sysReadout{padding:11px 12px;border:1px solid #dfe6e2;border-radius:10px;background:#f8faf9;font-size:13px}.sysReadout b{display:block;color:#173d30;margin-bottom:3px}.sysToggle{display:flex;align-items:center;gap:9px;padding:9px 0}.sysToggle input{width:20px;height:20px}.sysBanner{padding:12px;border-radius:12px;background:#f3f7f5;border:1px solid #dce7e1}.sysLocked{color:#8a4d12}.sysSaveBar{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}
    @media(max-width:760px){.sysGrid,.sysFields{grid-template-columns:1fr}.sysGrid .full,.sysFields .full{grid-column:auto}}
  `;document.head.appendChild(s)}
  function promoteLegacyPricing(){
    const old=by('settings');
    if(old&&by('companyPricingSettings')&&!by('pricing')) old.id='pricing';
    const nav=by('nav');if(!nav)return;
    const oldBtn=nav.querySelector('[data-page="settings"]');
    if(oldBtn&&!nav.querySelector('[data-page="pricing"]')){oldBtn.dataset.page='pricing';oldBtn.textContent='Pricing';oldBtn.onclick=()=>go('pricing')}
  }
  function ensureNav(){
    promoteLegacyPricing();const nav=by('nav');if(!nav)return;
    if(!nav.querySelector('[data-page="systemsettings"]')){const b=document.createElement('button');b.dataset.page='systemsettings';b.textContent='Settings';b.onclick=()=>go('systemsettings');nav.appendChild(b)}
  }
  function ensurePage(){
    if(by('systemsettings'))return;
    const sec=document.createElement('section');sec.id='systemsettings';sec.className='page';sec.innerHTML=`
      <div class="card"><div class="statusLine"><div><h2>System Settings</h2><div class="muted">System-wide configuration for RUNLU Deerfoot Flooring OS. Pricing is managed separately in Pricing.</div></div><span class="tag">System-wide</span></div><div class="sysBanner"><b>Control center:</b> this page is the home for company identity, numbering, workflow, Warehouse integration, Service & Claims rules, notifications and environment controls.</div></div>
      <div class="sysGrid">
        <div class="sysSection"><h3>Company Profile</h3><div class="muted">Shared company identity used by documents and modules.</div><div class="sysFields"><div class="full"><label>Company Name</label><input id="sysCompanyName"></div><div class="full"><label>Address</label><input id="sysCompanyAddress" placeholder="Set when confirmed"></div><div><label>Phone</label><input id="sysCompanyPhone"></div><div><label>Email</label><input id="sysCompanyEmail"></div><div><label>Website</label><input id="sysCompanyWebsite"></div><div><label>GST Number</label><input id="sysCompanyGst"></div></div></div>
        <div class="sysSection"><h3>Numbering & Documents</h3><div class="muted">One place for system numbering policy.</div><div class="sysReadout"><b>Job / Order #</b><span id="sysJobModeText"></span></div><div class="sysReadout" style="margin-top:8px"><b>Standard PO</b><span id="sysPoModeText"></span></div><div class="sysReadout" style="margin-top:8px"><b>Claim PO</b><span>C###### · C followed by six digits</span></div><div class="sysReadout" style="margin-top:8px"><b>Invoice #</b><span id="sysInvoiceModeText"></span></div></div>
        <div class="sysSection"><h3>Workflow & Modules</h3><div class="muted">System-level workflow ownership.</div><div class="sysReadout"><b>Main Job backbone</b><span>Sales → Job → PO → Pickup / Receiving → Warehouse → Installation → Invoice → Service / Claims → Accounting</span></div><div class="sysReadout" style="margin-top:8px"><b>Service & Claims</b><span>Linked to original customer / Job / Invoice whenever available.</span></div></div>
        <div class="sysSection"><h3>Warehouse Integration</h3><div class="muted">Connection to the existing RUNLU Warehouse OS subsystem.</div><div class="sysFields"><div class="full"><label>Warehouse OS URL</label><input id="sysWarehouseUrl"></div><div class="full"><label>Integration Mode</label><input id="sysWarehouseMode" readonly></div></div></div>
        <div class="sysSection"><h3>Service & Claims</h3><div class="muted">After-sale and Claim defaults.</div><div class="sysReadout"><b>Claim PO Convention</b><span>C######</span></div><label class="sysToggle"><input id="sysRequireOriginalJob" type="checkbox"> Prefer linking every Service / Claim to the original Job</label></div>
        <div class="sysSection"><h3>Notifications</h3><div class="muted">System attention signals.</div><label class="sysToggle"><input id="sysNotifyPickup" type="checkbox"> Pickup / receiving updates</label><label class="sysToggle"><input id="sysNotifyBackorder" type="checkbox"> Backorder / supplier delay</label><label class="sysToggle"><input id="sysNotifyClaims" type="checkbox"> Service / Claim updates</label></div>
        <div class="sysSection full"><h3>Environment & Data</h3><div class="muted">Keep validation controls separate from production operations.</div><div class="sysFields"><div><label>Current Mode</label><input id="sysEnvironment" readonly></div><div><label>Production Status</label><input id="sysProduction" readonly></div></div><div class="sysBanner sysLocked" style="margin-top:10px">Production mutations remain locked until the workflow, permissions and central data rules are validated. This Settings V0.1 stores its configuration locally during the Deerfoot-first validation stage.</div></div>
      </div>
      <div class="card"><div class="sysSaveBar"><button class="action" id="sysReload">Reload Saved</button><button class="action primary" id="sysSave">Save System Settings</button></div><div id="sysSavedMsg" class="muted" style="text-align:right;margin-top:8px"></div></div>`;
    document.querySelector('main')?.appendChild(sec);
  }
  function fill(){const s=read(),c=s.company||DEFAULTS.company,n=s.numbering||DEFAULTS.numbering,w=s.warehouse||DEFAULTS.warehouse,sc=s.serviceClaims||DEFAULTS.serviceClaims,no=s.notifications||DEFAULTS.notifications,e=s.environment||DEFAULTS.environment;
    by('sysCompanyName').value=c.name||'';by('sysCompanyAddress').value=c.address||'';by('sysCompanyPhone').value=c.phone||'';by('sysCompanyEmail').value=c.email||'';by('sysCompanyWebsite').value=c.website||'';by('sysCompanyGst').value=c.gst||'';by('sysJobModeText').textContent=n.jobMode||DEFAULTS.numbering.jobMode;by('sysPoModeText').textContent=n.poMode||DEFAULTS.numbering.poMode;by('sysInvoiceModeText').textContent=n.invoiceMode||DEFAULTS.numbering.invoiceMode;by('sysWarehouseUrl').value=w.url||DEFAULTS.warehouse.url;by('sysWarehouseMode').value=w.mode||DEFAULTS.warehouse.mode;by('sysRequireOriginalJob').checked=sc.requireOriginalJob!==false;by('sysNotifyPickup').checked=no.pickup!==false;by('sysNotifyBackorder').checked=no.backorder!==false;by('sysNotifyClaims').checked=no.serviceClaim!==false;by('sysEnvironment').value=e.mode||DEFAULTS.environment.mode;by('sysProduction').value=e.productionLocked!==false?'Locked':'Enabled';window.flooringSystemSettings=s}
  function save(){const old=read();const v={...old,company:{name:by('sysCompanyName').value.trim(),address:by('sysCompanyAddress').value.trim(),phone:by('sysCompanyPhone').value.trim(),email:by('sysCompanyEmail').value.trim(),website:by('sysCompanyWebsite').value.trim(),gst:by('sysCompanyGst').value.trim()},warehouse:{...(old.warehouse||{}),url:by('sysWarehouseUrl').value.trim()||DEFAULTS.warehouse.url,mode:DEFAULTS.warehouse.mode},serviceClaims:{...(old.serviceClaims||{}),claimPoPattern:'C######',requireOriginalJob:!!by('sysRequireOriginalJob').checked},notifications:{pickup:!!by('sysNotifyPickup').checked,backorder:!!by('sysNotifyBackorder').checked,serviceClaim:!!by('sysNotifyClaims').checked},environment:{mode:'Training / Validation',productionLocked:true},numbering:{...(old.numbering||DEFAULTS.numbering),claimPoPattern:'C######'}};write(v);by('sysSavedMsg').textContent='System settings saved.'}
  function installGo(){if(window.__runluSystemSettingsGo)return;window.__runluSystemSettingsGo=true;const old=window.go;window.go=function(id){if(id==='systemsettings'){ensurePage();ensureNav();fill();document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='systemsettings'));document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.page==='systemsettings'));window.scrollTo({top:0,behavior:'smooth'});return}return old.apply(this,arguments)}}
  function boot(){if(window.__runluSystemSettingsV010)return;window.__runluSystemSettingsV010=true;ensureStyle();promoteLegacyPricing();ensurePage();ensureNav();fill();by('sysSave').onclick=save;by('sysReload').onclick=()=>{fill();by('sysSavedMsg').textContent='Saved settings reloaded.'};installGo();const nav=by('nav');if(nav)new MutationObserver(()=>ensureNav()).observe(nav,{childList:true})}
  if(document.readyState==='loading')window.addEventListener('load',boot,{once:true});else boot();
})();