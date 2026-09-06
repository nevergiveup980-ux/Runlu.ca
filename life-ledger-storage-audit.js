(()=>{
  'use strict';
  const VERSION='1.0';
  const MAX_ARRAY_SAMPLE=50;
  const MAX_OBJECT_DEPTH=2;

  function typeOf(v){
    if(v===null)return 'null';
    if(Array.isArray(v))return 'array';
    if(v instanceof Date)return 'date';
    return typeof v;
  }

  function mergeTypes(a,b){
    const set=new Set([...(Array.isArray(a)?a:[a]),...(Array.isArray(b)?b:[b])].filter(Boolean));
    return set.size===1?[...set][0]:[...set].sort();
  }

  function schemaOf(value,depth=0){
    const t=typeOf(value);
    if(t==='array'){
      if(!value.length)return {type:'array',length:0,itemSchema:'unknown'};
      let itemSchema=null;
      value.slice(0,MAX_ARRAY_SAMPLE).forEach(item=>{
        const s=schemaOf(item,depth+1);
        if(!itemSchema)itemSchema=s;
        else itemSchema=mergeSchema(itemSchema,s);
      });
      return {type:'array',length:value.length,itemSchema};
    }
    if(t==='object' && depth<=MAX_OBJECT_DEPTH){
      const fields={};
      Object.keys(value).sort().forEach(k=>{
        const child=value[k];
        fields[k]=depth===MAX_OBJECT_DEPTH?typeOf(child):schemaOf(child,depth+1);
      });
      return {type:'object',fields};
    }
    return t;
  }

  function mergeSchema(a,b){
    if(typeof a==='string' || typeof b==='string')return mergeTypes(a,b);
    if(!a)return b;if(!b)return a;
    if(a.type!==b.type)return mergeTypes(a.type,b.type);
    if(a.type==='array'){
      return {type:'array',length:Math.max(a.length||0,b.length||0),itemSchema:mergeSchema(a.itemSchema,b.itemSchema)};
    }
    if(a.type==='object'){
      const fields={};
      const keys=new Set([...Object.keys(a.fields||{}),...Object.keys(b.fields||{})]);
      [...keys].sort().forEach(k=>{fields[k]=mergeSchema(a.fields?.[k],b.fields?.[k])});
      return {type:'object',fields};
    }
    return a;
  }

  function bytes(s){return new Blob([s||'']).size}

  function inspectStorage(storage,name){
    const rows=[];
    for(let i=0;i<storage.length;i++){
      const key=storage.key(i);
      const raw=storage.getItem(key)??'';
      let parsed=null,parseable=false;
      try{parsed=JSON.parse(raw);parseable=true}catch{}
      rows.push({
        storage:name,
        key,
        bytes:bytes(raw),
        parseableJson:parseable,
        topLevelType:parseable?typeOf(parsed):'string',
        schema:parseable?schemaOf(parsed):'redacted-string'
      });
    }
    return rows.sort((a,b)=>a.key.localeCompare(b.key));
  }

  function report(){
    const local=inspectStorage(localStorage,'localStorage');
    const session=inspectStorage(sessionStorage,'sessionStorage');
    return {
      tool:'RUNLU Life Ledger Storage Audit',
      version:VERSION,
      generatedAt:new Date().toISOString(),
      origin:location.origin,
      pathname:location.pathname,
      userAgent:navigator.userAgent,
      privacy:'Schema-only report. Values are omitted.',
      localStorage:{keyCount:local.length,totalBytes:local.reduce((s,x)=>s+x.bytes,0),keys:local},
      sessionStorage:{keyCount:session.length,totalBytes:session.reduce((s,x)=>s+x.bytes,0),keys:session}
    };
  }

  function fullBackup(){
    const dump=s=>Object.fromEntries(Array.from({length:s.length},(_,i)=>s.key(i)).map(k=>[k,s.getItem(k)]));
    return {
      tool:'RUNLU Life Ledger Full Safety Backup',
      version:VERSION,
      generatedAt:new Date().toISOString(),
      origin:location.origin,
      warning:'Contains raw local/session storage values and may contain private financial data. Keep this file private.',
      localStorage:dump(localStorage),
      sessionStorage:dump(sessionStorage)
    };
  }

  function download(obj,name){
    const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download=name;a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  async function copy(obj){
    try{await navigator.clipboard.writeText(JSON.stringify(obj,null,2));toast('Schema report copied.')}catch{toast('Copy blocked by browser. Use Download Schema Report.')}}

  function toast(msg){
    let t=document.getElementById('runlu-ledger-audit-toast');
    if(!t){t=document.createElement('div');t.id='runlu-ledger-audit-toast';Object.assign(t.style,{position:'fixed',left:'50%',bottom:'28px',transform:'translateX(-50%)',background:'#102536',color:'#fff',padding:'10px 14px',borderRadius:'999px',zIndex:'2147483647',font:'600 12px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif',boxShadow:'0 8px 30px rgba(0,0,0,.25)'});document.body.appendChild(t)}
    t.textContent=msg;t.style.opacity='1';clearTimeout(t._timer);t._timer=setTimeout(()=>t.style.opacity='0',2200);
  }

  function render(){
    document.getElementById('runlu-ledger-audit-panel')?.remove();
    const r=report();
    const panel=document.createElement('div');
    panel.id='runlu-ledger-audit-panel';
    panel.innerHTML=`
      <div style="position:fixed;inset:0;background:rgba(2,10,18,.58);z-index:2147483645;display:flex;align-items:flex-end;justify-content:center;padding:0">
        <div style="width:min(100%,760px);max-height:88vh;overflow:auto;background:#fff;border-radius:26px 26px 0 0;padding:20px;color:#132235;font:14px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;box-shadow:0 -24px 70px rgba(0,0,0,.28)">
          <div style="display:flex;align-items:flex-start;gap:12px">
            <div style="width:42px;height:42px;border-radius:13px;background:#00c58b;display:grid;place-items:center;font-weight:900">RL</div>
            <div style="flex:1"><div style="font-size:11px;letter-spacing:.14em;color:#44786a;font-weight:800">READ-ONLY MIGRATION AUDIT</div><h2 style="margin:3px 0 5px">Life Ledger storage inventory</h2><div style="color:#718096;font-size:12px">Nothing is changed, added, removed, or uploaded.</div></div>
            <button id="rla-close" style="border:0;background:#edf2f6;border-radius:50%;width:36px;height:36px;font-weight:900">×</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:16px 0">
            <div style="padding:12px;border:1px solid #dce5ec;border-radius:14px"><small style="color:#718096">Local keys</small><b style="display:block;font-size:20px">${r.localStorage.keyCount}</b></div>
            <div style="padding:12px;border:1px solid #dce5ec;border-radius:14px"><small style="color:#718096">Local bytes</small><b style="display:block;font-size:20px">${r.localStorage.totalBytes.toLocaleString()}</b></div>
            <div style="padding:12px;border:1px solid #dce5ec;border-radius:14px"><small style="color:#718096">Origin</small><b style="display:block;font-size:11px;overflow-wrap:anywhere">${location.origin}</b></div>
          </div>
          <div style="background:#e9fbf5;border:1px solid #c9efdf;border-radius:14px;padding:12px;color:#285f50;font-size:12px;line-height:1.5"><b>Safe default:</b> the schema report contains key names, sizes, types, array counts, and field names only. It does not include ledger values.</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0">
            <button id="rla-copy" style="border:0;border-radius:12px;padding:11px 13px;background:#102536;color:#fff;font-weight:800">Copy schema report</button>
            <button id="rla-schema" style="border:0;border-radius:12px;padding:11px 13px;background:#00c58b;color:#06342a;font-weight:800">Download schema report</button>
            <button id="rla-backup" style="border:1px solid #ebcccc;border-radius:12px;padding:11px 13px;background:#fff4f4;color:#a93d3d;font-weight:800">Download FULL safety backup</button>
          </div>
          <div style="font-size:11px;color:#718096;margin-bottom:12px"><b>Full safety backup is optional and sensitive.</b> It contains raw storage values and should stay private on your device.</div>
          <details open><summary style="font-weight:900;cursor:pointer">Detected localStorage keys</summary><pre style="white-space:pre-wrap;background:#f6f8fa;border:1px solid #e1e7ed;border-radius:14px;padding:12px;font-size:11px;line-height:1.45;max-height:320px;overflow:auto">${escapeHtml(JSON.stringify(r.localStorage.keys,null,2))}</pre></details>
        </div>
      </div>`;
    document.body.appendChild(panel);
    panel.querySelector('#rla-close').onclick=()=>panel.remove();
    panel.querySelector('#rla-copy').onclick=()=>copy(r);
    panel.querySelector('#rla-schema').onclick=()=>download(r,`RUNLU_Life_Ledger_Schema_Audit_${Date.now()}.json`);
    panel.querySelector('#rla-backup').onclick=()=>{
      if(confirm('This file may contain private financial data. Download a full local safety backup to this device?'))download(fullBackup(),`RUNLU_Life_Ledger_FULL_Backup_${Date.now()}.json`);
    };
  }

  function escapeHtml(s){return String(s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}

  window.RUNLU_LIFE_LEDGER_STORAGE_AUDIT={version:VERSION,report,fullBackup,open:render};
  render();
})();