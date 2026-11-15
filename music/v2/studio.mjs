import {openLibrary,transact,validateAudio,filename,storedAudioBlob} from './library.mjs';
const $=id=>document.getElementById(id),urls=new Set();let db;
const status=message=>{$('status').textContent=message;};
function clearURLs(){for(const url of urls)URL.revokeObjectURL(url);urls.clear();}
window.addEventListener('pagehide',clearURLs);
async function render(selected){
 const rows=await transact(db,'readonly',s=>s.getAll());clearURLs();$('songs').replaceChildren();
 if(!rows.length){$('songs').textContent='尚无歌曲。导入现有 MP3 即可开始免费测试。';return;}
 for(const row of rows.sort((a,b)=>b.createdAt.localeCompare(a.createdAt))){
  const card=document.createElement('article'),heading=document.createElement('h3'),meta=document.createElement('small'),audio=document.createElement('audio'),button=document.createElement('button'),saveLink=document.createElement('a'),message=document.createElement('p');
  heading.textContent=`${row.title} · ${row.version}`;
  meta.textContent=`Song ID: ${row.id} · ${new Date(row.createdAt).toLocaleString()} · ${(row.duration/60|0)}:${String(Math.floor(row.duration%60)).padStart(2,'0')} · ${row.generationStatus} · 本机已保存`;
  const url=URL.createObjectURL(storedAudioBlob(row.audio));urls.add(url);audio.src=url;audio.controls=true;audio.preload='metadata';audio.setAttribute('aria-label',heading.textContent);
  audio.onplay=()=>{document.querySelectorAll('audio').forEach(other=>{if(other!==audio)other.pause();});};
  audio.onerror=()=>{message.textContent='音频不可用或文件损坏，请重新导入原始 MP3。';};
  saveLink.hidden=true;saveLink.textContent='未开始下载？点此打开或保存 MP3';saveLink.target='_blank';saveLink.rel='noopener';
  button.textContent='Download MP3';message.setAttribute('role','status');
  button.onclick=async()=>{
   button.disabled=true;
   try {
    const latest=await transact(db,'readonly',s=>s.get(row.id));
    const downloadBlob=storedAudioBlob(latest?.audio);
    if(!downloadBlob.size)throw Error('歌曲文件不可用，请重新导入。');
    const downloadURL=URL.createObjectURL(downloadBlob);urls.add(downloadURL);
    const a=document.createElement('a');a.href=downloadURL;a.download=filename(row.title,row.version);saveLink.href=downloadURL;saveLink.download=a.download;saveLink.hidden=false;document.body.append(a);a.click();a.remove();
    // Browsers cannot report whether a user actually saved a file.
    latest.downloadStatus='requested';await transact(db,'readwrite',s=>s.put(latest));
    message.textContent='已发起下载。Safari 如显示预览，可分享并存储到“文件”。请确认文件已保存。';
   } catch(error){message.textContent=`下载失败：${error.message}`;}finally{button.disabled=false;}
  };
  message.textContent=row.downloadStatus==='requested'?'此前已发起下载（实际保存需自行确认）。':'尚未下载';
  card.append(heading,meta,audio,button,saveLink,message);$('songs').append(card);
  if(row.id===selected){card.scrollIntoView({block:'nearest'});}
 }
}
$('import').onsubmit=async event=>{
 event.preventDefault();$('save').disabled=true;
 try {
  if(!db)throw Error('歌曲库不可用，请检查浏览器存储设置。');
  const title=$('title').value.trim();if(!title)throw Error('请输入歌曲名称。');
  status('正在验证并保存 MP3…');const file=$('file').files[0],duration=await validateAudio(file),id=crypto.randomUUID();
  // ArrayBuffer also works in Safari private/ephemeral IndexedDB.
  const audioBytes=await file.arrayBuffer();
  await transact(db,'readwrite',s=>s.add({id,title,version:$('version').value,createdAt:new Date().toISOString(),generationStatus:'imported',audioReference:`indexeddb:${id}`,audio:audioBytes,duration,downloadStatus:'not_requested'}));
  await render(id);status('已保存到本机。可直接试听、下载，刷新后重播。');
 }catch(error){status(error.message);}finally{$('save').disabled=false;}
};
try{db=await openLibrary();await render();status('本机歌曲库已就绪 · 免费测试模式');}catch(error){status(error.message);$('save').disabled=true;}

// Read-only V2 recipe integration; never creates a job or calls a provider.
$('recipe-load').onclick=async()=>{
 $('recipe-load').disabled=true;$('recipe-status').textContent='正在载入 V2 配置…';
 try {
  const response=await fetch('/music-studio-tools/when-the-lights-go-down-v2.json',{cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error('配置文件暂不可用，请稍后重试。');
  const project=await response.json();
  if(project.version!=='V2'||project.voice!=='duet'||project.style!=='blues_pop'||project.language!=='en'
    ||typeof project.title!=='string'||project.title.length>120||typeof project.lyrics!=='string'||project.lyrics.length>10000
    ||typeof project.notes!=='string'||project.notes.length>2000)throw Error('V2 配置不完整，未载入。');
  $('recipe-meta').textContent=project.title+' · V2 · English · 男中低音 / 女中音对唱';
  $('recipe-lyrics').textContent=project.lyrics;$('recipe-notes').textContent=project.notes;
  $('recipe-view').hidden=false;$('recipe-view').open=true;
  $('recipe-status').textContent='V2 配置已载入，仅供查看；未生成音频，不会覆盖 V1。';
 }catch(error){$('recipe-view').hidden=true;$('recipe-status').textContent='载入失败：'+error.message;}
 finally{$('recipe-load').disabled=false;}
};
