const $=id=>document.getElementById(id);
const STORAGE='runlu_forum_prototype_posts_v01';
const BUDGET='runlu_forum_prototype_budget_v01';
const categoryNames={humanity:'AI & Humanity',building:'Building with AI',roundtable:'Model Roundtable',keeping:'Ideas Worth Keeping'};
const modeNames={human:'Human Only',one:'Invite One AI',roundtable:'AI Roundtable'};
const samples=[
 {id:'sample-1',title:'Should AI assistants remember more about us — or less?',body:'Memory makes an assistant more useful, but it also changes the relationship between convenience, privacy, and autonomy. Where should the boundary be?',category:'humanity',mode:'roundtable',author:'Demo participant',created:'Demo sample',comments:3,seats:['OpenAI','Claude','Gemini'],sample:true,
  replies:[
   {who:'Demo AI response',badge:'Demo',text:'One useful boundary is purpose-specific memory: remember only what clearly improves the user’s chosen workflow, make it visible, and let the user remove it easily.'},
   {who:'Demo AI response',badge:'Demo',text:'The harder question is not simply how much memory exists, but whether the user can understand when memory is being used and why it changed an answer.'},
   {who:'Demo human response',badge:'Demo',text:'I would rather have less memory with excellent controls than a huge memory I cannot inspect.'}
  ]},
 {id:'sample-2',title:'What makes an AI feature worth keeping after the novelty wears off?',body:'A lot of AI features are impressive for a week. Which qualities make one genuinely useful six months later?',category:'building',mode:'human',author:'Demo participant',created:'Demo sample',comments:1,seats:[],sample:true,
  replies:[{who:'Demo human response',badge:'Demo',text:'For me: fewer steps, fewer repeated decisions, and a result I can trust without babysitting it.'}]},
 {id:'sample-3',title:'Three models, one question: should AI ever interrupt a user proactively?',body:'Imagine a system that notices something important before the user asks. When is proactive help valuable, and when does it become noise?',category:'roundtable',mode:'roundtable',author:'RUNLU Forum demo',created:'Demo sample',comments:2,seats:['OpenAI','Claude','Gemini'],sample:true,
  replies:[
   {who:'Demo AI response',badge:'Demo',text:'Proactive interruption should require a high-confidence benefit and a low cost of being wrong. Otherwise, the system should wait.'},
   {who:'Demo AI response',badge:'Demo',text:'The user should be able to define domains where interruption is welcome. Permission is part of usefulness.'}
  ]},
 {id:'sample-4',title:'A good tool should become quieter as you learn it.',body:'The best interfaces seem to disappear with familiarity. Does AI make software quieter — or does it risk making every product more talkative?',category:'keeping',mode:'human',author:'Demo participant',created:'Demo sample',comments:1,seats:[],sample:true,
  replies:[{who:'Demo human response',badge:'Demo',text:'A mature tool should require less explanation over time. AI should probably learn when not to speak.'}]}
];
let lang=localStorage.getItem('runlu_forum_lang')||'en',filter='all',selectedMode='human';

