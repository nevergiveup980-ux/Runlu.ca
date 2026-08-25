/* RUNLU Deerfoot Flooring OS · V0.3.43R4 Safe PO Training Reset
   Restores the old rehearsal reset without MutationObserver.
   Before reset, saves one local backup so the last reset can be restored.
   Clears only Flooring OS PO-related local data and linked PO summaries on Jobs.
   Does NOT delete Jobs, Warehouse, Invoice, Claim, Showroom, Estimate or Accounting data. */
(function(){
  'use strict';
  if(window.__runluPOTrainingReset043R4)return;
  window.__runluPOTrainingReset043R4=true;

  const KEYS=[
    'runlu_deerfoot_supplier_orders_v1',
    'runlu_deerfoot_po_settings_v1',
    'runlu_supplier_task_meta_v1',
    'runlu_deerfoot_po_delivery_v043r3',
    'runlu_flooring_po_deerfoot_invoice_v040'
  ];
  const JOBS='runlu_deerfoot_flooring_jobs_v1';
  const BACKUP='runlu_deerfoot_po_training_reset_backup_v043r4';
  const by=id=>document.getElementById(id);

  function readBackup(){try{return JSON.parse(localStorage.getItem(BACKUP)||'null')}catch(_){return null}}
  function fmtTime(ts){if(!ts)return 'None';try{return new Date(ts).toLocaleString()}catch(_){return String(ts)}}

  function snapshot(){
    const data={createdAt:new Date().toISOString(),values:{}};
    [...KEYS,JOBS].forEach(k=>{data.values[k]=localStorage.getItem(k)});
    localStorage.setItem(BACKUP,JSON.stringify(data));
    return data;
  }

  function clearLinkedPOs(){
    try{
      const arr=JSON.parse(localStorage.getItem(JOBS)||'[]');
      if(!Array.isArray(arr))return;
      arr.forEach(j=>{if(j&&typeof j==='object')j.supplierPO=''});
      localStorage.setItem(JOBS,JSON.stringify(arr));
    }catch(_){}
  }

  function refreshBackupStatus(){
    const el=by('poTrainingBackupStatus043R4');if(!el)return;
    const b=readBackup();
    el.textContent=b?'Last reset backup: '+fmtTime(b.createdAt):'No reset backup saved yet.';
    const restore=by('poTrainingRestore043R4');if(restore)restore.disabled=!b;
  }

  function inject(){
    if(by('poTrainingResetBox043R4')){refreshBackupStatus();return true}
    const start=by('poStart');
    const card=start?.closest?.('.card');
    if(!card)return false;
    const box=document.createElement('div');
    box.id='poTrainingResetBox043R4';
    box.style.cssText='margin-top:14px;padding:13px;border:1px solid #e4c9c4;border-radius:12px;background:#fff8f6';
    box.innerHTML=`
      <div style="display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap">
        <div style="min-width:240px;flex:1">
          <b style="display:block;color:#7c2f25;margin-bottom:4px">PO Training / Rehearsal Reset</b>
          <span class="muted">For training only. Clears the local PO ledger and PO numbering setup on this device, then returns Digital PO numbering to Not initialized. Jobs and other modules remain.</span>
          <div id="poTrainingBackupStatus043R4" class="muted" style="margin-top:7px;font-size:12px"></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="action" id="poTrainingRestore043R4" type="button">Restore Last Reset</button>
          <button class="action red" id="poTrainingReset043R4" type="button">Reset PO Training Data</button>
        </div>
      </div>`;
    card.appendChild(box);
    by('poTrainingReset043R4').addEventListener('click',reset);
    by('poTrainingRestore043R4').addEventListener('click',restore);
    refreshBackupStatus();
    return true;
  }

  function reset(){
    const first=confirm('Training reset only: clear ALL local PO / Supplier Order records on this device and reset Digital PO numbering? Jobs and other Flooring OS modules will remain.');
    if(!first)return;
    const typed=prompt('Type RESET PO to confirm. A local backup will be saved first.','');
    if(String(typed||'').trim().toUpperCase()!=='RESET PO'){alert('Reset cancelled.');return}
    snapshot();
    KEYS.forEach(k=>localStorage.removeItem(k));
    clearLinkedPOs();
    alert('PO training reset complete. PO ledger is empty and Digital PO numbering is Not initialized. A local backup is available through Restore Last Reset.');
    location.reload();
  }

  function restore(){
    const b=readBackup();
    if(!b||!b.values){alert('No training reset backup is available.');return}
    if(!confirm('Restore the PO data saved immediately before the last Training Reset?'))return;
    Object.entries(b.values).forEach(([k,v])=>{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v)});
    alert('Last PO training reset has been restored.');
    location.reload();
  }

  function install(){inject()}
  window.RUNLUPOTrainingReset043R4={install,reset,restore};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});else setTimeout(install,0);
})();
