#!/usr/bin/env python3
"""RUNLU MUSIC Studio: manually triggered Lyria preview (never auto-runs).
Requires: pip install google-genai; export GEMINI_API_KEY=...
Usage: python music-studio-tools/generate_preview.py --project song.json --confirm-paid
"""
import argparse
import base64
import json
import io
import wave
import os
import tempfile
from pathlib import Path

ALLOWED = ("lyria-3-clip-preview", "lyria-3.5")
MAX_PROMPT_CHARS = 12000
MAX_PROJECT_BYTES = 100_000
MAX_AUDIO_BYTES = 50 * 1024 * 1024
VALID_VOICES = {"female", "male", "instrumental"}
VALID_STYLES = {"nostalgic", "folk", "piano", "cinematic"}

def validate_project(project):
    if not isinstance(project, dict):
        raise ValueError("Project must be a JSON object")
    if project.get("voice", "female") not in VALID_VOICES:
        raise ValueError("Invalid voice selection")
    if project.get("style", "nostalgic") not in VALID_STYLES:
        raise ValueError("Invalid style selection")
    for field, limit in (("title", 120), ("lyrics", 10000), ("notes", 2000)):
        value = project.get(field, "")
        if not isinstance(value, str) or len(value) > limit:
            raise ValueError(f"Invalid {field} field")
    if not project.get("lyrics", "").strip() and project.get("voice", "female") != "instrumental":
        raise ValueError("Vocal song requires lyrics")
    return project

def build_prompt(project):
    """Match the Studio's song/voice/arrangement guidance in manual dry runs."""
    title = project.get("title", "Untitled")[:120]
    voice_key = project.get("voice", "female")
    instrumental = voice_key == "instrumental"
    voice = {"female": "mature expressive female voice",
             "male": "mature warm slightly husky male baritone",
             "instrumental": "instrumental only, no vocals"}[voice_key]
    style = {"nostalgic": "nostalgic cinematic folk ballad",
             "folk": "intimate acoustic storytelling folk",
             "piano": "emotional piano ballad",
             "cinematic": "cinematic strings and acoustic guitar"}[project.get("style", "nostalgic")]
    notes = project.get("notes", "").strip()
    language = project.get("language", "zh")
    if language not in ("zh", "en", "fr", "es"):
        raise ValueError("Unsupported song language")
    language_name = {"zh": "Mandarin Chinese", "en": "English", "fr": "French", "es": "Spanish"}[language]
    lines = [
        "Compose an entirely original instrumental piece." if instrumental else f"Create an entirely original {language_name}-language song.",
        f"Working title: {title}.",
        f"Style: {style}.",
        f"Voice: {voice}.",
        "Structure: a clear opening, developing verse, memorable emotional peak, and a resolved ending.",
        "Arrangement: preserve space for the main melody, avoid clutter, build dynamics naturally.",
        ("No singing, spoken words, vocal samples, or synthetic choir." if instrumental else
         f"Vocal direction: natural phrasing, expressive dynamics, believable breathing, clear {language_name} diction, and restrained vibrato."),
        "Originality: compose a new melody and arrangement; do not imitate existing recordings, copyrighted melodies, or identifiable artist voices.",
        "Production: balanced mix, no clipping, no abrupt cutoff, export clean full-length audio when supported.",
    ]
    if notes:
        lines.append(f"Additional direction: {notes}")
    lines.append(("Instrumental theme inspiration (not to be sung):\n" if instrumental else
                  "Original lyrics (sing only the provided words; do not add invented lines):\n") +
                 project.get("lyrics", ""))
    result = "\n".join(lines)
    if len(result) > MAX_PROMPT_CHARS:
        raise ValueError("Generation prompt exceeds size limit; shorten the lyrics or notes")
    return result

