# RUNLU MUSIC STUDIO — Engineering kickoff (2026-10-25)

Status: planning and repository reconnaissance; no music generation integration or deployment completed.

## Product
Independent RUNLU music creation application, proposed public route `/music`. Do not conflate with RUNLU ONE or RUNLU STAGE; STAGE is a future integration target.

## MVP acceptance
1. User enters a prompt or keywords in Chinese/English.
2. Server securely calls a licensed music-generation provider (no API secrets in client).
3. Asynchronous generation job exposes pending/succeeded/failed states and retries.
4. Generated audio is actually playable in browser.
5. User can download a real MP3, with correct MIME type and filename.
6. Saved project includes prompt, lyrics where available, provider/model, generation parameters, asset references, and rights metadata.
7. Upload supports MP3/WAV/M4A with file size/type validation, private storage, retention policy, and explicit rights acknowledgement.
8. Usage and per-generation costs are logged; quotas prevent accidental charges.
9. No fake playable/download controls; end-to-end test uses actual generated audio.

## Subsequent milestones
- Reference-song analysis: tempo, instrumentation, mood, structure; original composition with no melody or recording copying from unauthorized works.
- Singing voice selection and opt-in verified voice cloning.
- Authorized covers, stem separation, vocal conversion and mixing.
- Multi-singer arrangement, lyric timing, and RUNLU STAGE video handoff.

## Architecture proposal (subject to audit)
Frontend independent app; backend API; job queue and provider adapter; private object storage with signed download URLs; relational metadata; FFmpeg transcoding where legally/technically permitted; server-side cost accounting.

## Safety, rights, quality
- Require appropriate rights for uploaded reference songs, covers, voice samples, and public/commercial output.
- No unauthorized celebrity/third-party voice impersonation.
- Provider license, audio quality, song length, supported languages, price and reliability must be validated before provider selection.
- Similarity checks are risk-reduction, not proof of non-infringement.
- User-controlled export and clear retention/deletion controls.

## Immediate implementation sequence
A. Audit existing RUNLU web, STAGE, identity, storage, deployment and shared services.
B. Choose a provider via real quality/cost tests.
C. Create isolated MVP app/branch; implement prompt -> job -> playback -> MP3 download.
D. Run real end-to-end tests on mobile and desktop before deployment.

## Repository reconnaissance
Connected GitHub shows `nevergiveup980-ux/Runlu.ca` and `nevergiveup980-ux/runlu-one`. RUNLU ONE docs indicate an independent spreadsheet-style product, not a music backend. No dedicated MUSIC STUDIO repository identified in initial repository listing. Further audit required.
