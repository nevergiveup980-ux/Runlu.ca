# RUNLU MUSIC Studio — manual Lyria preview

The Studio webpage `music-studio.html` exports a JSON project. This standalone script consumes that file and prepares a manual provider request. **Live generation is experimental and unverified**; the model identifiers, SDK request and response schema must be confirmed against the current provider documentation before a paid request.

## Safeguards
- **No automatic paid calls**: without `--confirm-paid`, script only previews model identifier, output path and prompt size; no price guarantee.
- API key is read only from `GEMINI_API_KEY` environment variable. Never put secrets in frontend JavaScript, GitHub, or project JSON.
- One invocation makes at most one generation request; no retries or background loops.
- Existing output files are not overwritten.
- Generated songs may include AI-produced lyrics differing from the submitted text; review results.
- Local script is **not a public web API**. Do not deploy a public unauthenticated endpoint that exposes paid generation.

## Run locally (Mac or PC with Python)
```bash
python -m pip install --upgrade google-genai
python music-studio-tools/generate_preview.py --project runlu-music-project.json
# Only after reviewing the cost and explicitly choosing to spend:
export GEMINI_API_KEY='your-private-key'
python music-studio-tools/generate_preview.py --project runlu-music-project.json --confirm-paid --output wind-years-demo.mp3
```

**Pricing is not verified here.** Verify current model availability, supported API method, output format and exact billing on the official documentation before enabling paid generation: https://ai.google.dev/gemini-api/docs/pricing

API documentation: https://ai.google.dev/gemini-api/docs/music-generation

The offline checks and Chromium interaction tests have passed in GitHub Actions as of commit `e5b6791`. Live generation has not been tested with an API key. Frontend integration, authenticated server-side generation, rate limits, billing limits and audio storage are future work.

## First-song acceptance checklist — 《风吹过的那些年》

Use this checklist **only after a real audio file has been generated**. The current Studio does not generate a song or guarantee a playable MP3.

| Gate | Pass condition | How to verify |
| --- | --- | --- |
| Rights | Lyrics and melody are original; no unauthorized artist voice imitation | Review source and provider terms; listen for recognizable borrowing |
| Language | Mandarin lyrics are intelligible and match the approved words | Listen line by line against exported TXT; mark substitutions |
| Vocal | Mature warm female vocal, natural breaths, stable pitch and no robotic syllables | Listen on headphones and phone speaker |
| Musical arc | Clear opening, verse development, emotional peak, satisfying ending | Listen to the entire track without skipping |
| Audio | File decodes, duration is plausible, no clipping, severe artifacts or abrupt cutoff | Load in Studio and an independent audio player |
| Delivery | Actual downloadable file, correct format and filename, rights and usage terms recorded | Check file metadata and provider license |
| Cost | Model, request count and actual charge documented | Check provider billing before any further generation |

**Stop conditions:** do not publish a preview as a finished song; do not assert the lyrics were sung accurately without listening; do not assume a provider returns MP3 just because the output path ends in `.mp3`. Confirm the returned MIME type and actual file format. Do not trigger paid generation from CI.

**Manual acceptance record:** date, project revision, provider/model, terms/license link, actual cost, audio format, duration, checklist results, defects, approval decision. Keep the record alongside the exported project JSON, not in the public website repository if it contains private information.
