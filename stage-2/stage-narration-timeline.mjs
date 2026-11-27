// Align scene narration with measured audio duration, without paid TTS calls.
// Audio asset IDs refer to private server-side assets; never public URLs.
export function alignStageNarration({scenes,voiceTracks}) {
 if(!Array.isArray(scenes)||!Array.isArray(voiceTracks)||scenes.length<1||
    scenes.length>300||voiceTracks.length>300)throw Error('Invalid narration timeline');
 const byScene=new Map();
 for(const track of voiceTracks){
  if(typeof track?.sceneId!=='string'||!track.sceneId||
     typeof track.assetId!=='string'||!/^[-_a-zA-Z0-9]{1,128}$/.test(track.assetId)||
     !Number.isFinite(track.durationSeconds)||track.durationSeconds<=0||
     track.durationSeconds>120||byScene.has(track.sceneId))
   throw Error('Invalid or duplicate narration track');
  byScene.set(track.sceneId,track);
 }
 const segments=[];
 let previousEnd=0;
 for(const scene of scenes){
  if(typeof scene?.id!=='string'||!Number.isFinite(scene.startSeconds)||
     !Number.isFinite(scene.endSeconds)||scene.startSeconds<previousEnd||
     scene.endSeconds<=scene.startSeconds||scene.endSeconds>900)
   throw Error('Invalid scene timeline');
  previousEnd=scene.endSeconds;
  const narration=typeof scene.narration==='string'?scene.narration.trim():'';
  const track=byScene.get(scene.id);
  if(track&&!narration)throw Error('Voice track has no narration text');
  if(narration&&!track)throw Error('Missing narration audio for scene '+scene.id);
  if(!track)continue;
  const available=scene.endSeconds-scene.startSeconds;
  if(track.durationSeconds>available+0.001)throw Error('Narration exceeds scene duration: '+scene.id);
  segments.push({sceneId:scene.id,assetId:track.assetId,
   startSeconds:scene.startSeconds,endSeconds:scene.startSeconds+track.durationSeconds,
   text:narration,language:typeof track.language==='string'?track.language:'und'});
  byScene.delete(scene.id);
 }
 if(byScene.size)throw Error('Unknown narration scene ID');
 return {durationSeconds:previousEnd,segments,
  subtitleCues:segments.map((s,i)=>({index:i+1,startSeconds:s.startSeconds,
   endSeconds:s.endSeconds,text:s.text}))};
}
