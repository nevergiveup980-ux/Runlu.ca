# RUNLU MUSIC — Demo 01/02 release-readiness gate

Status: internal development only. No public release or additional paid generation is authorized by this document.

## Verified technical milestones
- Demo 01: Chinese male-vocal full-song generation succeeded in a manually approved GitHub Actions run; user confirmed audio playback.
- Demo 02: English female-vocal full-song generation succeeded in a manually approved GitHub Actions run; user confirmed file was saved in iPhone Files.
- Demo 02 workflow: .github/workflows/music-demo02-english-female.yml; output artifact runlu-demo02-english-female-private, retention 1 day.
- User's subjective feedback: Demo 01 feels more contemporary; Demo 02 feels more traditional/classic.
- Neither MP3 has yet been independently reviewed here for duration, clipping, vocal clarity, lyric adherence, or commercial-use rights.

## Next product milestone: native in-app library
1. Store song metadata separately from private binary audio. Include owner ID, locale, title, prompt style, voice descriptor, generation timestamp, duration, byte size, MIME type, provider model, estimated cost, and rights-review status.
2. Persist audio in private object storage, not public Git or GitHub Actions artifacts. Deliver authenticated, expiring download/playback URLs. Do not expose the provider API key to browsers.
3. Implement mobile-first library list, audio player, playback state, download to Files, and clear failure/retry messaging.
4. Preserve opt-in paid generation, show estimated cost before confirmation, limit concurrency and requests, and never auto-retry ambiguous paid failures.
5. Offer style presets as *instructions* (modern ballad / classic ballad / folk / jazz). Do not promise identical melody or voice consistency unless independently verified.
6. Treat sample tracks as private until human QA and provider licensing/terms review are completed.

## Audio acceptance checklist
- [ ] Obtain both original MP3 files from the owner and archive in controlled private storage.
- [ ] Validate MP3 MIME/codec, playable duration, and file integrity.
- [ ] Listen for silence, clipping, artifacts, unnatural phrasing and cut-off endings.
- [ ] Compare the intended lyrics against the actual vocals; note omissions or invented phrases.
- [ ] Evaluate chorus memorability, arrangement dynamics and intelligibility.
- [ ] Check provider terms and usage rights for distribution, marketing, and in-app sample playback.
- [ ] Obtain owner's explicit approval before public publishing.

## Do not conflate
GitHub Actions success + uploaded artifact demonstrates a successful technical generation workflow; it does not certify artistic quality or grant publication rights.
