import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createDramaEpisodePlan} from './episode-plan.mjs';
import {renderDirectorPilot} from './pilot-render.mjs';
const plan=createDramaEpisodePlan({title:'Offline pilot fixture',sourceChapterIds:['fixture'],shots:Array.from({length:6},(_,i)=>({id:'s'+i,description:'Test scene '+i,durationSeconds:30,dialogue:[{characterId:'narrator',text:'Test scene '+i}]}))});
test('pilot maps dialogue and rejects missing assets',async()=>{
 const assets=new Map(plan.shots.map(s=>[s.id,{video:Buffer.from('v'),lines:[{wav:Buffer.from('a'),start:1,end:2}]}]));
 const output=await renderDirectorPilot({plan,assets,render:async input=>{
 assert.equal(input.clips.length,6);assert.equal(input.durationSeconds,180);
 assert.equal(input.subtitleCues[5].startSeconds,151);
 return Buffer.from('mock');
 },probe:async()=>({duration:180,streams:[{codec_type:'video',width:1280,height:720},{codec_type:'audio'},{codec_type:'subtitle'}]})});
 assert.equal(output.toString(),'mock');
 assets.delete('s2');
 await assert.rejects(renderDirectorPilot({plan,assets}),/Missing or invalid shot assets/);
});
test('offline 180-second director pilot produces actual MP4',{skip:process.env.RUNLU_STAGE_STRESS!=='1',timeout:600000},async()=>{
 const dir=await mkdtemp(join(tmpdir(),'director-pilot-'));
 try{
 const video=join(dir,'scene.mp4'),audio=join(dir,'voice.wav');
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i','testsrc2=size=1280x720:rate=24','-t','30','-an','-c:v','libx264','-preset','ultrafast','-crf','32','-pix_fmt','yuv420p','-y',video]);
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i','sine=frequency=440:sample_rate=16000','-t','1','-c:a','pcm_s16le','-y',audio]);
 const v=await readFile(video),a=await readFile(audio);
 const assets=new Map(plan.shots.map(s=>[s.id,{video:v,lines:[{wav:a,start:1,end:2}]}]));
 const bytes=await renderDirectorPilot({plan,assets});
 assert.ok(bytes.length>1000);
 if(process.env.RUNLU_PILOT_OUTPUT)await writeFile(process.env.RUNLU_PILOT_OUTPUT,bytes,{flag:'wx'});
 }finally{await rm(dir,{recursive:true,force:true});}
});
