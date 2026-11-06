#!/usr/bin/env python3
"""RUNLU MUSIC Studio: manually triggered Lyria preview (never auto-runs).
Requires: pip install google-genai; export GEMINI_API_KEY=...
Usage: python music-studio-tools/generate_preview.py --project song.json --confirm-paid
"""
import argparse
import base64
import json
import os
from pathlib import Path

ALLOWED = {"lyria-3-clip-preview": 0.04, "lyria-3.5": 0.08}
MAX_PROMPT_CHARS = 12000

def build_prompt(project):
    title = str(project.get("title", "Untitled"))[:120]
    voice = {"female": "mature expressive female voice", "male": "mature warm male baritone",
             "instrumental": "instrumental, no vocals"}.get(project.get("voice"), "female voice")
    style = {"nostalgic": "nostalgic cinematic folk ballad", "folk": "acoustic storytelling folk",
             "piano": "emotional piano ballad", "cinematic": "cinematic strings"}.get(project.get("style"), "nostalgic cinematic folk")
    lyrics = str(project.get("lyrics", ""))
    notes = str(project.get("notes", ""))
    return (f"Create an entirely original Mandarin song titled {title}. "
            f"Style: {style}. Voice: {voice}. Natural phrasing, clear diction, expressive dynamics. "
            f"No imitation of existing melodies or identifiable artists. "
            f"Direction: {notes}\nOriginal lyrics:\n{lyrics}")[:MAX_PROMPT_CHARS]

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--project", required=True, type=Path)
    p.add_argument("--output", type=Path, default=Path("runlu-preview.mp3"))
    p.add_argument("--model", choices=ALLOWED, default="lyria-3-clip-preview")
    p.add_argument("--confirm-paid", action="store_true")
    args = p.parse_args()
    project = json.loads(args.project.read_text(encoding="utf-8"))
    prompt = build_prompt(project)
    print(f"Model: {args.model}; listed request price: USD {ALLOWED[args.model]:.2f}; actual billing may vary.")
    print(f"Output: {args.output}; prompt characters: {len(prompt)}")
    if not args.confirm_paid:
        print("DRY RUN: no request sent. Add --confirm-paid to authorize one billable generation.")
        return
    if not os.getenv("GEMINI_API_KEY"):
        raise SystemExit("Missing GEMINI_API_KEY environment variable.")
    if args.output.exists():
        raise SystemExit("Output already exists; choose another --output path.")
    from google import genai
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    interaction = client.interactions.create(model=args.model, input=prompt)
    audio = interaction.output_audio
    if audio is None or not audio.data:
        raise SystemExit("No audio returned; inspect API response and billing.")
    args.output.write_bytes(base64.b64decode(audio.data))
    print(f"Saved {args.output} ({args.output.stat().st_size} bytes)")
    if interaction.output_text:
        args.output.with_suffix(".lyrics.txt").write_text(interaction.output_text, encoding="utf-8")

if __name__ == "__main__":
    main()
