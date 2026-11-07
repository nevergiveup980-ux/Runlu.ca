// Deterministic storyboard plan; no paid generation or rendering is triggered.
export function planStageStoryboard({title,scenes,targetMinutes=5,aspectRatio='16:9'}) {
 if(typeof title!=='string'||!title.trim()||!Array.isArray(scenes)||scenes.length<1||scenes.length>300)
  throw Error('Valid title and 1-300 scenes required');
 if(!Number.isFinite(targetMinutes)||targetMinutes<=0||targetMinutes>15)
  throw Error('Target must be between 0 and 15 minutes');
 if(!['16:9','9:16','1:1'].includes(aspectRatio))throw Error('Invalid aspect ratio');
 const normalized=scenes.map((scene,index)=>{
  if(typeof scene?.description!=='string'||!scene.description.trim()||
     typeof scene?.durationSeconds!=='number'||!Number.isFinite(scene.durationSeconds)||
     scene.durationSeconds<1||scene.durationSeconds>120)
   throw Error('Invalid scene at index '+index);
  return {id:'scene_'+String(index+1).padStart(3,'0'),description:scene.description.trim(),
   durationSeconds:scene.durationSeconds,narration:typeof scene.narration==='string'?scene.narration:'',
   sourceImageId:typeof scene.sourceImageId==='string'?scene.sourceImageId:null};
 });
 const totalSeconds=normalized.reduce((sum,s)=>sum+s.durationSeconds,0);
 if(totalSeconds>900)throw Error('Storyboard exceeds 15-minute limit');
 let cursor=0;
 const timeline=normalized.map(scene=>{const result={...scene,startSeconds:cursor,endSeconds:cursor+scene.durationSeconds};cursor=result.endSeconds;return result;});
 return {title:title.trim(),aspectRatio,targetSeconds:Math.round(targetMinutes*60),totalSeconds,
  withinTarget:Math.abs(totalSeconds-targetMinutes*60)<=15,scenes:timeline,
  export:{container:'mp4',videoCodec:'h264',audioCodec:'aac',status:'NOT_RENDERED'}};
}
