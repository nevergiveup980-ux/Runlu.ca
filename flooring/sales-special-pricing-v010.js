/* RUNLU Deerfoot Flooring OS · Sales Special Pricing V0.1.1
   Makes salesperson-owned special-order pricing visible directly in Sales while company defaults remain in Settings. */
(function(){
  'use strict';
  const REASONS=['Repeat Customer','Referral','Friend','Family','Contractor','Senior','Large Order / Volume','Employee','Manager-approved special price','Other / Custom'];
  function by(id){return document.getElementById(id)}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]))}
  function num(v){const n=Number(v);return Number.isFinite(n)?n:0}
  function qty(v){const m=String(v??'').replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);const n=m?Number(m[0]):NaN;return Number.isFinite(n)&&n>0?n:null}
  function currentJob(){try{return typeof active==='function'?active():null}catch(_){return null}}

  function ensureCard(){
    const sales=by('sales');if(!sales||by('salesSpecialPricing'))return;
    const team=by('salesTeamChangeCard');
    const card=document.createElement('div');card.id='salesSpecialPricing';card.className='card';
    card.innerHTML=`
      <div class="statusLine"><div><h3>Special Pricing / Order Override</h3><div class="muted">Salesperson-controlled pricing for the active Job / Order. Company defaults remain in Settings.</div></div><span class="tag">Sales Decision</span></div>
      <div id="specialPricingJob" class="notice" style="margin-top:12px"></div>
      <div class="formgrid" style="margin-top:12px">
        <div><label>Special Pricing Reason</label><select id="specialPricingReason"><option value="">Standard / No special pricing</option>${REASONS.map(x=>`<option>${esc(x)}</option>`).join('')}</select></div>
        <div><label>Applied Markup %</label><input id="specialPricingMarkup" type="number" inputmode="decimal" step="0.1" placeholder="Enter actual markup"></div>
        <div class="full"><label>Invoice Note / Explanation</label><input id="specialPricingNote" placeholder="e.g. repeat customer / family / senior / contractor"></div>
      </div>
      <div class="muted" style="margin-top:9px">Apply updates all item lines in the active order that have a Cost / Unit. Items without known cost keep their existing selling price and are flagged in the result.</div>
      <div class="actions"><button class="action" id="specialPricingOpenJob">Open Active Job</button><button class="action primary" id="specialPricingApply">Apply to Active Order</button></div>
      <div id="specialPricingResult" class="muted" style="margin-top:8px"></div>`;
    if(team)team.insertAdjacentElement('beforebegin',card);else sales.appendChild(card);
    by('specialPricingReason').addEventListener('change',()=>{const r=by('specialPricingReason').value;if(r&&!by('specialPricingNote').value)by('specialPricingNote').value=r});
    by('specialPricingOpenJob').addEventListener('click',()=>{if(currentJob())go('jobs');else alert('Select or create a Job / Order first.')});
    by('specialPricingApply').addEventListener('click',applySpecialPricing);
    refreshCard();
  }

  function refreshCard(){
    const box=by('specialPricingJob');if(!box)return;const j=currentJob();
    if(!j){box.innerHTML='<b>No active Job / Order.</b><br>Select or create a Job before applying special pricing.';return}
    const reasons=[...new Set((j.items||[]).map(x=>String(x.overrideReason||'').trim()).filter(Boolean))];
    const markups=[...new Set((j.items||[]).map(x=>x.markupPct).filter(v=>v!==''&&v!=null).map(Number))];
    box.innerHTML=`<b>${esc(j.jobNumber||'New Job')} · ${esc(j.customerName||'Unnamed customer')}</b><br>Sales Rep: ${esc(j.salesRep||'Unassigned')} · ${j.items?.length||0} item line(s)${reasons.length?' · Current special note: '+esc(reasons.join('; ')):''}`;
    if(reasons.length===1){by('specialPricingReason').value=REASONS.includes(reasons[0])?reasons[0]:'Other / Custom';by('specialPricingNote').value=reasons[0]}
    if(markups.length===1)by('specialPricingMarkup').value=markups[0];
  }

  function applySpecialPricing(){
    const j=currentJob();if(!j){alert('Select or create a Job / Order first.');return}
    const reason=String(by('specialPricingReason').value||'').trim();
    const note=String(by('specialPricingNote').value||reason).trim();
    const raw=by('specialPricingMarkup').value;
    if(!reason&&!note&&!raw){alert('Choose a special pricing reason or enter the actual markup.');return}
    if(raw===''){alert('Enter the actual markup percentage for this order.');return}
    const markup=Number(raw);if(!Number.isFinite(markup)||markup<-100){alert('Enter a valid markup percentage.');return}
    let updated=0,missing=0;
    (j.items||[]).forEach(x=>{
      x.defaultMarkupPct=(x.defaultMarkupPct===undefined?x.markupPct:x.defaultMarkupPct);
      x.markupPct=markup;x.overrideReason=note||reason;x.pricingProfile='custom';
      const cost=num(x.cost),q=qty(x.qty);
      if(cost>0){x.price=Number((cost*(1+markup/100)).toFixed(2));if(q)x.total=Number((x.price*q).toFixed(2));updated++}else missing++;
    });
    j.specialPricingReason=reason||'Custom';j.specialPricingNote=note||reason;j.specialPricingMarkup=markup;
    try{if(typeof saveStore==='function')saveStore();if(typeof renderAll==='function')renderAll();if(typeof window.renderSales==='function')window.renderSales()}catch(_){ }
    by('specialPricingResult').innerHTML=`<b>Special pricing saved.</b> ${updated} item line(s) recalculated at ${markup}% markup.${missing?' '+missing+' item line(s) had no Cost / Unit, so their selling price was left unchanged.':''} The note will carry to the Deerfoot invoice.`;
    refreshCard();
  }

  function hookSales(){
    if(window.__runluSalesSpecialPricingV011)return;window.__runluSalesSpecialPricingV011=true;
    ensureCard();
    const oldRender=window.renderSales;if(typeof oldRender==='function'&&!oldRender.__specialPricingWrapped){const wrapped=function(){const r=oldRender.apply(this,arguments);ensureCard();refreshCard();return r};wrapped.__specialPricingWrapped=true;window.renderSales=wrapped}
    document.title='RUNLU Deerfoot Flooring OS V0.3.10';const pill=document.querySelector('header .pill');if(pill)pill.textContent='V0.3.10 Sales Special Pricing';
  }
  function boot(){setTimeout(hookSales,80);setTimeout(()=>{ensureCard();refreshCard()},220)}
  if(document.readyState==='loading')window.addEventListener('load',boot);else boot();
})();