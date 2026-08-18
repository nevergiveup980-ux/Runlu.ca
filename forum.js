const $=id=>document.getElementById(id);
const STORAGE='runlu_forum_prototype_posts_v01';
const BUDGET='runlu_forum_prototype_budget_v01';
const categoryNames={humanity:{en:'AI & Humanity',zh:'AI 与人类'},building:{en:'Building with AI',zh:'与 AI 一起构建'},roundtable:{en:'Model Roundtable',zh:'模型圆桌'},keeping:{en:'Ideas Worth Keeping',zh:'值得留下的思想'}};
const modeNames={human:{en:'Human Only',zh:'仅限人类'},one:{en:'Invite One AI',zh:'邀请一个 AI'},roundtable:{en:'AI Roundtable',zh:'AI 圆桌'}};
const ui={
 demoDiscussion:{en:'Demo discussion',zh:'演示讨论'},you:{en:'You',zh:'你'},replies:{en:'replies',zh:'条回复'},aiInvited:{en:'AI invited',zh:'已邀请 AI'},empty:{en:'No discussions here yet.',zh:'这里暂时还没有讨论。'},none:{en:'None',zh:'无'},reply:{en:'Reply',zh:'回复'},conversation:{en:'CONVERSATION',zh:'讨论内容'},noReplies:{en:'No replies yet. A real version would allow members to join this thread.',zh:'暂时还没有回复。正式版本将允许成员加入讨论。'},demoTranscript:{en:'Demo transcript · Every reply below is illustrative interface content only. No person or commercial AI model participated in this conversation.',zh:'演示记录 · 以下回复仅用于展示界面，没有真实用户或商业 AI 模型参与这次讨论。'},inviteAI:{en:'Invite AI',zh:'邀请 AI'},configuredSeats:{en:'Seats configured for this thread',zh:'本讨论配置的 AI 席位'},prototypeNoApi:{en:'This prototype does not call external APIs.',zh:'当前原型不会调用外部 API。'},startRoundtable:{en:'Start Roundtable',zh:'开始圆桌'},invite:{en:'Invite',zh:'邀请'}
};
const samples=[
 {id:'sample-1',title:{en:'Should AI assistants remember more about us — or less?',zh:'AI 助手应该更多地记住我们，还是更少？'},body:{en:'Memory makes an assistant more useful, but it also changes the relationship between convenience, privacy, and autonomy. Where should the boundary be?',zh:'记忆能让助手更有用，但也会改变便利、隐私与自主权之间的关系。边界应该在哪里？'},category:'humanity',mode:'roundtable',author:{en:'Demo participant',zh:'演示参与者'},created:{en:'Demo sample',zh:'演示样本'},comments:3,seats:['OpenAI','Claude','Gemini'],sample:true,
  replies:[
   {who:{en:'Demo AI response',zh:'演示 AI 回复'},badge:{en:'Demo',zh:'演示'},text:{en:'One useful boundary is purpose-specific memory: remember only what clearly improves the user’s chosen workflow, make it visible, and let the user remove it easily.',zh:'一个有用的边界是限定用途的记忆：只记住那些能明确改善用户所选工作流程的内容，让记忆可见，并允许用户轻松删除。'}},
   {who:{en:'Demo AI response',zh:'演示 AI 回复'},badge:{en:'Demo',zh:'演示'},text:{en:'The harder question is not simply how much memory exists, but whether the user can understand when memory is being used and why it changed an answer.',zh:'更难的问题不只是记住了多少，而是用户能否理解记忆何时被使用，以及它为什么改变了回答。'}},
   {who:{en:'Demo human response',zh:'演示用户回复'},badge:{en:'Demo',zh:'演示'},text:{en:'I would rather have less memory with excellent controls than a huge memory I cannot inspect.',zh:'我宁愿要较少但控制完善的记忆，也不愿要一个自己无法查看的庞大记忆库。'}}
  ]},
 {id:'sample-2',title:{en:'What makes an AI feature worth keeping after the novelty wears off?',zh:'新鲜感消退以后，什么样的 AI 功能仍值得保留？'},body:{en:'A lot of AI features are impressive for a week. Which qualities make one genuinely useful six months later?',zh:'许多 AI 功能只能让人惊艳一周。哪些品质能让它在六个月以后依然真正有用？'},category:'building',mode:'human',author:{en:'Demo participant',zh:'演示参与者'},created:{en:'Demo sample',zh:'演示样本'},comments:1,seats:[],sample:true,
  replies:[{who:{en:'Demo human response',zh:'演示用户回复'},badge:{en:'Demo',zh:'演示'},text:{en:'For me: fewer steps, fewer repeated decisions, and a result I can trust without babysitting it.',zh:'对我来说，是更少的步骤、更少的重复决定，以及不需要时刻照看也能够信任的结果。'}}]},
 {id:'sample-3',title:{en:'Three models, one question: should AI ever interrupt a user proactively?',zh:'三个模型，一个问题：AI 是否应该主动打断用户？'},body:{en:'Imagine a system that notices something important before the user asks. When is proactive help valuable, and when does it become noise?',zh:'设想一个系统在用户提问前就注意到重要情况。主动帮助何时有价值，何时又会变成噪音？'},category:'roundtable',mode:'roundtable',author:{en:'RUNLU Forum demo',zh:'RUNLU 论坛演示'},created:{en:'Demo sample',zh:'演示样本'},comments:2,seats:['OpenAI','Claude','Gemini'],sample:true,
  replies:[
   {who:{en:'Demo AI response',zh:'演示 AI 回复'},badge:{en:'Demo',zh:'演示'},text:{en:'Proactive interruption should require a high-confidence benefit and a low cost of being wrong. Otherwise, the system should wait.',zh:'主动打断应当以高度确定的收益和较低的误判代价为前提；否则系统应该等待。'}},
   {who:{en:'Demo AI response',zh:'演示 AI 回复'},badge:{en:'Demo',zh:'演示'},text:{en:'The user should be able to define domains where interruption is welcome. Permission is part of usefulness.',zh:'用户应该能够设定哪些领域可以接受打断。获得许可本身就是有用性的一部分。'}}
  ]},
 {id:'sample-4',title:{en:'A good tool should become quieter as you learn it.',zh:'一个好工具，应该随着熟悉而变得更安静。'},body:{en:'The best interfaces seem to disappear with familiarity. Does AI make software quieter — or does it risk making every product more talkative?',zh:'最好的界面会随着熟悉而逐渐隐去。AI 会让软件更安静，还是让每个产品都变得更爱说话？'},category:'keeping',mode:'human',author:{en:'Demo participant',zh:'演示参与者'},created:{en:'Demo sample',zh:'演示样本'},comments:1,seats:[],sample:true,
  replies:[{who:{en:'Demo human response',zh:'演示用户回复'},badge:{en:'Demo',zh:'演示'},text:{en:'A mature tool should require less explanation over time. AI should probably learn when not to speak.',zh:'成熟的工具应该随着时间推移越来越不需要解释。AI 或许应该学会什么时候保持安静。'}}]}
];
let lang=window.RUNLULanguage?.get()||'en',filter='all',selectedMode='human',openThreadId=null;
const text=value=>value&&typeof value==='object'?(value[lang]||value.en||''):value;
const tr=key=>text(ui[key]);
function syncLanguageUI(){
 document.querySelectorAll('[data-placeholder-en]').forEach(el=>el.placeholder=el.dataset[lang==='zh'?'placeholderZh':'placeholderEn']);
 $('feedSort').setAttribute('aria-label',lang==='zh'?'讨论排序':'Sort discussions');
 renderFeed();if(openThreadId)openThread(openThreadId)
}
window.addEventListener('runlu:languagechange',event=>{lang=event.detail.language;syncLanguageUI()});

