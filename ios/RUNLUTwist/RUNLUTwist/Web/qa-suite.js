// Runs unchanged in Node VM and actual WKWebView (DEBUG-only launch argument).
function runTwistQA(){
 const results=[];function check(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:String(e)});}}
 const assert=(v,msg)=>{if(!v)throw Error(msg||'assertion failed')};
 const button=(id,n)=>document.getElementById(id).children[n];
 const click=id=>document.getElementById(id).click();
 // Independently derive solutions from each case's constraints, not the stored answer index.
 const lampOrders=['ABC','ACB','BAC','BCA','CAB','CBA'].filter(x=>x.indexOf('C')===x.indexOf('A')+1&&x.indexOf('B')===1);
 const expected=[['RED','BLUE','GREEN'].indexOf(['RED','BLUE','GREEN'].find(x=>x!=='RED'&&x!=='GREEN')),
 ['Monday','Tuesday','Friday'].indexOf('Tuesday'),lampOrders.length===0?3:-1,
 ['234','243','244','324'].findIndex(x=>+x[0]===2&&+x[2]===2*+x[0]&&+x[1]===+x[2]-1),
 ['9:00','10:00','11:00','No possible time'].findIndex(x=>parseInt(x)>9&&parseInt(x)<11&&parseInt(x)+0.5<10.75),
 [1,2,3,4].findIndex(x=>x%2===0&&x!==4),1,
 ['OLP','LOP','POL','OPL'].findIndex(x=>x.indexOf('O')<x.indexOf('L')&&x.indexOf('L')<x.indexOf('P')),0,
 [36,63,54,72].findIndex(x=>Math.floor(x/10)+x%10===9&&Math.floor(x/10)-x%10===3)];
 check('20 complete bilingual classics',()=>{assert(puzzles.length===20&&zh.length===20);assert([puzzles,zh].every(list=>list.every(p=>p.length===3&&p.every(v=>typeof v==='string'&&v.length>0))));});
 check('10 case answer keys match independently solved constraints',()=>{assert(studioCases.length===10);assert(studioCases.every((v,i)=>v.answer===expected[i]));});
 for(const language of ['en','zh']){
 check(language+' classic reasoning/reflection choices, scoring and review',()=>{
  lang=language;state={index:0,completed:[],hints:[],assessments:{}};reasoningSelections={};reflectionSelections={};render();
  for(let i=0;i<20;i++){
   assert(el('reflection').hidden);assert(el('question').textContent===(lang==='en'?puzzles:zh)[i][0]);
   button('reasoningChoices',i%3).click();assert(reasoningSelections[i]===i%3&&el('reasoningFeedback').textContent.length>10);
   if(i===0)click('hintBtn');click('answerBtn');assert(!el('reflection').hidden);
   button('reflectionChoices',i%3).click();click('gotBtn');assert(reflectionSelections[i]===i%3);if(i<19)click('nextBtn');
  }
  assert(el('points').textContent.endsWith('195'));assert(el('correct').textContent.includes('20 / 20'));assert(el('nextBtn').disabled);click('reviewBtn');assert(state.index===0);click('nextBtn');click('prevBtn');assert(state.index===0);assert(Object.keys(readSelections('twist-reasoning-v1')).length===20);
 });
 check(language+' all 10 studio choices, feedback and explanations',()=>{
  studio={index:0,answers:{}};renderStudio();
  for(let i=0;i<10;i++){
   assert(el('studioPrev').disabled===(i===0));assert(el('studioNext').disabled);
   button('studioOptions',expected[i]).click();assert(studio.answers[i]===expected[i]);
   assert(el('studioResult').textContent.includes(studioCases[i][lang].why));assert(el('studioResult').textContent.startsWith(lang==='en'?'Correct deduction.':'推理正确。'));
   assert([...el('studioOptions').children].every(b=>b.disabled));if(i<9)click('studioNext');
  }
  assert(el('studioScore').textContent.includes('10 / 10'));assert(el('studioNext').disabled);click('studioPrev');assert(studio.index===8);click('studioNext');assert(studio.index===9);
 });
 }
 check('incorrect studio answer remains locked when revisiting',()=>{lang='en';studio={index:0,answers:{}};renderStudio();button('studioOptions',0).click();assert(el('studioScore').textContent==='Correct 0 / 1');assert(el('studioResult').textContent.startsWith('Not quite.'));click('studioNext');click('studioPrev');assert(studio.answers[0]===0&&button('studioOptions',1).disabled);});
 check('language switch keeps all three feature records',()=>{el('language').value='zh';el('language').dispatchEvent(new Event('change'));assert(lang==='zh'&&el('reasoningTitle').textContent.includes('推理实验室'));assert(el('studioTitle').textContent.includes('逻辑'));assert(Object.keys(reasoningSelections).length===20&&Object.keys(reflectionSelections).length===20);});
 // Leave a compact persistent fixture for relaunch verification.
 lang='en';state={index:0,completed:[0],hints:[],assessments:{0:'yes'}};reasoningSelections={0:1};reflectionSelections={0:2};studio={index:9,answers:Object.fromEntries(expected.map((a,i)=>[i,a]))};
 for(const [k,v]of Object.entries({'twist-lang':'en','twist-reasoning-v1':JSON.stringify(reasoningSelections),'twist-reflections-v1':JSON.stringify(reflectionSelections),'twist-studio-v1':JSON.stringify(studio)})){
  if(typeof nativeStorage!=='undefined')nativeStorage.setItem(k,v);else localStorage.setItem(k,v);
 }
 save();render();
 return {passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length,results};
}
