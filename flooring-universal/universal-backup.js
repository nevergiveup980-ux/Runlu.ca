/* RUNLU Flooring OS Universal · Local Backup / Restore
   Portable JSON backup for Universal-owned local data only. */
(function(){
'use strict';
const PREFIX='runlu_flooring_universal_',BACKEND='runlu_flooring_universal_data_backend',SNAP='runlu_flooring_universal_u2_recovery_points',FORMAT='runlu-flooring-universal-backup',VERSION=1,GUARD='runlu_flooring_universal_u2_startup_guard';
const RESERVED=new Set([BACKEND,SNAP,GUARD]);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function collect(){
 const adapter=window.RUNLUUniversalData?.current?.();
 if(!adapter||adapter.id!=='local')throw new Error('Local backup is available only in Local Device mode.');
 const keys=adapter.rawKeys?.()||[],data={};
 keys.filter(k=>k.startsWith(PREFIX)&&k!==BACKEND&&k!==SNAP&&k!==GUARD).forEach(k=>{data[k]=adapter.read(k,null)});
 return {format:FORMAT,version:VERSION,schemaVersion:window.RUNLUUniversalDataVersion?.status?.().workspaceVersion||0,createdAt:new Date().toISOString(),product:'RUNLU Flooring OS Universal',data};
}
function validate(payload){
 if(!payload||payload.format!==FORMAT)return {ok:false,error:'Not a RUNLU Flooring OS Universal backup.'};
 if(payload.version!==VERSION)return {ok:false,error:'Unsupported backup version.'};
 if(Number(payload.schemaVersion||0)>(window.RUNLUUniversalDataVersion?.CURRENT||1))return {ok:false,error:'Backup data is newer than this app.'};
 if(!payload.data||typeof payload.data!=='object'||Array.isArray(payload.data))return {ok:false,error:'Backup data is missing.'};
 const keys=Object.keys(payload.data);
 if(keys.some(k=>!k.startsWith(PREFIX)))return {ok:false,error:'Backup contains a non-Universal data key.'};
 if(keys.some(k=>RESERVED.has(k)))return {ok:false,error:'Backup contains reserved runtime metadata.'};
 return {ok:true,keys};
}
function download(){
 const payload=collect(),blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download='RUNLU-Flooring-Universal-Backup-'+payload.createdAt.slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 return payload;
}
async function inspectFile(file){
 const text=await file.text();let payload;try{payload=JSON.parse(text)}catch(_){throw new Error('Backup file is not valid JSON.')}
 const check=validate(payload);if(!check.ok)throw new Error(check.error);return {payload,check};
}
function restore(payload){
 const check=validate(payload);if(!check.ok)throw new Error(check.error);
 if(window.RUNLUUniversalData?.backendConfig?.().mode!=='local')throw new Error('Restore is allowed only in Local Device mode.');
 const adapter=window.RUNLUUniversalData.current(),backup=collect(),incoming=payload.data;window.RUNLUUniversalLocalHealth?.capture('Before full Backup restore',{backupCreatedAt:payload.createdAt||null});
 // Replace Universal business/workspace keys as one controlled operation; backend selection remains local.
 (adapter.rawKeys?.()||[]).filter(k=>k.startsWith(PREFIX)&&k!=='runlu_flooring_universal_data_backend'&&k!==SNAP&&k!==GUARD).forEach(k=>adapter.remove(k));
 Object.entries(incoming).forEach(([k,v])=>{if(!RESERVED.has(k))adapter.write(k,v)});
 const migration=window.RUNLUUniversalDataVersion?.migrate?.();
 return {restoredKeys:Object.keys(incoming).length,safetyBackup:backup,migration};
}
function render(){
 const host=document.getElementById('universalBackup');if(!host)return;
 host.innerHTML='<div class="card"><h2>Backup / Restore</h2><p class="muted">Portable Local-First backup. Only RUNLU Flooring OS Universal data is included.</p><div class="uBackupActions"><button class="primary" id="uBackupDownload">Download Backup</button><label class="uBackupFile">Choose Backup<input id="uBackupFile" type="file" accept="application/json,.json"></label></div><div id="uBackupState" class="uBackupState">No backup file selected.</div></div><div class="card"><h3>Restore safety</h3><p class="muted">A restore validates the file first, keeps the Data/Cloud mode untouched, and replaces only Universal-owned local records. Deerfoot and other RUNLU products are outside this namespace.</p></div>';
 document.getElementById('uBackupDownload').onclick=()=>{try{const p=download();state('Backup created · '+Object.keys(p.data).length+' data groups · '+new Date(p.createdAt).toLocaleString(),true)}catch(e){state(e.message,false)}};
 document.getElementById('uBackupFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const {payload,check}=await inspectFile(file);state('Validated · '+check.keys.length+' data groups · created '+new Date(payload.createdAt).toLocaleString()+'. Ready to restore.',true);if(!confirm('Restore this RUNLU Flooring OS Universal backup? Current Universal local records will be replaced.'))return;const r=restore(payload);state('RESTORED · '+r.restoredKeys+' data groups. Reloading…',true);setTimeout(()=>location.reload(),500)}catch(err){state(err.message,false)}};
 function state(msg,ok){const el=document.getElementById('uBackupState');if(el){el.textContent=msg;el.className='uBackupState '+(ok?'ok':'bad')}}
}
window.RUNLUUniversalBackup=Object.freeze({collect,validate,inspectFile,restore,render});
})();