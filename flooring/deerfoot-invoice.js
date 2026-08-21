const invoice=document.getElementById('invoice'),universal=document.getElementById('universal');
const sample=[{qty:'90 SQFT',size:'',style:'Custom Pro Linoleum',colour:'Longmoor Caramel',supplier:'Buckwold'}];
const tbody=document.getElementById('rows');for(let i=0;i<15;i++){const x=sample[i]||{};const tr=document.createElement('tr');['qty','size','style','colour','supplier'].forEach(k=>{const td=document.createElement('td');td.textContent=x[k]||'';tr.appendChild(td)});tbody.appendChild(tr)}
function apply(){const t=document.getElementById('template').value,c=document.getElementById('copy').value,m=document.getElementById('mode').value;invoice.style.display=t==='deerfoot'?'block':'none';universal.style.display=t==='universal'?'flex':'none';invoice.classList.remove('copy-customer','copy-warehouse','copy-accounting','overlay');invoice.classList.add('copy-'+c);if(m==='overlay')invoice.classList.add('overlay');document.querySelector('.copyTag').textContent=(c==='customer'?'CUSTOMER':c==='warehouse'?'WAREHOUSE':'ACCOUNTING')+' COPY · DEMO PREVIEW';document.documentElement.style.setProperty('--offset-x',(Number(document.getElementById('ox').value)||0)+'mm');document.documentElement.style.setProperty('--offset-y',(Number(document.getElementById('oy').value)||0)+'mm');document.documentElement.style.setProperty('--print-scale',(Number(document.getElementById('scale').value)||100)/100)}
['template','copy','mode','ox','oy','scale'].forEach(id=>document.getElementById(id).addEventListener('input',apply));apply();
(function(){const BRIDGE_KEY='runlu_flooring_active_invoice_v1';function money(n){return '$'+Number(n||0).toLocaleString('en-CA',{minimumFractionDigits:2,maximumFractionDigits:2})}function fmtDate(s){if(!s)return '';const d=new Date(s+'T12:00:00');return Number.isNaN(d.getTime())?s:d.toLocaleDateString('en-CA',{year:'numeric',month:'short',day:'numeric'})}function applyBridge(){let data=null;try{data=JSON.parse(localStorage.getItem(BRIDGE_KEY)||'null')}catch(e){}if(!data)return;const q=s=>document.querySelector(s),qa=s=>Array.from(document.querySelectorAll(s));if(q('.soldData'))q('.soldData').innerHTML=[data.customerName,data.soldToAddress].filter(Boolean).join('<br>');if(q('.shipData'))q('.shipData').innerHTML=[data.shipToName||data.customerName,data.shipToAddress].filter(Boolean).join('<br>');if(q('.emailData'))q('.emailData').textContent=data.email||'';if(q('.cellData'))q('.cellData').textContent=data.cell||'';if(q('.phoneHData'))q('.phoneHData').textContent=data.phoneHome||'';if(q('.phoneWData'))q('.phoneWData').textContent=data.phoneWork||'';if(q('.pickData'))q('.pickData').textContent=data.pickup||'';if(q('.deliveryData'))q('.deliveryData').textContent=data.delivery||'';if(q('.requiredData'))q('.requiredData').textContent=fmtDate(data.dateRequired);if(q('.clerkData'))q('.clerkData').textContent=data.clerk||'';if(q('.dateData'))q('.dateData').textContent=fmtDate(data.invoiceDate||data.date);qa('.invoiceNoTop,.invoiceNoBottom').forEach(el=>el.textContent=data.invoiceNumber||data.jobNumber||'');if(q('.notesData'))q('.notesData').textContent=data.notes||'';const rows=q('#rows');if(rows){rows.innerHTML='';const items=Array.isArray(data.items)?data.items:[];for(let i=0;i<15;i++){const x=items[i]||{},tr=document.createElement('tr');[x.qty||'',x.size||'',x.style||'',x.colour||'',x.supplier||''].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.appendChild(td)});rows.appendChild(tr)}}qa('.priceRowData').forEach(el=>el.remove());const items=Array.isArray(data.items)?data.items:[];items.slice(0,15).forEach((x,i)=>{const top=108+i*5.02,p=document.createElement('div'),t=document.createElement('div');p.className='priceRowData price';p.style.top=top+'mm';p.textContent=x.price?money(x.price):'';t.className='priceRowData total';t.style.top=top+'mm';t.textContent=x.total?money(x.total):'';document.querySelector('.data').appendChild(p);document.querySelector('.data').appendChild(t)});const totals=qa('.totalData'),vals=[data.deliveryCharge,data.subtotal,data.gst,data.grandTotal,data.depositPaid,data.balanceDue];totals.forEach((el,i)=>{if(i<vals.length)el.textContent=money(vals[i])});qa('.paycheck').forEach(el=>el.classList.toggle('on',String(el.dataset.pay||'').toLowerCase()===String(data.paymentMethod||'').toLowerCase()));const tag=q('.copyTag');if(tag&&data.isDemo)tag.textContent='DEMO · '+tag.textContent;const brand=document.querySelector('.brand small');if(brand)brand.innerHTML='Deerfoot production-style invoice · active Job / Order <span class="invoiceBridgeBadge">'+(data.jobNumber||'Selected')+'</span>'}window.addEventListener('load',applyBridge);window.addEventListener('storage',e=>{if(e.key===BRIDGE_KEY)applyBridge()})})();

/* V0.2.2 invoice checkbox renderer */
(function(){
 const BRIDGE_KEY='runlu_flooring_active_invoice_v1';
 function getData(){try{return JSON.parse(localStorage.getItem(BRIDGE_KEY)||'null')}catch(e){return null}}
 function styleSquare(el){if(!el)return;el.style.display='inline-flex';el.style.alignItems='center';el.style.justifyContent='center';el.style.fontWeight='700';el.style.fontSize='7pt';el.style.lineHeight='1'}
 function ensureProductViewedBox(){
   const notice=document.querySelector('.noticeBlock');if(!notice)return null;
   let box=notice.querySelector('.productViewedBox');if(box)return box;
   const firstLine=notice.childNodes[0];
   if(firstLine&&firstLine.nodeType===3){
     const text=firstLine.textContent||'';const marker=' □';
     if(text.includes(marker)){
       const before=text.replace(marker,'');firstLine.textContent=before+' ';
       box=document.createElement('span');box.className='productViewedBox';box.style.width='3.2mm';box.style.height='3.2mm';box.style.border='.22mm solid #62686b';box.style.verticalAlign='-0.55mm';notice.insertBefore(box,firstLine.nextSibling);styleSquare(box);return box;
     }
   }
   box=document.createElement('span');box.className='productViewedBox';box.style.width='3.2mm';box.style.height='3.2mm';box.style.border='.22mm solid #62686b';box.style.marginLeft='1mm';styleSquare(box);notice.appendChild(box);return box;
 }
 function renderFormChecks(){
   const data=getData();if(!data)return;
   const productBox=ensureProductViewedBox();if(productBox)productBox.textContent=data.productViewedBeforeInstall?'✓':'';
   const paidBoxes=Array.from(document.querySelectorAll('.priceBand .miniBox'));
   paidBoxes.forEach(styleSquare);
   if(paidBoxes[0])paidBoxes[0].textContent=data.depositPaidConfirmed?'✓':'';
   if(paidBoxes[1])paidBoxes[1].textContent=data.balancePaid?'✓':'';
 }
 window.addEventListener('load',renderFormChecks);
 window.addEventListener('storage',e=>{if(e.key===BRIDGE_KEY)renderFormChecks()});
})();
