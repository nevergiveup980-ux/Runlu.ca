// Offline subtitle timing and SRT export for the STAGE storyboard.
// Timing is explicit and deterministic; speech alignment comes later.
function stamp(seconds) {
 const ms=Math.round(seconds*1000);
 const h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000);
 const s=Math.floor(ms%60000/1000),f=ms%1000;
 return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+','+String(f).padStart(3,'0');
}
export function buildStageSubtitles({scenes,maxCharsPerCue=80}) {
 if(!Array.isArray(scenes)||scenes.length===0||scenes.length>300||
    !Number.isInteger(maxCharsPerCue)||maxCharsPerCue<10||maxCharsPerCue>200)
  throw Error('Invalid subtitle configuration');
 const cues=[];
 for(const [index,scene] of scenes.entries()){
  const {startSeconds,endSeconds,narration}=scene??{};
  if(!Number.isFinite(startSeconds)||!Number.isFinite(endSeconds)||
     startSeconds<0||endSeconds<=startSeconds||endSeconds>900||
     (index>0&&startSeconds<scenes[index-1].endSeconds)||
     typeof narration!=='string')
   throw Error('Invalid subtitle scene timing');
  const lines=narration.replace(/\r/g,'').split(/\n+/).map(s=>s.trim()).filter(Boolean);
  if(lines.some(s=>s.length>maxCharsPerCue))throw Error('Subtitle line exceeds length limit');
  if(!lines.length)continue;
  const duration=(endSeconds-startSeconds)/lines.length;
  lines.forEach((text,i)=>{
   const start=startSeconds+i*duration,end=i===lines.length-1?endSeconds:startSeconds+(i+1)*duration;
   cues.push({index:cues.length+1,startSeconds:start,endSeconds:end,text});
  });
 }
 return cues;
}
export function stageSubtitlesToSrt(cues){
 if(!Array.isArray(cues))throw Error('Subtitle cues required');
 return cues.map((cue,i)=>{
  if(!Number.isFinite(cue?.startSeconds)||!Number.isFinite(cue?.endSeconds)||
     cue.startSeconds<0||cue.endSeconds<=cue.startSeconds||typeof cue.text!=='string'||
     !cue.text.trim()||cue.text.includes('\n')||cue.text.includes('\r'))
   throw Error('Invalid subtitle cue');
  return String(i+1)+'\n'+stamp(cue.startSeconds)+' --> '+stamp(cue.endSeconds)+'\n'+cue.text+'\n';
 }).join('\n');
}
