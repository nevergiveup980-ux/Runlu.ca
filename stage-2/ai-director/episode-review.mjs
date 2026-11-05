// AI Director review gate: pure, auditable approval of a specific plan/bible revision.
// No provider calls, no implicit budget confirmation.
import {characterShotReferences} from './character-bible.mjs';
const valid=v=>typeof v==='string'&&v.trim().length>0&&v.length<=120;
export function prepareEpisodeReview({plan,bible}){
 if(plan?.reviewStatus!=='DRAFT'||!Array.isArray(plan.shots)||!plan.shots.length||
    !Array.isArray(bible?.characters))throw Error('Draft episode and character bible required');
 if(!plan.withinTarget)throw Error('Episode duration outside approved target tolerance');
 const shots=plan.shots.map(shot=>{
  if(shot.status!=='DRAFT'||!Array.isArray(shot.dialogue))throw Error('Unexpected shot state');
  const referenced=new Set([...(shot.characterIds??[]),...shot.dialogue.map(d=>d.characterId)]);
  const characters=characterShotReferences({bible,characterIds:[...referenced]});
  return {shotId:shot.id,characterIds:characters.map(c=>c.characterId),
    characterRevisions:characters.map(c=>({id:c.characterId,revision:c.revision})),
    dialogueLines:shot.dialogue.length};
 });
 return {schemaVersion:1,reviewStatus:'AWAITING_REVIEW',title:plan.title,
  targetSeconds:plan.targetSeconds,totalSeconds:plan.totalSeconds,
  sourceChapterIds:[...plan.sourceChapterIds],shots};
}
export function approveEpisodeReview({review,reviewerId,approvedShotIds}){
 if(review?.reviewStatus!=='AWAITING_REVIEW'||!valid(reviewerId)||
    !Array.isArray(approvedShotIds))throw Error('Invalid review approval');
 const all=review.shots.map(s=>s.shotId);
 if(approvedShotIds.length!==all.length||new Set(approvedShotIds).size!==all.length||
    !all.every(id=>approvedShotIds.includes(id)))throw Error('Every shot must be reviewed');
 return {...review,reviewStatus:'APPROVED',reviewerId,approvedShotIds:[...approvedShotIds]};
}
export function createApprovedShotJobs({approval}){
 if(approval?.reviewStatus!=='APPROVED'||!Array.isArray(approval.shots))throw Error('Approval required');
 return approval.shots.map(s=>({shotId:s.shotId,state:'READY',
  characterRevisionIds:s.characterRevisions.map(c=>c.id+'_v'+c.revision),
  attemptId:null,outputAssetId:null,failureReason:null,
  history:[{from:'DRAFT',to:'READY',attemptId:null}]}));
}
