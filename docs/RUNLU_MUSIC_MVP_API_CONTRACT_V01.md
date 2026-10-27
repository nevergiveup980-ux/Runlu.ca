# RUNLU MUSIC STUDIO — MVP interface contract v0.1

This document specifies a proposed API, not an implemented endpoint. No provider is connected.

## Architecture finding (2026-10-26)
- GitHub repository `nevergiveup980-ux/Runlu.ca` default branch tree was inspected (1,276 entries).
- No music/stage source directory, package.json, wrangler config, or functions/API directory appeared in this repository tree.
- Therefore the RUNLU website repository is a documentation/landing-page integration candidate, **not** a verified existing music-generation backend. Do not alter production homepage or claim STAGE backend reuse without locating it.

## Proposed API
POST /api/music/jobs
Request: {prompt:string, language:'zh'|'en'|'fr'|'es', duration_seconds:30|60, instrumental:boolean, idempotency_key:string}
Response: 202 {job_id:string,status:'queued'}
GET /api/music/jobs/:id
Response: {job_id,status:'queued'|'running'|'succeeded'|'failed', progress?:number, error?:{code,message}, track?:{id,title,duration_seconds,playback_url,download_url,format:'mp3'}}
GET /api/music/tracks/:id/download
Response: audio/mpeg (authenticated, authorized, filename header)
POST /api/music/uploads/init
Request: {filename,mime_type,size_bytes,usage:'reference'|'voice',rights_confirmed:true}
Response: signed upload target with expiry; server enforces limits and private object storage.
POST /api/music/references/:id/analyze
Response: asynchronous analysis job ID; never promise an exact melody replica.

## Operational requirements
- Authentication and authorization on every job and asset.
- Store API credentials server-side only; separate provider adapters and retries with bounded budgets.
- Audio source/derived asset storage lifecycle, user deletion, and retention.
- Generation records: user, prompt, language, model/provider, cost estimate/actual, status, rights, timestamps.
- Do not expose download URLs before a successful generation.
- Track errors, request IDs, cost ceilings, daily quotas, and abuse prevention.
- FFmpeg MP3 conversion if source format differs; inspect provider commercial license.
- Test with actual generated audio on iPhone Safari and desktop before claiming release.

## First integration test
1. Submit Chinese prompt '故乡、父母、岁月' and 30s duration.
2. Observe queued -> running -> succeeded.
3. Listen to actual track; verify audible non-silent audio.
4. Download MP3; check MIME, file header, duration, file size and local playback.
5. Refresh and retrieve track from authenticated library.
6. Simulate provider error, timeout, duplicate submit and exceeded quota.
7. Upload own authorized sample, inspect type/size enforcement and private access.
