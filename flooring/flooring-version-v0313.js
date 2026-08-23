/* RUNLU Deerfoot Flooring OS · Version Authority V0.3.13 + CSP-safe event bridge */
(function(){
  'use strict';
  const VERSION='V0.3.13 Pricing + System Settings';
  const TITLE='RUNLU Deerfoot Flooring OS V0.3.13';

  function setVersion(){
    const pill=document.querySelector('header .pill');
    if(pill&&pill.textContent!==VERSION)pill.textContent=VERSION;
    if(document.title!==TITLE)document.title=TITLE;
  }

  function directGo(id){
    const target=document.getElementById(id);
    if(!target)return false;
    document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===id));
    document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===id));
    try{
      if(id==='estimate'){
        const f=document.getElementById('estimateFrame');
        if(f&&!f.getAttribute('src'))f.setAttribute('src',f.dataset.src||'estimate-assessment.html');
      }
      if(id==='jobs'&&typeof window.loadEditor==='function')window.loadEditor();
      if(id==='purchasing'&&typeof window.renderPurchasing==='function')window.renderPurchasing();
      if(id==='warehouse'&&typeof window.renderWarehouse==='function')window.renderWarehouse();
      if(id==='invoice'&&typeof window.prepareInvoice==='function')window.prepareInvoice();
      if(id==='install'&&typeof window.loadInstall==='function')window.loadInstall();
      if(id==='accounting'&&typeof window.loadAccounting==='function')window.loadAccounting();
      if(id==='sales'&&typeof window.renderSales==='function')window.renderSales();
    }catch(e){console.error('RUNLU direct navigation hook failed:',id,e)}
    try{window.scrollTo({top:0,behavior:'smooth'})}catch(_){window.scrollTo(0,0)}
    return true;
  }
  window.runluDirectGo=directGo;

  function splitTopLevel(text,separator){
    const out=[];let cur='',quote='',escape=false,depth=0;
    for(const ch of String(text||'')){
      if(escape){cur+=ch;escape=false;continue}
      if(ch==='\\'){cur+=ch;escape=true;continue}
      if(quote){cur+=ch;if(ch===quote)quote='';continue}
      if(ch==='\''||ch==='"'){quote=ch;cur+=ch;continue}
      if(ch==='('){depth++;cur+=ch;continue}
      if(ch===')'){depth=Math.max(0,depth-1);cur+=ch;continue}
      if(ch===separator&&depth===0){if(cur.trim())out.push(cur.trim());cur='';continue}
      cur+=ch;
    }
    if(cur.trim())out.push(cur.trim());
    return out;
  }

  function parseArg(token,el,event){
    const t=String(token||'').trim();
    if(t==='this')return el;
    if(t==='this.value')return el?.value;
    if(t==='this.checked')return !!el?.checked;
    if(t==='event')return event;
    if(t==='true')return true;if(t==='false')return false;if(t==='null')return null;
    if(/^-?\d+(?:\.\d+)?$/.test(t))return Number(t);
    if((t.startsWith("'")&&t.endsWith("'"))||(t.startsWith('"')&&t.endsWith('"'))){
      const q=t[0];let s=t.slice(1,-1);
      s=s.replace(/\\n/g,'\n').replace(/\\r/g,'\r').replace(/\\t/g,'\t').replace(/\\\\/g,'\\');
      if(q==="'")s=s.replace(/\\'/g,"'");else s=s.replace(/\\"/g,'"');
      return s;
    }
    return undefined;
  }

  function compileHandler(code,el){
    const statements=splitTopLevel(code,';');
    const calls=[];
    for(const statement of statements){
      const m=statement.match(/^([A-Za-z_$][\w$]*)\((.*)\)$/s);
      if(!m)return null;
      const name=m[1],argText=m[2].trim();
      calls.push({name,args:argText?splitTopLevel(argText,','):[]});
    }
    return function(event){
      for(const call of calls){
        const args=call.args.map(x=>parseArg(x,el,event));
        if(args.some((v,i)=>v===undefined&&String(call.args[i]).trim()!=='undefined')){
          console.warn('RUNLU event bridge skipped unsupported args:',call.name,call.args);continue;
        }
        if(call.name==='go'){directGo(args[0]);continue}
        const fn=window[call.name];
        if(typeof fn==='function'){
          try{fn.apply(el,args)}catch(e){console.error('RUNLU bridged action failed:',call.name,e)}
        }
      }
    };
  }

  function convertOne(el){
    if(!el||el.nodeType!==1)return;
    [['onclick','click'],['oninput','input'],['onchange','change']].forEach(([attr,eventName])=>{
      const code=el.getAttribute?.(attr);if(!code)return;
      const fn=compileHandler(code,el);if(!fn)return;
      el.removeAttribute(attr);
      el.addEventListener(eventName,fn);
      el.dataset.runluEventBridge='1';
    });
  }

  function scan(root){
    if(!root)return;
    if(root.nodeType===1)convertOne(root);
    root.querySelectorAll?.('[onclick],[oninput],[onchange]').forEach(convertOne);
  }

  function installEventBridge(){
    if(window.__runluFlooringEventBridge0314)return;
    window.__runluFlooringEventBridge0314=true;
    scan(document);
    const mo=new MutationObserver(records=>{
      for(const rec of records)rec.addedNodes.forEach(node=>scan(node));
    });
    mo.observe(document.documentElement,{childList:true,subtree:true});
    window.__runluFlooringEventBridgeObserver=mo;
  }

  function boot(){
    if(window.__runluFlooringVersionAuthority0313)return;
    window.__runluFlooringVersionAuthority0313=true;
    setVersion();
    installEventBridge();
    window.addEventListener('pageshow',()=>{setVersion();scan(document)});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();