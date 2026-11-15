// Explicit account-library login. Tokens stay in memory and never enter URLs/storage.
const ROOT='https://ekrnknlawekeoszzkamd.supabase.co';
const KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
const $=id=>document.getElementById(id);
let session=null,epoch=0,nextCursor=null,listSequence=0;const urls=new Set();
function message(text){$('cloud-status').textContent=text;}
function clear(){ $('cloud-login').hidden=false;$('cloud-help').hidden=false;$('cloud-account').hidden=true;$('cloud-account').textContent='';$('cloud-refresh').disabled=true;$('cloud-logout').disabled=true;epoch++;listSequence++;document.querySelectorAll('#cloud-songs audio').forEach(audio=>{audio.pause();audio.removeAttribute('src');audio.load();});session=null;nextCursor=null;for(const url of urls)URL.revokeObjectURL(url);urls.clear();$('cloud-songs').replaceChildren();$('cloud-more').hidden=true;}
async function api(path){
 if(!session||Date.now()>=session.expires_at){clear();message('会话已过期，请重新登录。');throw Error('会话已过期，请重新登录。');}
 let response;try{response=await fetch('/api/music/'+path,{headers:{Authorization:'Bearer '+session.access_token},cache:'no-store',signal:AbortSignal.timeout(20000)});}catch{throw Error('已登录，但无法连接本机歌曲服务。请确认验收服务器正在运行后点击刷新。');}
 const data=await response.json().catch(()=>({}));
 if(response.status===401){clear();message('登录已失效，请重新登录。');throw Error('登录已失效，请重新登录。');}
 if(!response.ok)throw Error(({NOT_FOUND:'歌曲不存在或无权访问。',AUDIO_NOT_READY:'歌曲尚未保存为可播放音频。',BACKEND_UNAVAILABLE:'歌曲服务暂不可用，请在本机验收服务器打开本页。'})[data.error_code]||'请求失败，请重试。');
 return data;
}
function addSong(row){
 const card=document.createElement('article'),heading=document.createElement('h3'),meta=document.createElement('small'),audio=document.createElement('audio'),play=document.createElement('button'),download=document.createElement('button'),saveLink=document.createElement('a'),note=document.createElement('p');
 heading.textContent=`${row.title} · ${row.version}`;
 meta.textContent=`${new Date(row.created_at).toLocaleString()} · ${row.duration?Math.round(row.duration)+' 秒':'等待音频'} · ${row.status}`;
 audio.controls=true;audio.preload='metadata';audio.setAttribute('aria-label',heading.textContent);
 saveLink.hidden=true;saveLink.textContent='未开始下载？点此打开或保存 MP3';saveLink.target='_blank';saveLink.rel='noopener';
 play.textContent='试听 / 刷新播放链接';download.textContent='Download MP3';play.disabled=download.disabled=!row.audio_available;note.setAttribute('role','status');
 audio.onplay=()=>document.querySelectorAll('audio').forEach(other=>{if(other!==audio)other.pause();});
 audio.onerror=()=>{note.textContent='播放链接可能已过期，点击“刷新播放链接”重新获取，无需重新生成。';};
 play.onclick=async()=>{
  const ticket=epoch,time=audio.currentTime||0;play.disabled=true;
  try{const data=await api(`songs/${row.id}/access`);if(ticket!==epoch)return;
   audio.src=data.url;audio.onloadedmetadata=()=>{if(ticket===epoch&&time<audio.duration)audio.currentTime=time;};audio.load();note.textContent='链接已更新，请点击播放器播放。';
  }catch(error){note.textContent=error.message;}finally{play.disabled=false;}
 };
 download.onclick=async()=>{
  const ticket=epoch;download.disabled=true;
  try{const data=await api(`songs/${row.id}/access?download=1`);if(ticket!==epoch)return;
   const target=new URL(data.url);if(target.origin!==ROOT)throw Error('下载地址无效。');
   const response=await fetch(target,{cache:'no-store',signal:AbortSignal.timeout(60000)});
   if(!response.ok)throw Error('下载失败或链接已过期，请重试。');
   const blob=await response.blob();if(ticket!==epoch)return;if(!blob.size||!/^audio\/mpeg/.test(blob.type))throw Error('未返回有效 MP3。');
   const url=URL.createObjectURL(blob);urls.add(url);const a=document.createElement('a');
   a.href=url;const {filename}=await import('./library.mjs');if(ticket!==epoch){URL.revokeObjectURL(url);urls.delete(url);return;}a.download=filename(row.title,row.version);saveLink.href=url;saveLink.download=a.download;saveLink.hidden=false;document.body.append(a);a.click();a.remove();
   note.textContent='已发起下载。Safari 如显示预览，可分享并存储到“文件”；请确认已保存。';
  }catch(error){note.textContent=error.message;}finally{download.disabled=false;}
 };
 card.append(heading,meta,play,audio,download,saveLink,note);$('cloud-songs').append(card);
}
async function load(more=false){
 const ticket=epoch,sequence=++listSequence;$('cloud-more').disabled=true;
 try{const data=await api('library?limit=20'+(more&&nextCursor?'&before='+encodeURIComponent(nextCursor):''));if(ticket!==epoch||sequence!==listSequence)return;
  if(!more)$('cloud-songs').replaceChildren();data.items.forEach(addSong);nextCursor=data.next_cursor;$('cloud-more').hidden=!data.has_more;
  message(data.items.length?'已读取账号私人歌曲库。':'账号歌曲库暂无已保存歌曲。本机歌曲不会自动上传。');
 }catch(error){if(ticket===epoch&&sequence===listSequence)message(error.message);}finally{if(sequence===listSequence)$('cloud-more').disabled=false;}
}
$('cloud-login').onsubmit=async event=>{
 event.preventDefault();clear();const ticket=epoch;$('cloud-submit').disabled=true;message('正在登录…');
 try{const response=await fetch(ROOT+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({email:$('cloud-email').value.trim(),password:$('cloud-password').value}),signal:AbortSignal.timeout(20000)});
  const data=await response.json().catch(()=>null);if(ticket!==epoch)return;
  if(!data)throw Error('账号服务响应异常，请稍后重试。');
  if(!response.ok){const code=data.error_code||data.code;const errors={invalid_credentials:'邮箱或 RUNLU 密码不正确。忘记密码可通过下方账号页找回。',email_not_confirmed:'请先在邮箱中确认 RUNLU 注册邮件，再登录。',user_banned:'此账号暂时不可用，请联系 RUNLU 支持。'};throw Error(response.status===429?'登录尝试过于频繁，请稍后再试。':errors[code]||'登录未成功，请通过下方 RUNLU 账号页检查账号状态。');}
  if(!data.access_token||data.user?.is_anonymous)throw Error('请使用已注册的 RUNLU 账号登录。');
  if(data.user?.factors?.some(factor=>factor.status==='verified'))throw Error('此账号需要多因素验证，请使用现有账号页面完成验证后再接入。');
  session={access_token:data.access_token,expires_at:Date.now()+data.expires_in*1000};$('cloud-login').hidden=true;$('cloud-help').hidden=true;$('cloud-account').textContent='已登录：'+$('cloud-email').value.trim();$('cloud-account').hidden=false;$('cloud-refresh').disabled=false;$('cloud-logout').disabled=false;message('已登录，正在读取私人歌曲库…');await load();
 }catch(error){message(error instanceof TypeError||error.name==='TimeoutError'?'无法连接 RUNLU 账号服务，请检查网络后再试。':error.message);$('cloud-status').scrollIntoView({block:'center'});}finally{$('cloud-password').value='';$('cloud-submit').disabled=false;}
};
$('cloud-refresh').onclick=()=>load();$('cloud-more').onclick=()=>load(true);
$('cloud-logout').onclick=async()=>{const token=session?.access_token;clear();message('已清除本页会话与私人播放链接。');if(token)try{await fetch(ROOT+'/auth/v1/logout',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+token},signal:AbortSignal.timeout(10000)});}catch{message('本页已退出；远端退出请求未确认。');}};
window.addEventListener('pagehide',clear);
