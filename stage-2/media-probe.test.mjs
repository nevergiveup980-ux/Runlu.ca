import test from "node:test";
import assert from "node:assert/strict";
import {inspectMp4Probe} from "./media-probe.mjs";
const sha256="a".repeat(64);
const probe={streams:[{codec_type:"video",codec_name:"h264",width:1280,height:720}],format:{format_name:"mov,mp4,m4a,3gp,3g2,mj2",duration:"12.5"}};
const check=(p,options={})=>inspectMp4Probe(p,{bytes:2048,sha256,...options});
test("ffprobe MP4 H264 video accepted",()=>assert.equal(check(probe).deliveryFormat,"mp4-h264"));
test("reject non-MP4 container",()=>assert.throws(()=>check({...probe,format:{...probe.format,format_name:"matroska,webm"}})));
test("reject video codec mismatch",()=>assert.throws(()=>check({...probe,streams:[{...probe.streams[0],codec_name:"hevc"}]})));
test("reject missing or multiple video tracks",()=>{
 assert.throws(()=>check({...probe,streams:[]}));
 assert.throws(()=>check({...probe,streams:[...probe.streams,...probe.streams]}));
});
test("reject invalid and excessive durations",()=>{
 assert.throws(()=>check({...probe,format:{...probe.format,duration:"NaN"}}));
 assert.throws(()=>check(probe,{maxSeconds:10}));
});
test("reject missing digest",()=>assert.throws(()=>inspectMp4Probe(probe,{bytes:2048})));
