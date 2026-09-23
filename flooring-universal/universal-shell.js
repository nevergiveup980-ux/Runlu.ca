/* RUNLU Flooring OS Universal · U0 shell */
(function(){
'use strict';
const STORE='runlu_flooring_universal_u0_workspace';
const $=id=>document.getElementById(id);
const read=()=>window.RUNLUUniversalData.read(STORE,null);
const write=v=>window.RUNLUUniversalData.write(STORE,v);
const slug=s=>String(s||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48);
function fill(c){if(!c)return;$('legalName').value=c.company?.legalName||'';$('displayName').value=c.company?.displayName||'';$('abbreviation').value=c.company?.abbreviation||'';$('country').value=c.company?.country||'CA';$('region').value=c.company?.region||'';$('currency').value=c.company?.currency||'CAD';$('locationName').value=c.location?.name||'';$('locationType').value=c.location?.type||'store'}
function render(c){const ready=window.RUNLUFlooringUniversal.tenantReady(c);$('command').hidden=!ready;$('tenantPill').textContent=ready?(c.company.displayName||c.company.legalName).toUpperCase():'COMPANY SETUP';$('setupState').className=ready?'ok':'warn';$('setupState').textContent=ready?'Universal workspace ready. Data mode: Local Device. Cloud remains optional.':'Company configuration has not been created yet.';if(ready){$('commandTitle').textContent=(c.company.displayName||c.company.legalName)+' · Command Center';$('commandMeta').textContent=[c.location.name,c.company.region,c.company.country,c.company.currency].filter(Boolean).join(' · ')}}
$('saveSetup').addEventListener('click',()=>{const legal=$('legalName').value.trim(),display=$('displayName').value.trim()||legal,loc=$('locationName').value.trim();if(!legal||!loc)return alert('Enter the legal company name and first location.');const org='org-'+slug(legal),lid='loc-'+slug(loc);const c=window.RUNLUFlooringUniversal.createConfig({company:{organizationId:org,legalName:legal,displayName:display,abbreviation:$('abbreviation').value.trim().toUpperCase(),country:$('country').value,region:$('region').value.trim(),currency:$('currency').value},location:{locationId:lid,name:loc,type:$('locationType').value}});write(c);window.RUNLUUniversalDataVersion?.migrate?.();render(c);setTimeout(()=>window.RUNLUUniversalDeviceReady?.renderMini?.(),500)});
const current=read();if(current)window.RUNLUUniversalDataVersion?.migrate?.();fill(current);render(current);
})();