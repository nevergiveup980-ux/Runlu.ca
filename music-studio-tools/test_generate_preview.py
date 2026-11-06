"""Offline tests; do not call any provider or incur charges."""
import importlib.util
import pathlib
import unittest

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