def detect_audio_format(payload):
    """Conservative signature check; not a full decoder or security scanner."""
    if not isinstance(payload, bytes) or len(payload) < 12:
        raise ValueError("Audio payload is empty or too short")
    if len(payload) > MAX_AUDIO_BYTES:
        raise ValueError("Audio exceeds 50 MB limit")
    if payload.startswith(b"ID3") or (payload[0] == 0xFF and payload[1] & 0xE0 == 0xE0 and payload[2] & 0xF0 != 0xF0):
        return ".mp3"
    if payload.startswith(b"RIFF") and payload[8:12] == b"WAVE":
        try:
            with wave.open(io.BytesIO(payload), "rb") as wav:
                if wav.getnchannels() < 1 or wav.getframerate() < 1 or wav.getnframes() < 1:
                    raise ValueError("WAV contains no usable audio frames")
                expected = wav.getnframes() * wav.getnchannels() * wav.getsampwidth()
                if len(wav.readframes(wav.getnframes())) != expected:
                    raise ValueError("WAV audio data is truncated")
        except (wave.Error, EOFError) as exc:
            raise ValueError(f"Invalid WAV audio: {exc}") from exc
        return ".wav"
    if payload[4:8] == b"ftyp" and payload[8:12] in (b"M4A ", b"isom", b"mp42"):
        return ".m4a"
    raise ValueError("Unknown audio format; no file saved")


def save_audio_safely(output, payload):
    """Write beside the destination, then atomically publish without overwriting."""
    output = Path(output)
    if output.exists():
        raise FileExistsError(f"Output already exists: {output}")
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(mode="wb", prefix=".runlu-audio-", suffix=".tmp",
                                         dir=output.parent, delete=False) as temp:
            temp_path = Path(temp.name)
            temp.write(payload)
            temp.flush()
            os.fsync(temp.fileno())
        # Hard-link creation is atomic and fails if the target already exists.
        os.link(temp_path, output)
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--project", required=True, type=Path)
    p.add_argument("--output", type=Path, default=Path("runlu-preview.mp3"))
    p.add_argument("--model", choices=ALLOWED, default="lyria-3-clip-preview")
    p.add_argument("--confirm-paid", action="store_true")
    args = p.parse_args()
    if args.project.stat().st_size > MAX_PROJECT_BYTES:
        raise SystemExit("Project JSON exceeds size limit")
    try:
        project = validate_project(json.loads(args.project.read_text(encoding="utf-8")))
    except (ValueError, UnicodeError) as exc:
        raise SystemExit(f"Invalid project: {exc}")
    prompt = build_prompt(project)
    print(f"Model: {args.model}; price NOT verified in this script. Check current official billing before authorizing.")
    print(f"Output: {args.output}; prompt characters: {len(prompt)}")
    if not args.confirm_paid:
        print("DRY RUN: no request sent. Add --confirm-paid only after verifying API model support, price and permissions.")
        return
    if not os.getenv("GEMINI_API_KEY"):
        raise SystemExit("Missing GEMINI_API_KEY environment variable.")
    if args.output.exists():
        raise SystemExit("Output already exists; choose another --output path.")
    # Provider response schema and model availability must be validated in a real integration test.
    from google import genai
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    interaction = client.interactions.create(model=args.model, input=prompt)
    audio = interaction.output_audio
    if audio is None or not audio.data:
        raise SystemExit("No audio returned; inspect API response and billing.")
    try:
        if len(audio.data) > ((MAX_AUDIO_BYTES + 2) // 3) * 4 + 16:
            raise ValueError("Encoded audio exceeds 50 MB limit")
        payload = base64.b64decode(audio.data, validate=True)
        extension = detect_audio_format(payload)
    except (ValueError, base64.binascii.Error) as exc:
        raise SystemExit(f"Invalid provider audio: {exc}")
    if args.output.suffix.lower() != extension:
        raise SystemExit(f"Audio is {extension}, not {args.output.suffix or 'an identified format'}; choose an output filename ending in {extension}. No file saved.")
    try:
        save_audio_safely(args.output, payload)
    except (OSError, FileExistsError) as exc:
        raise SystemExit(f"Could not save audio safely: {exc}")
    print(f"Saved {args.output} ({args.output.stat().st_size} bytes)")
    if interaction.output_text:
        args.output.with_suffix(".lyrics.txt").write_text(interaction.output_text, encoding="utf-8")

if __name__ == "__main__":
    main()
