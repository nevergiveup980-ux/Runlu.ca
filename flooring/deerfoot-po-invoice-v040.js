(function(){
  'use strict';
  const KEY='runlu_flooring_po_deerfoot_invoice_v040';
  const GST_RATE=0.05;
  const invoice=document.getElementById('invoice'),tbody=document.getElementById('rows');
  const q=s=>document.querySelector(s),qa=s=>Array.from(document.querySelectorAll(s));
  function money(n){return '$'+Number(n||0).toLocaleString('en-CA',{minimumFractionDigits:2,maximumFractionDigits:2})}
  function numeric(v){const n=Number(String(v??'').replace(/[$,]/g,''));return Number.isFinite(n)?n:0}
  function fmtDate(s){if(!s)return '';const d=new Date(s+'T12:00:00');return Number.isNaN(d.getTime())?s:d.toLocaleDateString('en-CA',{year:'numeric',month:'short',day:'numeric'})}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return {}}}
  function lineTotal(x){const direct=numeric(x.lineTotal);return direct||numeric(x.qty)*numeric(x.unitCost)}
  function rowQty(x){return [x.qty,String(x.unit||'').toUpperCase()].filter(Boolean).join(' ')}
  function supplierStock(x){return x.sourceRef||x.supplierStock||x.supplier||''}
  function invoiceNotes(data){const lines=[];const po=String(data.poNumber||'').trim();if(po)lines.push('PO # '+po);const notes=String(data.notes||'').trim();if(notes)lines.push(notes);return lines.join('\n')}
  function applyControls(){
    const c=document.getElementById('copy').value,m=document.getElementById('mode').value;invoice.classList.remove('copy-customer','copy-warehouse','copy-accounting','overlay');invoice.classList.add('copy-'+c);if(m==='overlay')invoice.classList.add('overlay');
    document.documentElement.style.setProperty('--offset-x',(Number(document.getElementById('ox').value)||0)+'mm');document.documentElement.style.setProperty('--offset-y',(Number(document.getElementById('oy').value)||0)+'mm');document.documentElement.style.setProperty('--print-scale',(Number(document.getElementById('scale').value)||100)/100);
    renderMoney();renderTag();
  }
  function renderRows(data){
    tbody.innerHTML='';const items=Array.isArray(data.items)?data.items:[];
    for(let i=0;i<15;i++){const x=items[i]||{},tr=document.createElement('tr');[rowQty(x),x.size||'',x.style||'',x.colour||'',supplierStock(x)].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.appendChild(td)});tbody.appendChild(tr)}
    qa('.priceRowData').forEach(el=>el.remove());
    if(document.getElementById('costMode').value!=='show')return;
    items.slice(0,15).forEach((x,i)=>{const top=108+i*5.02,p=document.createElement('div'),t=document.createElement('div');p.className='priceRowData price';p.style.top=top+'mm';p.textContent=x.unitCost!==''&&x.unitCost!=null?money(numeric(x.unitCost)):'';t.className='priceRowData total';t.style.top=top+'mm';t.textContent=lineTotal(x)?money(lineTotal(x)):'';q('.data').appendChild(p);q('.data').appendChild(t)});
  }
  function renderMoney(){
    const data=read(),show=document.getElementById('costMode').value==='show',totals=qa('.totalData');
    if(!show){totals.forEach(el=>el.textContent='');qa('.priceRowData').forEach(el=>el.remove());renderRows(data);return}
    const sub=Number(data.subtotal||((data.items||[]).reduce((s,x)=>s+lineTotal(x),0))||0);
    const gst=Math.round(sub*GST_RATE*100)/100;
    const total=Math.round((sub+gst)*100)/100;
    const vals=[0,sub,gst,total,0,total];
    totals.forEach((el,i)=>el.textContent=vals[i]?money(vals[i]):'');renderRows(data);
  }
  function renderTag(){const data=read(),c=document.getElementById('copy').value,tag=q('.copyTag');if(!tag)return;const copy=c==='customer'?'WHITE':c==='warehouse'?'YELLOW':'PINK';tag.textContent=(data.isDemo?'DEMO · ':'')+'PO WORKFLOW · '+copy+' COPY · V0.3.43 RC · GST 5%'}
  function render(){
    const data=read();
    if(q('.soldData'))q('.soldData').innerHTML=[data.customerName,data.soldToAddress].filter(Boolean).join('<br>');if(q('.shipData'))q('.shipData').innerHTML=[data.shipToName||data.customerName,data.shipToAddress].filter(Boolean).join('<br>');
    if(q('.emailData'))q('.emailData').textContent=data.email||'';if(q('.cellData'))q('.cellData').textContent=data.cell||'';if(q('.phoneHData'))q('.phoneHData').textContent=data.phoneHome||'';if(q('.phoneWData'))q('.phoneWData').textContent=data.phoneWork||'';
    if(q('.pickData'))q('.pickData').textContent=fmtDate(data.pickup);if(q('.deliveryData'))q('.deliveryData').textContent=data.delivery||'';if(q('.requiredData'))q('.requiredData').textContent=fmtDate(data.dateRequired);if(q('.clerkData'))q('.clerkData').textContent=data.clerk||'';if(q('.dateData'))q('.dateData').textContent=fmtDate(data.invoiceDate);
    qa('.invoiceNoTop,.invoiceNoBottom').forEach(el=>el.textContent=data.invoiceNumber||'');if(q('.notesData'))q('.notesData').textContent=invoiceNotes(data);
    renderRows(data);renderMoney();renderTag();applyControls();
  }
  ['copy','mode','costMode','ox','oy','scale'].forEach(id=>document.getElementById(id)?.addEventListener('input',applyControls));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();