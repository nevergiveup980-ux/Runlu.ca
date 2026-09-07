(() => {
  'use strict';

  const VERSION='2.3-auto-vault-v1';
  const ENDPOINT='https://ekrnknlawekeoszzkamd.supabase.co/functions/v1/runlu-guanshi-vault';
  const ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImVrcm5rbmxhd2VrZW9zenprYW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1OTkxNTMsImV4cCI6MjEwMDE3NTE1M30.MypEa1JShRDE2GqDpNooR1ZmWhkTCDWy22TIjCoNM9w';
  const KB_KEY='runlu_guanshi_local_knowledge_v1';
  const VALIDATION_KEY='runlu_guanshi_validation_cases_v1';
  const META_KEY='runlu_guanshi_vault_meta_v1';
  const CFG_KEY='runlu_guanshi_auto_vault_v1';
  const FORMAT='RUNLU-GUANSHI-LOCAL-VAULT-V1';
  const SCHEMA_VERSION=1;
  const ITERATIONS=310000;
  const DB_NAME='runlu_guanshi_device_vault_v1';
  const DB_STORE='device_credentials';
  const DB_RECORD='auto-vault';
  const POLL_MS=25000;

  const enableBtn=document.querySelector('[data-auto-vault-enable]');
  const disableBtn=document.querySelector('[data-auto-vault-disable]');
  const stateBox=document.querySelector('[data-auto-vault-state]');
  const recovery=document.querySelector('[data-vault-recovery]');

  const L={
    en:{off:'Auto backup is off on this device.',on:(d,r)=>`Auto encrypted backup is on · cloud revision ${r||'—'}${d?` · last backup ${d}`:''}.`,needKey:'Enter the recovery key first.',needSync:'Create a manual backup or Restore & merge first; auto backup will not guess which cloud revision is authoritative.',enabling:'Preparing a non-extractable device key…',enabled:'Auto encrypted backup is enabled on this device. The recovery phrase itself was not stored.',disabled:'Auto encrypted backup is disabled and the remembered device credential was removed.',saving:'Local data changed · creating encrypted auto snapshot…',saved:r=>`Auto backup complete · cloud revision ${r}.`,paused:'Auto backup paused: a newer cloud snapshot exists. Open Local Vault and Restore & merge before continuing.',offline:'Auto backup is waiting for the network.',unsupported:'This browser cannot safely retain a non-extractable WebCrypto key, so persistent auto backup is unavailable.',error:e=>`Auto backup error: ${e}`},
    zh:{off:'这台设备的自动备份目前关闭。',on:(d,r)=>`自动加密备份已开启 · 云端第 ${r||'—'} 版${d?` · 最近备份 ${d}`:''}。`,needKey:'请先输入恢复密钥。',needSync:'请先手动“备份这台设备”或“恢复并合并”一次；自动备份不会猜测哪个云端版本才是权威版本。',enabling:'正在准备不可导出的设备密钥……',enabled:'这台设备已开启自动加密备份；恢复密钥原文没有被保存。',disabled:'自动加密备份已关闭，并已删除这台设备记住的自动备份凭据。',saving:'检测到本地数据变化 · 正在创建加密自动快照……',saved:r=>`自动备份完成 · 云端第 ${r} 版。`,paused:'自动备份已暂停：云端存在更新版本。请进入“本地保险箱”先执行“恢复并合并”。',offline:'自动备份正在等待网络恢复。',unsupported:'当前浏览器无法可靠保存不可导出的 WebCrypto 设备密钥，因此不能启用持久自动备份。',error:e=>`自动备份错误：${e}`},
    fr:{off:'La sauvegarde automatique est désactivée sur cet appareil.',on:(d,r)=>`Sauvegarde automatique chiffrée activée · révision ${r||'—'}${d?` · dernière sauvegarde ${d}`:''}.`,needKey:'Saisissez d’abord la clé de récupération.',needSync:'Effectuez d’abord une sauvegarde manuelle ou Restaurer et fusionner.',enabling:'Préparation d’une clé d’appareil non extractible…',enabled:'Sauvegarde automatique activée ; la phrase de récupération elle-même n’a pas été stockée.',disabled:'Sauvegarde automatique désactivée et identifiants locaux supprimés.',saving:'Données locales modifiées · création d’un instantané chiffré…',saved:r=>`Sauvegarde automatique terminée · révision ${r}.`,paused:'Sauvegarde automatique en pause : une version cloud plus récente existe. Restaurez et fusionnez d’abord.',offline:'La sauvegarde automatique attend le réseau.',unsupported:'Ce navigateur ne peut pas conserver de façon fiable une clé WebCrypto non extractible.',error:e=>`Erreur de sauvegarde automatique : ${e}`},
    es:{off:'La copia automática está desactivada en este dispositivo.',on:(d,r)=>`Copia automática cifrada activada · revisión ${r||'—'}${d?` · última copia ${d}`:''}.`,needKey:'Introduce primero la clave de recuperación.',needSync:'Haz primero una copia manual o Restaurar y combinar.',enabling:'Preparando una clave de dispositivo no extraíble…',enabled:'Copia automática activada; la frase de recuperación no se guardó.',disabled:'Copia automática desactivada y credencial local eliminada.',saving:'Cambió el contenido local · creando una instantánea cifrada…',saved:r=>`Copia automática completada · revisión ${r}.`,paused:'Copia automática pausada: existe una versión más nueva en la nube. Restaura y combina primero.',offline:'La copia automática espera la red.',unsupported:'Este navegador no puede conservar de forma fiable una clave WebCrypto no extraíble.',error:e=>`Error de copia automática: ${e}`}
  };

  const lang=()=>document.querySelector('[data-runlu-language-select]')?.value||localStorage.getItem('runlu_site_language')||'en';
  const t=()=>L[lang()]||L.en;
  const setState=(msg,kind='')=>{if(stateBox){stateBox.hidden=false;stateBox.textContent=msg;stateBox.dataset.kind=kind;}};
  const cleanKey=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  const parseArray=key=>{try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x:[];}catch{return [];}};
  const meta=()=>{try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')||{};}catch{return {};}};
  const saveMeta=x=>localStorage.setItem(META_KEY,JSON.stringify(x));
  const config=()=>{try{return JSON.parse(localStorage.getItem(CFG_KEY)||'{}')||{};}catch{return {};}};
  const saveConfig=x=>localStorage.setItem(CFG_KEY,JSON.stringify(x));
  const bytesToB64=bytes=>{let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(s);};
  const hex=bytes=>[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');
  const sha256=async text=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)));
  const sha256Hex=async text=>hex(await sha256(text));
  const prettyDate=v=>{try{return new Date(v).toLocaleString(lang()==='zh'?'zh-CN':lang());}catch{return String(v||'');}};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  async function openDb(){
    if(!('indexedDB' in window)||!crypto?.subtle) throw new Error(t().unsupported);
    return await new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE);};
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('IndexedDB unavailable'));
    });
  }
  async function idbGet(){const db=await openDb();return await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readonly'),req=tx.objectStore(DB_STORE).get(DB_RECORD);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();});}
  async function idbPut(value){const db=await openDb();return await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put(value,DB_RECORD);tx.oncomplete=()=>{db.close();resolve(true);};tx.onerror=()=>{db.close();reject(tx.error);};});}
  async function idbDelete(){const db=await openDb();return await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).delete(DB_RECORD);tx.oncomplete=()=>{db.close();resolve(true);};tx.onerror=()=>{db.close();reject(tx.error);};});}

  async function vaultCreds(phrase){return {vault_id:await sha256Hex(`RUNLU-GUANSHI-VAULT-ID|${phrase}`),auth_secret:await sha256Hex(`RUNLU-GUANSHI-VAULT-AUTH|${phrase}`)};}
  async function deriveAutoKey(phrase,vaultId){
    const salt=(await sha256(`RUNLU-GUANSHI-AUTO-SALT|${vaultId}`)).slice(0,16);
    const raw=await crypto.subtle.importKey('raw',new TextEncoder().encode(phrase),'PBKDF2',false,['deriveKey']);
    const key=await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:ITERATIONS},raw,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
    return {key,salt};
  }
  async function rememberDevice(phrase,creds){
    const derived=await deriveAutoKey(phrase,creds.vault_id);
    await idbPut({version:VERSION,vault_id:creds.vault_id,auth_secret:creds.auth_secret,key:derived.key,salt:bytesToB64(derived.salt),created_at:new Date().toISOString()});
  }
  async function cloud(action,creds,extra={}){
    const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${ANON_KEY}`,'apikey':ANON_KEY},body:JSON.stringify({action,vault_id:creds.vault_id,auth_secret:creds.auth_secret,...extra})});
    const data=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(data.error||`HTTP ${r.status}`);e.code=data.error_code||'';throw e;}return data;
  }
  function localPayload(){return {format:FORMAT,schema_version:SCHEMA_VERSION,created_at:new Date().toISOString(),knowledge:parseArray(KB_KEY),validation_cases:parseArray(VALIDATION_KEY)};}
  async function localDigest(){return sha256Hex(JSON.stringify({knowledge:parseArray(KB_KEY),validation_cases:parseArray(VALIDATION_KEY)}));}
  async function encryptWithDevice(record,payload){
    const iv=crypto.getRandomValues(new Uint8Array(12)),plain=new TextEncoder().encode(JSON.stringify(payload)),cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},record.key,plain));
    return {ciphertext:bytesToB64(cipher),salt:record.salt,iv:bytesToB64(iv),payload_bytes:plain.byteLength};
  }

  let running=false;
  async function render(){
    const c=config();
    if(!c.enabled){setState(t().off);return;}
    if(c.needs_merge){setState(t().paused,'warn');return;}
    setState(t().on(c.last_backup_at?prettyDate(c.last_backup_at):'',c.revision||0),'ok');
  }

  async function enable(){
    const phrase=cleanKey(recovery?.value);if(!phrase||phrase.length<20){setState(t().needKey,'warn');return;}
    setState(t().enabling);try{
      const creds=await vaultCreds(phrase),m=meta();
      if(m.vault_id!==creds.vault_id||Number(m.revision||0)<1){setState(t().needSync,'warn');return;}
      await rememberDevice(phrase,creds);
      const digest=await localDigest();
      saveConfig({version:VERSION,enabled:true,vault_id:creds.vault_id,revision:Number(m.revision||0),last_digest:digest,last_backup_at:m.last_backup_at||m.last_restore_at||'',needs_merge:false,enabled_at:new Date().toISOString()});
      setState(t().enabled,'ok');setTimeout(()=>render(),1800);
    }catch(e){setState(t().error(e.message),'error');}
  }
  async function disable(){
    try{await idbDelete();}catch{}
    saveConfig({version:VERSION,enabled:false,disabled_at:new Date().toISOString()});setState(t().disabled,'ok');
  }

  async function cycle(){
    if(running)return;const c=config();if(!c.enabled)return;
    if(!navigator.onLine){setState(t().offline,'warn');return;}
    running=true;
    try{
      const record=await idbGet();if(!record?.vault_id||!record?.auth_secret||!record?.key){saveConfig({...c,enabled:false});setState(t().unsupported,'warn');return;}
      let cfg=config(),m=meta();
      if(m.vault_id===record.vault_id&&Number(m.revision||0)>Number(cfg.revision||0)){
        const manualBackup=Boolean(m.last_backup_at)&&new Date(m.last_backup_at).getTime()>new Date(cfg.last_backup_at||0).getTime();
        cfg={...cfg,revision:Number(m.revision),last_backup_at:manualBackup?m.last_backup_at:cfg.last_backup_at};
        if(manualBackup)cfg.last_digest=await localDigest();
        saveConfig(cfg);
      }
      const digest=await localDigest();if(digest===cfg.last_digest){await render();return;}
      const remote=await cloud('status',record);
      if(!remote.exists){saveConfig({...cfg,needs_merge:true});setState(t().needSync,'warn');return;}
      if(Number(remote.revision)!==Number(cfg.revision||0)){
        saveConfig({...cfg,needs_merge:true,remote_revision:Number(remote.revision||0)});setState(t().paused,'warn');return;
      }
      setState(t().saving);
      const payload=localPayload(),enc=await encryptWithDevice(record,payload),saved=await cloud('backup',record,{...enc,schema_version:SCHEMA_VERSION,expected_revision:Number(remote.revision)}),now=new Date().toISOString();
      const next={...cfg,revision:Number(saved.revision),last_digest:digest,last_backup_at:now,needs_merge:false,remote_revision:Number(saved.revision)};saveConfig(next);saveMeta({...m,vault_id:record.vault_id,revision:Number(saved.revision),last_backup_at:now});setState(t().saved(saved.revision),'ok');
    }catch(e){setState(t().error(e.message),'error');}
    finally{running=false;}
  }

  enableBtn?.addEventListener('click',enable);
  disableBtn?.addEventListener('click',disable);
  window.addEventListener('online',()=>setTimeout(cycle,1200));
  window.addEventListener('focus',()=>setTimeout(cycle,900));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(cycle,600);else cycle();});
  document.querySelector('[data-runlu-language-select]')?.addEventListener('change',()=>setTimeout(render,0));

  window.GUANSHI_AUTO_VAULT=Object.freeze({version:VERSION,cycle,enable,disable,status:()=>config()});
  render();
  setTimeout(cycle,2200);
  setInterval(cycle,POLL_MS);
})();