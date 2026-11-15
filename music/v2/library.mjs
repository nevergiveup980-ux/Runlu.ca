// Device-local review library. No network, credentials or paid generation.
export function filename(title, version) {
  return `${title.normalize('NFC').replace(/[\\/:*?"<>|\x00-\x1f\x7f]/g, '-').slice(0,100) || 'Untitled'}-${version}.mp3`;
}
export async function openLibrary() {
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('runlu-music-v2',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('songs',{keyPath:'id'});
    request.onerror=()=>reject(Error('无法打开本机歌曲库，请检查浏览器存储设置。'));
    request.onblocked=()=>reject(Error('请关闭其他工作室页面后重试。'));
    request.onsuccess=()=>resolve(request.result);
  });
}
export async function transact(db,mode,action) {
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('songs',mode),request=action(tx.objectStore('songs'));
    tx.oncomplete=()=>resolve(request.result);
    tx.onabort=tx.onerror=()=>reject(Error('保存失败：存储空间不足或浏览器存储不可用。请保留原始 MP3。'));
  });
}
export async function validateAudio(file) {
  if(!file || file.size<128 || file.size>50*1024*1024)throw Error('请选择有效 MP3（最大 50 MB）。');
  const b=new Uint8Array(await file.slice(0,12).arrayBuffer());
  if(!(b[0]===73&&b[1]===68&&b[2]===51)&&!(b[0]===255&&(b[1]&224)===224))throw Error('文件内容不是 MP3，未保存。');
  const url=URL.createObjectURL(file),audio=new Audio();
  try {
    const duration=await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(Error('音频读取超时，未保存。')),15000);
      audio.onloadedmetadata=()=>{clearTimeout(timer);Number.isFinite(audio.duration)&&audio.duration>0?resolve(audio.duration):reject(Error('音频时长无效，未保存。'));};
      audio.onerror=()=>{clearTimeout(timer);reject(Error('浏览器无法播放此 MP3，未保存。'));};
      audio.preload='metadata';audio.src=url;
    });
    return duration;
  } finally {audio.removeAttribute('src');audio.load();URL.revokeObjectURL(url);}
}

// Safari private/ephemeral IndexedDB may not support persisted File/Blob objects.
// Keep compatibility with earlier records while storing new MP3 bytes as ArrayBuffer.
export function storedAudioBlob(value) {
  if(value instanceof Blob)return value;
  if(value instanceof ArrayBuffer&&value.byteLength)return new Blob([value],{type:'audio/mpeg'});
  throw Error('歌曲文件不可用，请重新导入。');
}
