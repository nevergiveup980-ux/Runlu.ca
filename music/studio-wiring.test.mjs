// Offline HTML wiring regression checks. These are static checks, not browser E2E.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync(new URL("../music-studio.html",import.meta.url),"utf8");
test("iPhone saving help is shown for both newly generated and library songs",()=>{
 assert.match(html,/id="musicDownloadHelp"/);
 assert.match(html,/下载生成歌曲|打开 MP3 以保存/);
 assert.match(html,/player\.src=url;player\.style\.display="block";setDownloadLink\(url\);download\.style\.display="inline-block";downloadHelp\.style\.display="block";\s*say\("已加载音乐库歌曲/);
 assert.match(html,/downloadHelp\.style\.display="none"/);
});
test("manual link refresh ignores responses for previously selected songs",()=>{
 assert.match(html,/const requestedJobId=activeJobId/);
 assert.match(html,/playback\.getLink\(requestedJobId,\{force:true\}\)/);
 assert.match(html,/if\(activeJobId!==requestedJobId\)return/);
});
test("private playback state is cleared when session expires",()=>{
 assert.match(html,/runlu-music-session-ended/);
 assert.match(html,/clearPlayback\(\);renew\.style\.display="none"/);
});

test("near-expired iPhone download link is blocked without paid regeneration",()=>{
 assert.match(html,/download\.addEventListener\("click",event=>/);
 assert.match(html,/Date\.now\(\)>=downloadLinkExpiresAt-10000/);
 assert.match(html,/event\.preventDefault\(\)/);
 assert.match(html,/downloadLinkExpiresAt=0/);
});

test("manual refresh preserves playback position but never autoplays or generates",()=>{
 assert.match(html,/const resumeAt=Number\.isFinite\(player\.currentTime\)\?player\.currentTime:0/);
 assert.match(html,/player\.addEventListener\("loadedmetadata"/);
 assert.match(html,/player\.currentTime=resumeAt/);
 const refresh=html.slice(html.indexOf('renew.addEventListener("click"'),html.indexOf('window.addEventListener("runlu-music-select-song"'));
 assert.doesNotMatch(refresh,/player\.play\(|createSongJob\(/);
});

test("playback resume callbacks are invalidated on song or account change",()=>{
 assert.match(html,/playbackEpoch=0/);
 assert.match(html,/const clearPlayback=\(\)=>\{playbackEpoch\+\+/);
 assert.match(html,/const requestedEpoch=playbackEpoch/);
 assert.match(html,/playbackEpoch!==requestedEpoch\)return/);
 assert.match(html,/playbackEpoch===requestedEpoch&&Number\.isFinite\(player\.duration\)/);
});
