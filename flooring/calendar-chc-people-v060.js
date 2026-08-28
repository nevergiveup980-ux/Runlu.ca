/* RUNLU Deerfoot Flooring OS · V0.3.60 CHC People Sub-calendars */
(function(){
'use strict';
if(window.__runluCHCPeople060)return;window.__runluCHCPeople060=true;
const GS='runlu_calendar_groups_v056',ME='runlu_calendar_manual_events_v056';
const PEOPLE=[
  {name:'Alana',color:'#c98a72'},
  {name:'Emrah',color:'#a45d91'},
  {name:'Faith',color:'#c66aa6'},
  {name:'Nechi',color:'#d692b6'},
  {name:'Others',color:'#7f778c'}
];
const COLORS=Object.fromEntries(PEOPLE.map(x=>[x.name,x.color]));
const $=s=>document.querySelector(s);
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(_){return f}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const attr=v=>esc(v).replace(/"/g,'&quot;');
let obs=null,timer=null,busy=false;
function state(){const s=read(GS,{})||{};s.groups=s.groups||{};s.subs=s.subs||{};s.subs.chc=s.subs.chc||{};PEOPLE.forEach(p=>{if(typeof s.subs.chc[p.name]!=='boolean')s.subs.chc[p.name]=true});return s}
function saveState(s){write(GS,{...s,updatedAt:new Date().toISOString()})}
function events(){const x=read(ME,[]);return Array.isArray(x)?x:[]}
function normalizeCHC(){let a=events(),changed=false;a=a.map(m=>{if(!m)return m;const g=String(m.calendarGroup||m.group||'');if(g!=='chc')return m;let sub=String(m.subCalendar||m.sub||'').trim();if(!sub||sub==='CHC'||sub==='Other')sub='Others';if(!COLORS[sub])sub='Others';const n={...m,group:'chc',calendarGroup:'chc',sub,subCalendar:sub,assignedTo:String(m.assignedTo||sub),color:COLORS[sub]};if(JSON.stringify(n)!==JSON.stringify(m))changed=true;return n});if(changed)write(ME,a);return changed}
function count(name){return events().filter(m=>String(m.calendarGroup||m.group||'')==='chc'&&String(m.subCalendar||m.sub||'')===name).length}
function style(){if($('#r60style'))return;const s=document.createElement('style');s.id='r60style';s.textContent=`
[data-r56-group="chc"] .r60person{display:block;border-radius:3px;padding:3px 5px;color:#fff;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.r60hint{padding:4px 5px 5px 18px;font-size:7.5px;color:#75827c;background:#fbfcfb}.r60chcopt{font-weight:700}
`;document.head.appendChild(s)}
function checked(name){return state().subs.chc?.[name]!==false}
function decorateSide(){const g=$('[data-r56-group="chc"]');if(!g)return;style();const title=g.querySelector('.r56ghead b');if(title&&title.textContent!=='CHC')title.textContent='CHC';let subs=g.querySelector('.r56subs');if(!subs){subs=document.createElement('div');subs.className='r56subs';g.appendChild(subs)}const gs=state().groups.chc||{};subs.style.display=gs.expanded===false?'none':'block';const wanted=PEOPLE.map(p=>p.name).join('|');if(subs.dataset.r60People===wanted&&subs.querySelectorAll('[data-r60-chc-sub]').length===PEOPLE.length){PEOPLE.forEach(p=>{const el=subs.querySelector(`[data-r60-chc-sub="${CSS.escape(p.name)}"]`);if(el)el.checked=checked(p.name);const c=subs.querySelector(`[data-r60-count="${CSS.escape(p.name)}"]`);if(c){const v=String(count(p.name));if(c.textContent!==v)c.textContent=v}});return}
subs.dataset.r60People=wanted;subs.innerHTML=PEOPLE.map(p=>`<label class="r56sub r60chcrow"><input type="checkbox" data-r60-chc-sub="${attr(p.name)}"${checked(p.name)?' checked':''}><span class="dot" style="background:${attr(p.color)}"></span><span class="r60person" style="background:${attr(p.color)}">${esc(p.name)}</span><small data-r60-count="${attr(p.name)}">${count(p.name)}</small></label>`).join('')+`<div class="r60hint">CHC person = <b>subCalendar</b> + <b>assignedTo</b> in the same Calendar event record.</div>`}
function addOptions(sel){if(!sel)return;const current=sel.value;[...sel.options].filter(o=>String(o.value).startsWith('chc|')).forEach(o=>o.remove());PEOPLE.forEach(p=>{const o=document.createElement('option');o.value='chc|'+p.name;o.textContent='CHC · '+p.name;o.className='r60chcopt';sel.appendChild(o)});if([...sel.options].some(o=>o.value===current))sel.value=current;else if(current.startsWith('chc|'))sel.value='chc|Others'}
function augmentEditors(){addOptions($('#r56cal'));addOptions($('#r57mcal'))}
function syncAssigned(){let a=events(),changed=false;a=a.map(m=>{if(!m)return m;const g=String(m.calendarGroup||m.group||'');if(g!=='chc')return m;let sub=String(m.subCalendar||m.sub||'Others');if(!COLORS[sub])sub='Others';const n={...m,group:'chc',calendarGroup:'chc',sub,subCalendar:sub,assignedTo:sub,color:COLORS[sub]};if(JSON.stringify(n)!==JSON.stringify(m))changed=true;return n});if(changed)write(ME,a);return changed}
function rerender(){try{window.RUNLUCalendarGroupsV056?.render?.()}catch(_){ }setTimeout(()=>{decorateSide();augmentEditors()},90)}
function bind(){if(document.documentElement.dataset.r60bound)return;document.documentElement.dataset.r60bound='1';document.addEventListener('change',e=>{const inp=e.target.closest?.('[data-r60-chc-sub]');if(!inp)return;const s=state();s.subs.chc[inp.dataset.r60ChcSub]=!!inp.checked;saveState(s);rerender()},true);document.addEventListener('click',e=>{if(e.target.closest?.('#r56new,#r56save,#r57save,[data-r56-event],[data-job],[data-install-job],[data-r55-job]'))setTimeout(()=>{syncAssigned();augmentEditors();decorateSide()},70)},true);window.addEventListener('storage',e=>{if(e.key===GS||e.key===ME)setTimeout(sync,30)})}
function observe(){if(obs)obs.disconnect();const root=$('#installerCalendarV053')||$('#install');if(!root)return;obs=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(sync,45)});obs.observe(root,{childList:true,subtree:true})}
function sync(){if(busy)return;busy=true;try{normalizeCHC();decorateSide();augmentEditors()}finally{busy=false}}
function install(){style();normalizeCHC();bind();sync();observe();setTimeout(sync,350);setTimeout(sync,1000)}
window.RUNLUCHCPeopleV060={install,render:sync,people:PEOPLE.map(x=>x.name)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,360),{once:true});else setTimeout(install,360);
})();