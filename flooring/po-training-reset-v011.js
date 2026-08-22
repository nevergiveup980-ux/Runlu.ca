/* RUNLU Deerfoot Flooring OS · PO Training Reset V0.1.1
   Prototype-only reset for rehearsing PO numbering and supplier-order flow.
   Clears PO ledger + PO numbering settings from localStorage, and clears linked PO summaries on Jobs.
   Does not delete Jobs, Estimates, Showroom records, Warehouse data, Invoice data, or Accounting data. */
(function(){
  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  const PO_SETTINGS='runlu_deerfoot_po_settings_v1';

  function by(id){return document.getElementById(id)}

  function injectResetUI(){
    const section=by('purchasing');
    if(!section || by('poTrainingResetBox')) return;
    const setupCard=section.querySelector('.poSetupGrid .card');
    if(!setupCard) return;
    const box=document.createElement('div');
    box.id='poTrainingResetBox';
    box.style.cssText='margin-top:14px;padding:12px;border:1px solid #e4c9c4;border-radius:12px;background:#fff8f6';
    box.innerHTML=`
      <div style="display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap">
        <div style="min-width:220px;flex:1">
          <b style="display:block;color:#7c2f25;margin-bottom:4px">PO Training / Rehearsal Reset</b>
          <span class="muted">Prototype only. Clears all PO test records and resets Digital PO Starting / Next Number back to uninitialized. Other Flooring OS records are not deleted.</span>
        </div>
        <button class="action red" onclick="resetPOTrainingData()">Reset PO Training Data</button>
      </div>`;
    setupCard.appendChild(box);
  }

  window.resetPOTrainingData=function(){
    const first=confirm('Reset PO rehearsal data? This will delete ALL PO / Supplier Order test records on this device and remove the PO starting/next-number setup. Jobs and other Flooring OS modules will remain.');
    if(!first) return;
    const second=confirm('Final confirmation: clear the PO ledger and return Digital PO numbering to Not initialized? This cannot be undone.');
    if(!second) return;

    localStorage.removeItem(PO_STORE);
    localStorage.removeItem(PO_SETTINGS);

    try{
      if(Array.isArray(jobs)){
        jobs.forEach(j=>{ j.supplierPO=''; });
        saveStore();
      }
    }catch(_){ }

    alert('PO training data reset complete. The PO ledger is empty and Digital PO numbering is Not initialized.');
    location.reload();
  };

  const observer=new MutationObserver(()=>injectResetUI());
  window.addEventListener('load',()=>{injectResetUI();observer.observe(document.body,{childList:true,subtree:true});setTimeout(injectResetUI,100)});
})();

/* Central PO Training V0.2.1 loader.
   Kept separate so local rehearsal mode remains intact if the cloud library is unavailable. */
(function loadCentralPOTraining(){
  function loadCloudClient(){
    if(document.getElementById('runluPOCloudV020'))return;
    const s=document.createElement('script');
    s.id='runluPOCloudV020';
    s.src='po-cloud-v020.js?v=021';
    document.head.appendChild(s);
  }
  if(window.supabase?.createClient){loadCloudClient();return}
  if(document.getElementById('runluSupabaseJs'))return;
  const lib=document.createElement('script');
  lib.id='runluSupabaseJs';
  lib.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  lib.onload=loadCloudClient;
  lib.onerror=()=>console.warn('RUNLU Central PO Training: Supabase client library could not be loaded; local rehearsal mode remains available.');
  document.head.appendChild(lib);
})();