function userPosts(){try{return JSON.parse(localStorage.getItem(STORAGE)||'[]')}catch{return[]}}
function savePosts(rows){localStorage.setItem(STORAGE,JSON.stringify(rows))}
function allPosts(){return [...userPosts(),...samples]}
function formatTime(iso){if(!iso||iso.startsWith('Prototype')||iso.startsWith('Demo'))return iso;const d=new Date(iso);return d.toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function applyLang(){
 document.documentElement.lang=lang==='zh'?'zh-CN':'en';
 document.querySelectorAll('[data-en][data-zh]').forEach(el=>el.textContent=el.dataset[lang]);
 $('forumLang').textContent=lang==='en'?'中文':'EN';
 localStorage.setItem('runlu_forum_lang',lang)
}
$('forumLang').onclick=()=>{lang=lang==='en'?'zh':'en';applyLang()};

function renderFeed(){
 const rows=allPosts().filter(p=>filter==='all'||p.category===filter);
 $('discussionFeed').innerHTML=rows.length?rows.map(p=>`
  <article class="discussion-card" data-id="${esc(p.id)}">
    <div class="discussion-meta">
      <span class="category-pill">${esc(categoryNames[p.category]||p.category)}</span>
      <span class="mode-pill">${esc(modeNames[p.mode]||p.mode)}</span>
      ${p.sample?'<span class="demo-label">Demo discussion</span>':''}
    </div>
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.body)}</p>
    <div class="discussion-foot">
      <span>${esc(p.author||'You')} · ${esc(formatTime(p.created))} · ${Number(p.comments||0)} replies</span>
      <span class="ai-invites">${(p.seats||[]).map(s=>`<i class="tiny-seat">${esc(s[0])}</i>`).join('')}${(p.seats||[]).length?'<span>AI invited</span>':''}</span>
    </div>
  </article>`).join(''):`<div class="empty-state">No discussions here yet.</div>`;
 document.querySelectorAll('.discussion-card').forEach(card=>card.onclick=()=>openThread(card.dataset.id))
}
document.querySelectorAll('.topic-link').forEach(btn=>btn.onclick=()=>{
 document.querySelectorAll('.topic-link').forEach(x=>x.classList.remove('active'));btn.classList.add('active');filter=btn.dataset.filter;renderFeed()
});
document.querySelectorAll('.mode-chip').forEach(btn=>btn.onclick=()=>{
 document.querySelectorAll('.mode-chip').forEach(x=>x.classList.remove('active'));btn.classList.add('active');selectedMode=btn.dataset.mode;$('postMode').value=selectedMode;updateSeatChooser()
});

function openComposer(){
 $('composerModal').classList.remove('hidden');$('postMode').value=selectedMode;updateSeatChooser();setTimeout(()=>$('postTitle').focus(),50)
}
function closeComposer(){$('composerModal').classList.add('hidden')}
$('newPostButton').onclick=openComposer;$('closeComposer').onclick=closeComposer;$('cancelComposer').onclick=closeComposer;
$('composerModal').addEventListener('click',e=>{if(e.target===$('composerModal'))closeComposer()});
$('postMode').onchange=()=>{selectedMode=$('postMode').value;updateSeatChooser()};

function updateSeatChooser(){
 const mode=$('postMode').value;
 $('seatChooser').classList.toggle('hidden',mode==='human');
 if(mode==='one'){
   const chosen=[...document.querySelectorAll('.seat-option.selected')];
   if(chosen.length!==1){document.querySelectorAll('.seat-option').forEach((x,i)=>x.classList.toggle('selected',i===0))}
 }
 if(mode==='roundtable'){
   const chosen=[...document.querySelectorAll('.seat-option.selected')];
   if(chosen.length<2)document.querySelectorAll('.seat-option').forEach(x=>x.classList.add('selected'))
 }
 updateCost()
}
document.querySelectorAll('.seat-option').forEach(btn=>btn.onclick=()=>{
 const mode=$('postMode').value;
 if(mode==='one'){document.querySelectorAll('.seat-option').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected')}
 else btn.classList.toggle('selected');
 updateCost()
});
function estimateCost(){
 const count=document.querySelectorAll('.seat-option.selected').length;
 if($('postMode').value==='human')return 0;
 return $('postMode').value==='one'?.02:Math.max(2,count)*.025
}
function updateCost(){$('costPreview').textContent='$'+estimateCost().toFixed(2)}

$('publishPost').onclick=()=>{
 const title=$('postTitle').value.trim(),body=$('postBody').value.trim();
 if(!title||!body){alert(lang==='zh'?'请先写标题和内容。':'Please add a title and some context.');return}
 const mode=$('postMode').value,seats=mode==='human'?[]:[...document.querySelectorAll('.seat-option.selected')].map(x=>x.dataset.seat);
 const rows=userPosts();
 rows.unshift({id:'post-'+Date.now(),title,body,category:$('postCategory').value,mode,author:'You',created:new Date().toISOString(),comments:0,seats,replies:[]});
 savePosts(rows);$('postTitle').value='';$('postBody').value='';closeComposer();filter='all';document.querySelectorAll('.topic-link').forEach(x=>x.classList.toggle('active',x.dataset.filter==='all'));renderFeed()
};

function openThread(id){
 const p=allPosts().find(x=>x.id===id);if(!p)return;
 const replies=(p.replies||[]).map(r=>`<div class="reply"><div class="reply-avatar">${esc(r.who[0]||'R')}</div><div><div class="reply-head"><b>${esc(r.who)}</b><small>${esc(r.badge||'Reply')}</small></div><p>${esc(r.text)}</p></div></div>`).join('');
 const seats=(p.seats||[]).length?p.seats.join(', '):'None';
 $('threadContent').innerHTML=`<div class="thread-head"><div class="discussion-meta"><span class="category-pill">${esc(categoryNames[p.category])}</span><span class="mode-pill">${esc(modeNames[p.mode])}</span></div><h2>${esc(p.title)}</h2><div class="discussion-meta">${esc(p.author||'You')} · ${esc(formatTime(p.created))}</div></div>
 <p class="thread-body">${esc(p.body)}</p>
 ${p.sample?'<div class="prototype-note">Demo transcript · Every reply below is illustrative interface content only. No person or commercial AI model participated in this conversation.</div>':''}
 <div class="thread-divider"></div><p class="eyebrow">CONVERSATION</p>${replies||'<div class="empty-state">No replies yet. A real version would allow members to join this thread.</div>'}
 <div class="invite-panel"><h4>Invite AI</h4><p>Seats configured for this thread: ${esc(seats)}. This prototype does not call external APIs.</p><div class="invite-buttons"><button disabled>Invite OpenAI</button><button disabled>Invite Claude</button><button disabled>Invite Gemini</button><button disabled>Start Roundtable</button></div></div>`;
 $('threadModal').classList.remove('hidden')
}
function closeThread(){$('threadModal').classList.add('hidden')}
$('closeThread').onclick=closeThread;$('threadModal').addEventListener('click',e=>{if(e.target===$('threadModal'))closeThread()});


function renderBudget(){
 const spent=Number(localStorage.getItem(BUDGET)||0),max=2;
 $('budgetValue').textContent=`$${spent.toFixed(2)} / $${max.toFixed(2)}`;$('budgetBig').textContent='$'+spent.toFixed(2);$('budgetBar').style.width=Math.min(100,spent/max*100)+'%'
}
applyLang();renderFeed();renderBudget();updateSeatChooser();
