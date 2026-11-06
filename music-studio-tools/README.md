# RUNLU MUSIC Studio — manual Lyria preview

The Studio webpage `music-studio.html` exports a JSON project. This standalone script consumes that file to generate a 30-second MP3 with Google's Gemini API Lyria 3 Clip.

## Safeguards
- **No automatic paid calls**: without `--confirm-paid`, script only previews model, price and output path.
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

Pricing checked 2026-11-06: Lyria 3 Clip `lyria-3-clip-preview` USD $0.04/request; Lyria 3.5 `lyria-3.5` USD $0.08/request. Verify current prices and access before generating: https://ai.google.dev/gemini-api/docs/pricing

API documentation: https://ai.google.dev/gemini-api/docs/music-generation

Not yet executed or tested with a live API key. Frontend integration, authenticated server-side generation, rate limits, billing limits and audio storage are future work.
