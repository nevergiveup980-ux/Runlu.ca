import {openLibrary,transact,validateAudio,filename} from './library.mjs';
const $=id=>document.getElementById(id),urls=new Set();let db;
const status=message=>{$('status').textContent=message;};
function clearURLs(){for(const url of urls)URL.revokeObjectURL(url);urls.clear();}
window.addEventListener('pagehide',clearURLs);
async function render(selected){
 const rows=await transact(db,'readonly',s=>s.getAll());clearURLs();$('songs').replaceChildren();
 if(!rows.length){$('songs').textContent='尚无歌曲。导入现有 MP3 即可开始免费测试。';return;}
 for(const row of rows.sort((a,b)=>b.createdAt.localeCompare(a.createdAt))){
  const card=document.createElement('article'),heading=document.createElement('h3'),meta=document.createElement('small'),audio=document.createElement('audio'),button=document.createElement('button'),message=document.createElement('p');
  heading.textContent=`${row.title} · ${row.version}`;
  meta.textContent=`Song ID: ${row.id} · ${new Date(row.createdAt).toLocaleString()} · ${(row.duration/60|0)}:${String(Math.floor(row.duration%60)).padStart(2,'0')} · ${row.generationStatus} · 本机已保存`;
  const url=URL.createObjectURL(row.audio);urls.add(url);audio.src=url;audio.controls=true;audio.preload='metadata';audio.setAttribute('aria-label',heading.textContent);
  audio.onplay=()=>{document.querySelectorAll('audio').forEach(other=>{if(other!==audio)other.pause();});};
  audio.onerror=()=>{message.textContent='音频不可用或文件损坏，请重新导入原始 MP3。';};
  button.textContent='Download MP3';message.setAttribute('role','status');
  button.onclick=async()=>{
   button.disabled=true;
   try {
    const latest=await transact(db,'readonly',s=>s.get(row.id));
    if(!latest?.audio?.size)throw Error('歌曲文件不可用，请重新导入。');
    const downloadURL=URL.createObjectURL(latest.audio);urls.add(downloadURL);
    const a=document.createElement('a');a.href=downloadURL;a.download=filename(row.title,row.version);document.body.append(a);a.click();a.remove();
    // Browsers cannot report whether a user actually saved a file.
    latest.downloadStatus='requested';await transact(db,'readwrite',s=>s.put(latest));
    message.textContent='已发起下载。Safari 如显示预览，可分享并存储到“文件”。请确认文件已保存。';
   } catch(error){message.textContent=`下载失败：${error.message}`;}finally{button.disabled=false;}
  };
  message.textContent=row.downloadStatus==='requested'?'此前已发起下载（实际保存需自行确认）。':'尚未下载';
  card.append(heading,meta,audio,button,message);$('songs').append(card);
  if(row.id===selected){card.scrollIntoView({block:'nearest'});}
 }
}
$('import').onsubmit=async event=>{
 event.preventDefault();$('save').disabled=true;
 try {
  if(!db)throw Error('歌曲库不可用，请检查浏览器存储设置。');
  const title=$('title').value.trim();if(!title)throw Error('请输入歌曲名称。');
  status('正在验证并保存 MP3…');const file=$('file').files[0],duration=await validateAudio(file),id=crypto.randomUUID();
  await transact(db,'readwrite',s=>s.add({id,title,version:$('version').value,createdAt:new Date().toISOString(),generationStatus:'imported',audioReference:`indexeddb:${id}`,audio:file,duration,downloadStatus:'not_requested'}));
  await render(id);status('已保存到本机。可直接试听、下载，刷新后重播。');
 }catch(error){status(error.message);}finally{$('save').disabled=false;}
};
try{db=await openLibrary();await render();status('本机歌曲库已就绪 · 免费测试模式');}catch(error){status(error.message);$('save').disabled=true;}
