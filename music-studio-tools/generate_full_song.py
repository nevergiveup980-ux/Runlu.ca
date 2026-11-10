#!/usr/bin/env python3
"""Explicitly authorized single-request full-song generation; no automatic retries."""
import argparse
import base64
import json
import os
import pathlib
import urllib.error
import urllib.request

from generate_preview import build_prompt, detect_audio_format, save_audio_safely, validate_project

API = "https://generativelanguage.googleapis.com/v1beta/interactions"
MODEL = "lyria-3.5"
MAX_RESPONSE = 36 * 1024 * 1024

def extract_audio(result):
    blocks = [block for step in result.get("steps", [])
              if step.get("type") == "model_output"
              for block in step.get("content", [])]
    for block in blocks:
        if block.get("type") == "audio" and isinstance(block.get("data"), str):
            return base64.b64decode(block["data"], validate=True)
    raise ValueError("Provider returned no inline audio. Do not retry without checking billing.")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--confirm-paid", action="store_true")
    args = parser.parse_args()
    project = validate_project(json.loads(pathlib.Path(args.project).read_text(encoding="utf-8")))
    prompt = build_prompt(project)
    print("Model:", MODEL, "Prompt length:", len(prompt))
    if not args.confirm_paid:
        print("DRY RUN ONLY. No provider request sent.")
        return
    key = os.environ.get("RUNLU_MUSIC_GEMINI_API_KEY")
    if not key:
        raise SystemExit("RUNLU_MUSIC_GEMINI_API_KEY secret missing")
    output = pathlib.Path(args.output)
    if output.exists():
        raise SystemExit("Output already exists")
    request = urllib.request.Request(API,
        data=json.dumps({"model": MODEL, "input": prompt}, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json", "Api-Revision": "2026-05-20",
                 "x-goog-api-key": key}, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=240) as response:
            raw = response.read(MAX_RESPONSE + 1)
    except (urllib.error.URLError, TimeoutError) as exc:
        raise SystemExit("Provider request failed or timed out; billing may have occurred. No automatic retry.") from exc
    if len(raw) > MAX_RESPONSE:
        raise SystemExit("Provider response too large")
    payload = extract_audio(json.loads(raw))
    ext = detect_audio_format(payload)
    if output.suffix.lower() != ext:
        raise SystemExit(f"Provider returned {ext}, not {output.suffix}. No file saved.")
    save_audio_safely(output, payload)
    print(f"Generated {output} ({output.stat().st_size} bytes)")

if __name__ == "__main__":
    main()
