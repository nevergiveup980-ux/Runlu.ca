import test from "node:test";
import assert from "node:assert/strict";
import {MusicProviderError,validateGeneratedTrack,assertProviderReady} from "../provider-contract.js";
const valid={id:"track_123",title:"故乡",duration_seconds:30,format:"mp3",download_path:"/api/music/tracks/track_123/download"};
test("provider must expose job methods",()=>{assert.throws(()=>assertProviderReady({}),{code:"PROVIDER_NOT_CONFIGURED"});assert.doesNotThrow(()=>assertProviderReady({createJob(){},getJob(){}}));});
test("track result must be real MP3 metadata with application-owned route",()=>{assert.deepEqual(validateGeneratedTrack(valid),valid);for(const bad of [{format:"wav"},{duration_seconds:0},{download_path:"https://provider.example/secret"},{download_path:"/other/path"}])assert.throws(()=>validateGeneratedTrack({...valid,...bad}),{code:"INVALID_PROVIDER_RESULT"});});
test("provider errors carry retryable flag",()=>{const err=new MusicProviderError("TEMP","Temporary",{retryable:true});assert.equal(err.retryable,true);});
