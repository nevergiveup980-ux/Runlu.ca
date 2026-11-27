import {renderStageMontage} from '../stage-montage-render.mjs';
import {probeMp4Bytes} from '../ffprobe-media-service.mjs';
// Offline assembly only. Assets must be supplied by the caller; no provider calls.
export async function renderDirectorPilot({plan,assets,render=renderStageMontage,probe=probeMp4Bytes}){
 if(plan?.aspectRatio!=='16:9'||plan.totalSeconds!==180||!Array.isArray(plan.shots)||!plan.shots.length||!(assets instanceof Map))throw Error('180-second landscape pilot required');
 const clips=[],voiceSegments=[],subtitleCues=[];
 let cursor=0;
 for(const shot of plan.shots){
  const asset=assets.get(shot.id);
  if(shot.startSeconds!==cursor||!Number.isFinite(shot.durationSeconds)||shot.durationSeconds<=0||shot.endSeconds!==cursor+shot.durationSeconds||!Buffer.isBuffer(asset?.video)||!asset.video.length||!Array.isArray(asset.lines)||asset.lines.length!==shot.dialogue.length)throw Error('Missing or invalid shot assets: '+shot.id);
  clips.push(asset.video);
  let previousEnd=0;
  for(let i=0;i<asset.lines.length;i++){
   const line=asset.lines[i];
   if(!Buffer.isBuffer(line.wav)||!line.wav.length||!Number.isFinite(line.start)||!Number.isFinite(line.end)||line.start<previousEnd||line.end<=line.start||line.end>shot.durationSeconds)throw Error('Invalid dialogue timing: '+shot.id);
   voiceSegments.push({bytes:line.wav,startSeconds:cursor+line.start});
   subtitleCues.push({startSeconds:cursor+line.start,endSeconds:cursor+line.end,text:shot.dialogue[i].text});
   previousEnd=line.end;
  }
  cursor=shot.endSeconds;
 }
 if(cursor!==180||!voiceSegments.length)throw Error('Incomplete pilot timeline');
 const bytes=await render({clips,voiceSegments,subtitleCues,durationSeconds:180});
 const info=await probe(bytes);
 const video=info.streams.find(s=>s.codec_type==='video');
 if(!video||video.width*9!==video.height*16||Math.abs(Number(info.duration)-180)>1||!Number.isFinite(Number(info.duration))||!info.streams.some(s=>s.codec_type==='audio')||!info.streams.some(s=>s.codec_type==='subtitle'))throw Error('Pilot output failed media acceptance');
 return bytes;
}
