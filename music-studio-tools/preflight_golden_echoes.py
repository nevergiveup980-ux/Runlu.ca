#!/usr/bin/env python3
"""Offline-only validation for the Golden Echoes duet; never calls an API."""
import json
from pathlib import Path
from generate_preview import validate_project, build_prompt

root = Path(__file__).resolve().parent
project = validate_project(json.loads((root / "when-the-lights-go-down-duet.json").read_text(encoding="utf-8")))
assert project["voice"] == "duet"
assert project["style"] == "blues_pop"
assert project["language"] == "en"
lyrics = project["lyrics"]
for marker in ("[Verse 1 — Male]", "[Verse 2 — Female]", "[Chorus — Together]", "[Final Chorus — Together]", "[Outro]"):
    assert marker in lyrics, f"Missing singer cue: {marker}"
assert "Love still glows when the lights go down." in lyrics
prompt = build_prompt(project)
assert len(prompt) <= 12000, "Prompt exceeds current Python generator limit"
assert "distinct mature warm husky male baritone and soulful female alto" in prompt
print(json.dumps({
    "mode": "offline_preflight",
    "api_calls": 0,
    "paid_requests": 0,
    "title": project["title"],
    "lyrics_characters": len(lyrics),
    "prompt_characters": len(prompt),
    "historical_js_limit": 2000,
    "python_prompt_limit": 12000,
    "warning": "The 2000-character limit was imposed by an old local adapter, not verified as a Google provider limit. No provider permission, quota, or billing verified."
}, ensure_ascii=False))
