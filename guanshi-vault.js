(() => {
  'use strict';

  const ENDPOINT='https://ekrnknlawekeoszzkamd.supabase.co/functions/v1/runlu-guanshi-vault';
  const ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImVrcm5rbmxhd2VrZW9zenprYW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1OTkxNTMsImV4cCI6MjEwMDE3NTE1M30.MypEa1JShRDE2GqDpNooR1ZmWhkTCDWy22TIjCoNM9w';
  const KB_KEY='runlu_guanshi_local_knowledge_v1';
  const VALIDATION_KEY='runlu_guanshi_validation_cases_v1';
  const META_KEY='runlu_guanshi_vault_meta_v1';
  const FORMAT='RUNLU-GUANSHI-LOCAL-VAULT-V1';
  const SCHEMA_VERSION=1;
  const ITERATIONS=310000;
  const ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  const recovery=document.querySelector('[data-vault-recovery]');
  const generateBtn=document.querySelector('[data-vault-generate]');
  const toggleBtn=document.querySelector('[data-vault-toggle]');
  const copyBtn=document.querySelector('[data-vault-copy]');
  const backupBtn=document.querySelector('[data-vault-backup]');
  const restoreBtn=document.querySelector('[data-vault-restore]');
  const statusBtn=document.querySelector('[data-vault-status]');
  const historyBtn=document.querySelector('[data-vault-history]');
  const statusBox=document.querySelector('[data-vault-status-box]');
  const historyBox=document.querySelector('[data-vault-history-box]');
  const localBox=document.querySelector('[data-vault-local-summary]');

  const L={
    en:{need:'Enter or generate your recovery key first.',generated:'A new recovery key was generated. Save it somewhere you control. RUNLU does not store this key.',copied:'Recovery key copied.',copyFail:'Could not copy automatically. Select and copy the key manually.',checking:'Checking encrypted cloud vault…',none:'No cloud backup exists for this recovery key yet.',found:(r,d,s)=>`Cloud backup found · revision ${r} · ${d} · ${s} bytes encrypted payload.`,backup:'Encrypting this device and saving a new cloud snapshot…',saved:r=>`Encrypted cloud backup saved · revision ${r}.`,newer:'A newer cloud snapshot exists. Restore & merge it first so this device cannot overwrite newer data.',restore:'Downloading encrypted snapshot, decrypting locally, and merging…',restored:(k,v,r)=>`Restore & merge complete · ${k} local-knowledge notes · ${v} validation cases · cloud revision ${r}.`,badKey:'The recovery key could not decrypt this backup.',history:'Loading encrypted snapshot history…',historyNone:'No snapshot history yet.',error:e=>`Vault error: ${e}`,local:(k,v)=>`This device: ${k} local-knowledge notes · ${v} validation cases.`,keyShort:'Recovery key must contain at least 20 letters/numbers.',metaMismatch:'This device has not yet linked to the existing cloud vault. Restore & merge before creating another backup.'},
    zh:{need:'请先输入或生成恢复密钥。',generated:'新的恢复密钥已经生成。请把它保存在你自己掌控的安全位置；RUNLU 不保存这把密钥。',copied:'恢复密钥已复制。',copyFail:'无法自动复制，请手动选择并复制恢复密钥。',checking:'正在检查加密云保险箱……',none:'这把恢复密钥目前还没有对应的云端备份。',found:(r,d,s)=>`找到云端加密备份 · 第 ${r} 版 · ${d} · 加密载荷 ${s} bytes。`,backup:'正在本机加密并保存新的云端快照……',saved:r=>`加密云备份已保存 · 第 ${r} 版。`,newer:'云端已有更新快照。请先“恢复并合并”，避免这台设备覆盖更新数据。',restore:'正在下载密文、在本机解密并合并……',restored:(k,v,r)=>`恢复并合并完成 · ${k} 条本地知识 · ${v} 个验证案例 · 云端第 ${r} 版。`,badKey:'这把恢复密钥无法解开当前云备份。',history:'正在读取加密快照历史……',historyNone:'目前还没有历史快照。',error:e=>`保险箱错误：${e}`,local:(k,v)=>`当前设备：${k} 条本地知识 · ${v} 个验证案例。`,keyShort:'恢复密钥至少需要 20 个字母或数字。',metaMismatch:'这台设备还没有与现有云保险箱建立版本关系。请先“恢复并合并”，再创建新的备份。'},
    fr:{need:'Saisissez ou générez d’abord votre clé de récupération.',generated:'Une nouvelle clé a été générée. Conservez-la dans un endroit que vous contrôlez ; RUNLU ne la stocke pas.',copied:'Clé de récupération copiée.',copyFail:'Copie automatique impossible. Copiez la clé manuellement.',checking:'Vérification du coffre cloud chiffré…',none:'Aucune sauvegarde cloud pour cette clé.',found:(r,d,s)=>`Sauvegarde trouvée · révision ${r} · ${d} · ${s} octets chiffrés.`,backup:'Chiffrement local et enregistrement d’un nouvel instantané…',saved:r=>`Sauvegarde chiffrée enregistrée · révision ${r}.`,newer:'Un instantané cloud plus récent existe. Restaurez et fusionnez-le avant de sauvegarder.',restore:'Téléchargement, déchiffrement local et fusion…',restored:(k,v,r)=>`Restauration terminée · ${k} notes · ${v} cas de validation · révision ${r}.`,badKey:'Cette clé ne peut pas déchiffrer la sauvegarde.',history:'Chargement de l’historique…',historyNone:'Aucun historique.',error:e=>`Erreur du coffre : ${e}`,local:(k,v)=>`Cet appareil : ${k} notes locales · ${v} cas de validation.`,keyShort:'La clé doit contenir au moins 20 lettres/chiffres.',metaMismatch:'Cet appareil n’est pas encore relié au coffre existant. Restaurez et fusionnez d’abord.'},
    es:{need:'Introduce o genera primero tu clave de recuperación.',generated:'Se generó una nueva clave. Guárdala en un lugar bajo tu control; RUNLU no la almacena.',copied:'Clave copiada.',copyFail:'No se pudo copiar automáticamente. Copia la clave manualmente.',checking:'Comprobando la bóveda cifrada…',none:'No existe una copia en la nube para esta clave.',found:(r,d,s)=>`Copia encontrada · revisión ${r} · ${d} · ${s} bytes cifrados.`,backup:'Cifrando localmente y guardando una nueva instantánea…',saved:r=>`Copia cifrada guardada · revisión ${r}.`,newer:'Existe una instantánea más reciente. Restaura y combina antes de guardar.',restore:'Descargando, descifrando localmente y combinando…',restored:(k,v,r)=>`Restauración completada · ${k} notas · ${v} casos de validación · revisión ${r}.`,badKey:'Esta clave no puede descifrar la copia.',history:'Cargando historial…',historyNone:'No hay historial.',error:e=>`Error de bóveda: ${e}`,local:(k,v)=>`Este dispositivo: ${k} notas locales · ${v} casos de validación.`,keyShort:'La clave debe contener al menos 20 letras/números.',metaMismatch:'Este dispositivo aún no está vinculado con la bóveda existente. Restaura y combina primero.'}
  };

  const lang=()=>document.querySelector('[data-runlu-language-select]')?.value||localStorage.getItem('runlu_site_language')||'en';
  const t=()=>L[lang()]||L.en;
  const setStatus=(msg,kind='')=>{if(statusBox){statusBox.hidden=false;statusBox.textContent=msg;statusBox.dataset.kind=kind;}};
  const cleanKey=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  const parseArray=key=>{try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x:[];}catch{return [];}};
  const meta=()=>{try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')||{};}catch{return {};}};
  const saveMeta=x=>localStorage.setItem(META_KEY,JSON.stringify(x));
  const bytesToB64=bytes=>{let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(s);};
  const b64ToBytes=s=>Uint8Array.from(atob(String(s)),c=>c.charCodeAt(0));
  const hex=bytes=>[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');
  const sha256=async text=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)));
  const sha256Hex=async text=>hex(await sha256(text));
  const vaultCreds=async phrase=>({vault_id:await sha256Hex(`RUNLU-GUANSHI-VAULT-ID|${phrase}`),auth_secret:await sha256Hex(`RUNLU-GUANSHI-VAULT-AUTH|${phrase}`)});
  async function deriveKey(phrase,salt){
    const raw=await crypto.subtle.importKey('raw',new TextEncoder().encode(phrase),'PBKDF2',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:ITERATIONS},raw,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function encryptPayload(phrase,payload){
    const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await deriveKey(phrase,salt),plain=new TextEncoder().encode(JSON.stringify(payload)),cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plain));
    return {ciphertext:bytesToB64(cipher),salt:bytesToB64(salt),iv:bytesToB64(iv),payload_bytes:plain.byteLength};
  }
  async function decryptPayload(phrase,packet){
    try{const salt=b64ToBytes(packet.salt),iv=b64ToBytes(packet.iv),key=await deriveKey(phrase,salt),plain=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,b64ToBytes(packet.ciphertext));return JSON.parse(new TextDecoder().decode(plain));}catch{throw new Error(t().badKey);}
  }
  async function cloud(action,creds,extra={}){
    const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${ANON_KEY}`,'apikey':ANON_KEY},body:JSON.stringify({action,...creds,...extra})});
    const data=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(data.error||`HTTP ${r.status}`);e.code=data.error_code||'';e.detail=data;throw e;}return data;
  }
  function localSnapshot(){return {format:FORMAT,schema_version:SCHEMA_VERSION,created_at:new Date().toISOString(),knowledge:parseArray(KB_KEY),validation_cases:parseArray(VALIDATION_KEY)};}
  const newer=(a,b)=>new Date(a?.updated_at||a?.created_at||0).getTime()>=new Date(b?.updated_at||b?.created_at||0).getTime()?a:b;
  function mergeKnowledge(local,remote){const map=new Map();for(const x of [...(remote||[]),...(local||[])]){if(!x||!x.id)continue;map.set(x.id,map.has(x.id)?newer(x,map.get(x.id)):x);}return [...map.values()];}
  function mergeReviews(a,b){const seen=new Set(),out=[];for(const r of [...(a||[]),...(b||[])]){const key=JSON.stringify(r);if(!seen.has(key)){seen.add(key);out.push(r);}}return out.sort((x,y)=>new Date(x.created_at||0)-new Date(y.created_at||0));}
  function mergeValidation(local,remote){const map=new Map();for(const c of remote||[]){if(c?.id)map.set(c.id,c);}for(const c of local||[]){if(!c?.id)continue;const old=map.get(c.id);if(!old){map.set(c.id,c);continue;}const base=(c.fingerprint&&old.fingerprint&&c.fingerprint===old.fingerprint)?c:newer(c,old);base.reviews=mergeReviews(old.reviews,c.reviews);map.set(c.id,base);}return [...map.values()];}
  function localSummary(){const k=parseArray(KB_KEY).length,v=parseArray(VALIDATION_KEY).length;if(localBox)localBox.textContent=t().local(k,v);return{k,v};}
  function requirePhrase(){const phrase=cleanKey(recovery?.value);if(!phrase){setStatus(t().need,'warn');return null;}if(phrase.length<20){setStatus(t().keyShort,'warn');return null;}return phrase;}
  function generatedKey(){const b=crypto.getRandomValues(new Uint8Array(20));let out='';for(const x of b)out+=ALPHABET[x%ALPHABET.length];return out.match(/.{1,4}/g).join('-');}
  const busy=v=>[backupBtn,restoreBtn,statusBtn,historyBtn,generateBtn].forEach(b=>{if(b)b.disabled=v;});
  const prettyDate=v=>{try{return new Date(v).toLocaleString(lang()==='zh'?'zh-CN':lang());}catch{return String(v||'');}};

  generateBtn?.addEventListener('click',()=>{if(recovery)recovery.value=generatedKey();setStatus(t().generated,'ok');});
  toggleBtn?.addEventListener('click',()=>{if(!recovery)return;recovery.type=recovery.type==='password'?'text':'password';toggleBtn.textContent=recovery.type==='password'?'◉':'◎';});
  copyBtn?.addEventListener('click',async()=>{if(!recovery?.value)return;try{await navigator.clipboard.writeText(recovery.value);setStatus(t().copied,'ok');}catch{setStatus(t().copyFail,'warn');}});

  statusBtn?.addEventListener('click',async()=>{const phrase=requirePhrase();if(!phrase)return;busy(true);setStatus(t().checking);try{const creds=await vaultCreds(phrase),s=await cloud('status',creds);if(!s.exists)setStatus(t().none,'ok');else setStatus(t().found(s.revision,prettyDate(s.updated_at),s.payload_bytes),'ok');}catch(e){setStatus(t().error(e.message),'error');}finally{busy(false);}});

  backupBtn?.addEventListener('click',async()=>{const phrase=requirePhrase();if(!phrase)return;busy(true);setStatus(t().backup);try{const creds=await vaultCreds(phrase),remote=await cloud('status',creds),m=meta();if(remote.exists&&m.vault_id!==creds.vault_id){setStatus(t().metaMismatch,'warn');return;}if(remote.exists&&Number(m.revision||0)<Number(remote.revision||0)){setStatus(t().newer,'warn');return;}const payload=localSnapshot(),enc=await encryptPayload(phrase,payload),saved=await cloud('backup',creds,{...enc,schema_version:SCHEMA_VERSION,expected_revision:remote.exists?Number(remote.revision):0});saveMeta({vault_id:creds.vault_id,revision:saved.revision,last_backup_at:new Date().toISOString()});setStatus(t().saved(saved.revision),'ok');}catch(e){setStatus(t().error(e.message),'error');}finally{busy(false);localSummary();}});

  restoreBtn?.addEventListener('click',async()=>{const phrase=requirePhrase();if(!phrase)return;busy(true);setStatus(t().restore);try{const creds=await vaultCreds(phrase),packet=await cloud('restore',creds),remote=await decryptPayload(phrase,packet);if(remote?.format!==FORMAT||!Array.isArray(remote.knowledge)||!Array.isArray(remote.validation_cases))throw new Error('Unsupported backup format.');const k=mergeKnowledge(parseArray(KB_KEY),remote.knowledge),v=mergeValidation(parseArray(VALIDATION_KEY),remote.validation_cases);localStorage.setItem(KB_KEY,JSON.stringify(k));localStorage.setItem(VALIDATION_KEY,JSON.stringify(v));saveMeta({vault_id:creds.vault_id,revision:packet.revision,last_restore_at:new Date().toISOString()});setStatus(t().restored(k.length,v.length,packet.revision),'ok');localSummary();}catch(e){setStatus(t().error(e.message),'error');}finally{busy(false);}});

  historyBtn?.addEventListener('click',async()=>{const phrase=requirePhrase();if(!phrase)return;busy(true);setStatus(t().history);try{const creds=await vaultCreds(phrase),h=await cloud('history',creds),items=h.snapshots||[];if(historyBox){historyBox.hidden=false;historyBox.innerHTML=items.length?items.map(x=>`<div class="vault-history-row"><b>v${Number(x.revision)}</b><span>${prettyDate(x.created_at)}</span><span>${Number(x.payload_bytes)||0} bytes</span></div>`).join(''):`<div class="vault-muted">${t().historyNone}</div>`;}setStatus(items.length?t().found(items[0].revision,prettyDate(items[0].created_at),items[0].payload_bytes):t().historyNone,'ok');}catch(e){setStatus(t().error(e.message),'error');}finally{busy(false);}});

  document.querySelector('[data-runlu-language-select]')?.addEventListener('change',()=>setTimeout(localSummary,0));
  localSummary();
})();