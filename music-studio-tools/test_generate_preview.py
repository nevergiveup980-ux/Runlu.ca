"""Offline tests; do not call any provider or incur charges."""
import importlib.util
import pathlib
import unittest
import io
import wave

MODULE = pathlib.Path(__file__).with_name("generate_preview.py")
spec = importlib.util.spec_from_file_location("generate_preview", MODULE)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class ProjectValidationTests(unittest.TestCase):
    def test_valid_song(self):
        project = {"title":"风吹过的那些年","lyrics":"风吹过那些年","voice":"female","style":"nostalgic"}
        self.assertEqual(mod.validate_project(project), project)
        prompt = mod.build_prompt(project)
        self.assertIn("风吹过那些年", prompt)
        self.assertIn("original", prompt.lower())

    def test_instrumental_prompt_never_requests_singing(self):
        project = {"title": "风吹过的那些年", "lyrics": "仅作为意境", "voice": "instrumental", "style": "piano"}
        mod.validate_project(project)
        prompt = mod.build_prompt(project)
        self.assertIn("No singing", prompt)
        self.assertIn("Instrumental theme inspiration", prompt)
        self.assertNotIn("Original lyrics (sing only", prompt)

    def test_vocal_prompt_contains_production_requirements(self):
        project = {"title": "风吹过的那些年", "lyrics": "第一句", "voice": "female", "style": "nostalgic"}
        prompt = mod.build_prompt(mod.validate_project(project))
        self.assertIn("clear Mandarin diction", prompt)
        self.assertIn("memorable emotional peak", prompt)
        self.assertIn("do not add invented lines", prompt)

    def test_audio_signature_detection(self):
        self.assertEqual(mod.detect_audio_format(b"ID3" + bytes(16)), ".mp3")
        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(16000)
            wav.writeframes(bytes(320))
        self.assertEqual(mod.detect_audio_format(buffer.getvalue()), ".wav")
        with self.assertRaises(ValueError):
            mod.detect_audio_format(buffer.getvalue()[:-8])
        self.assertEqual(mod.detect_audio_format(bytes(4) + b"ftypM4A " + bytes(8)), ".m4a")
        with self.assertRaises(ValueError):
            mod.detect_audio_format(b"not an audio file")
        with self.assertRaises(ValueError):
            mod.detect_audio_format(b"")

    def test_reject_empty_vocal_lyrics(self):
        with self.assertRaises(ValueError):
            mod.validate_project({"voice":"female","lyrics":" "})

    def test_allow_instrumental_without_lyrics(self):
        mod.validate_project({"voice":"instrumental","lyrics":""})

    def test_reject_unknown_style(self):
        with self.assertRaises(ValueError):
            mod.validate_project({"voice":"female","style":"imitation","lyrics":"hello"})

    def test_reject_oversize_notes(self):
        with self.assertRaises(ValueError):
            mod.validate_project({"voice":"female","lyrics":"hello","notes":"x"*2001})

    def test_reject_non_string_lyrics(self):
        with self.assertRaises(ValueError):
            mod.validate_project({"voice":"female","lyrics":["not","a","string"]})

if __name__ == "__main__":
    unittest.main()
