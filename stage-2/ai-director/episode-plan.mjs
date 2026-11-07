// AI Director: editable, provider-neutral episode plan. No AI or paid API calls.
const validText=(s,max=4000)=>typeof s==='string'&&s.trim().length>0&&s.length<=max;
export function createDramaEpisodePlan({title,sourceChapterIds,shots,targetSeconds=180,aspectRatio='16:9'}){
 if(!validText(title,200)||!Array.isArray(sourceChapterIds)||!sourceChapterIds.length||
    !sourceChapterIds.every(x=>validText(x,100))||!Array.isArray(shots)||!shots.length||shots.length>100||
    !Number.isInteger(targetSeconds)||targetSeconds<30||targetSeconds>900||
    !['16:9','9:16'].includes(aspectRatio))throw Error('Invalid episode');
 const ids=new Set();let cursor=0;
 const normalized=shots.map((shot,index)=>{
  if(!validText(shot?.description)||!Number.isFinite(shot?.durationSeconds)||
     shot.durationSeconds<1||shot.durationSeconds>60||
     !Array.isArray(shot.dialogue)||shot.dialogue.length>30)throw Error('Invalid shot '+index);
  const id=shot.id??'shot_'+String(index+1).padStart(3,'0');
  if(!validText(id,100)||ids.has(id))throw Error('Duplicate or invalid shot ID');
  ids.add(id);
  const dialogue=shot.dialogue.map(line=>{
   if(!validText(line?.characterId,100)||!validText(line?.text,2000))throw Error('Invalid dialogue');
   return {characterId:line.characterId,text:line.text};
  });
  const result={id,description:shot.description,durationSeconds:shot.durationSeconds,
   startSeconds:cursor,endSeconds:cursor+shot.durationSeconds,
   characterIds:Array.isArray(shot.characterIds)?[...shot.characterIds]:[],
   dialogue,status:'DRAFT',mediaAssetId:null};
  cursor=result.endSeconds;return result;
 });
 if(cursor>900)throw Error('Episode exceeds 15 minutes');
 return {schemaVersion:1,title,sourceChapterIds:[...sourceChapterIds],aspectRatio,
  targetSeconds,totalSeconds:cursor,withinTarget:Math.abs(cursor-targetSeconds)<=15,
  reviewStatus:'DRAFT',shots:normalized};
}
export function updateDramaShot(plan,{shotId,description,dialogue}){
 if(plan?.reviewStatus!=='DRAFT')throw Error('Only draft plans may be edited');
 const index=plan.shots.findIndex(s=>s.id===shotId);
 if(index<0)throw Error('Unknown shot');
 const source=plan.shots[index];
 const edited=createDramaEpisodePlan({title:plan.title,sourceChapterIds:plan.sourceChapterIds,
  aspectRatio:plan.aspectRatio,targetSeconds:plan.targetSeconds,
  shots:plan.shots.map(s=>({id:s.id,description:s.id===shotId?(description??s.description):s.description,
   durationSeconds:s.durationSeconds,characterIds:s.characterIds,
   dialogue:s.id===shotId?(dialogue??s.dialogue):s.dialogue}))});
 return edited;
}
