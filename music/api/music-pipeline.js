/**
 * RUNLU MUSIC STUDIO — generation-to-storage orchestration.
 * Not exposed over HTTP; caller must authenticate owner and reserve a job first.
 * Duration must be measured by a trusted decoder before calling this function.
 */
import {generateWithApproval} from "./generation-gate.js";
import {decodeProviderMp3} from "./provider-audio.js";
import {ingestMp3} from "./track-ingest.js";
export class MusicPipelineError extends Error{
 constructor(code,message,{cause}={}){super(message,{cause});this.name="MusicPipelineError";this.code=code;}
}
export async function runMusicPipeline({env,request,db,bucket,ownerId,trackId,title,durationSeconds,now,fetchImpl}){
 if(!db?.prepare||!bucket?.put||!bucket?.delete)throw new MusicPipelineError("STORAGE_NOT_CONFIGURED","Private storage required");
 if(!Number.isFinite(durationSeconds)||durationSeconds<=0)throw new MusicPipelineError("DURATION_NOT_VERIFIED","Measured audio duration required");
 const result=await generateWithApproval({env,request,fetchImpl});
 const audio=decodeProviderMp3(result);
 const saved=await ingestMp3({db,bucket,ownerId,trackId,title,audio,durationSeconds,now,
  rightsMetadata:{source:"ai-generated",provider:"google-lyria",model:result.model}});
 return Object.freeze({status:"stored",trackId:saved.id,sha256Hex:saved.sha256Hex,byteLength:saved.byteLength,lyrics:result.lyrics});
}
