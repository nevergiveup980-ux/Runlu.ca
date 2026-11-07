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

The six offline unit tests are defined but no passing GitHub Actions run has been verified. Not yet executed or tested with a live API key. Frontend integration, authenticated server-side generation, rate limits, billing limits and audio storage are future work.