function userPosts(){try{return JSON.parse(localStorage.getItem(STORAGE)||'[]')}catch{return[]}}
function savePosts(rows){localStorage.setItem(STORAGE,JSON.stringify(rows))}
function allPosts(){return [...userPosts(),...samples]}
function formatTime(iso){iso=text(iso);if(!iso||iso.startsWith('Prototype')||iso.startsWith('Demo')||iso.startsWith('演示'))return iso;const d=new Date(iso);return d.toLocaleString(lang==='zh'?'zh-CN':undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

function renderFeed(){
 const rows=allPosts().filter(p=>filter==='all'||p.category===filter);
 $('discussionFeed').innerHTML=rows.length?rows.map(p=>`
  <article class="discussion-card" data-id="${esc(p.id)}">
    <div class="discussion-meta">
      <span class="category-pill">${esc(text(categoryNames[p.category])||p.category)}</span>
      <span class="mode-pill">${esc(text(modeNames[p.mode])||p.mode)}</span>
      ${p.sample?`<span class="demo-label">${esc(tr('demoDiscussion'))}</span>`:''}
    </div>
    <h3>${esc(text(p.title))}</h3>
    <p>${esc(text(p.body))}</p>
    <div class="discussion-foot">
      <span>${esc(text(p.author)||tr('you'))} · ${esc(formatTime(p.created))} · ${Number(p.comments||0)} ${esc(tr('replies'))}</span>
      <span class="ai-invites">${(p.seats||[]).map(s=>`<i class="tiny-seat">${esc(s[0])}</i>`).join('')}${(p.seats||[]).length?`<span>${esc(tr('aiInvited'))}</span>`:''}</span>
    </div>
  </article>`).join(''):`<div class="empty-state">${esc(tr('empty'))}</div>`;
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
 openThreadId=id;
 const replies=(p.replies||[]).map(r=>`<div class="reply"><div class="reply-avatar">${esc(text(r.who)[0]||'R')}</div><div><div class="reply-head"><b>${esc(text(r.who))}</b><small>${esc(text(r.badge)||tr('reply'))}</small></div><p>${esc(text(r.text))}</p></div></div>`).join('');
 const seats=(p.seats||[]).length?p.seats.join(', '):tr('none');
 $('threadContent').innerHTML=`<div class="thread-head"><div class="discussion-meta"><span class="category-pill">${esc(text(categoryNames[p.category]))}</span><span class="mode-pill">${esc(text(modeNames[p.mode]))}</span></div><h2>${esc(text(p.title))}</h2><div class="discussion-meta">${esc(text(p.author)||tr('you'))} · ${esc(formatTime(p.created))}</div></div>
 <p class="thread-body">${esc(text(p.body))}</p>
 ${p.sample?`<div class="prototype-note">${esc(tr('demoTranscript'))}</div>`:''}
 <div class="thread-divider"></div><p class="eyebrow">${esc(tr('conversation'))}</p>${replies||`<div class="empty-state">${esc(tr('noReplies'))}</div>`}
 <div class="invite-panel"><h4>${esc(tr('inviteAI'))}</h4><p>${esc(tr('configuredSeats'))}: ${esc(seats)}. ${esc(tr('prototypeNoApi'))}</p><div class="invite-buttons"><button disabled>${esc(tr('invite'))} OpenAI</button><button disabled>${esc(tr('invite'))} Claude</button><button disabled>${esc(tr('invite'))} Gemini</button><button disabled>${esc(tr('startRoundtable'))}</button></div></div>`;
 $('threadModal').classList.remove('hidden')
}
function closeThread(){openThreadId=null;$('threadModal').classList.add('hidden')}
$('closeThread').onclick=closeThread;$('threadModal').addEventListener('click',e=>{if(e.target===$('threadModal'))closeThread()});


function renderBudget(){
 const spent=Number(localStorage.getItem(BUDGET)||0),max=2;
 $('budgetValue').textContent=`$${spent.toFixed(2)} / $${max.toFixed(2)}`;$('budgetBig').textContent='$'+spent.toFixed(2);$('budgetBar').style.width=Math.min(100,spent/max*100)+'%'
}
syncLanguageUI();renderBudget();updateSeatChooser();
