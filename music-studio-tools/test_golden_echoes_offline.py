#!/usr/bin/env python3
"""Offline unit tests for provider response handling; no network or API key."""
import base64
import unittest
from unittest.mock import patch
import urllib.error
from generate_full_song import extract_audio, API, MODEL
from generate_preview import detect_audio_format

class TestLyriaContract(unittest.TestCase):
    def test_endpoint_and_model(self):
        self.assertEqual(API, "https://generativelanguage.googleapis.com/v1beta/interactions")
        self.assertEqual(MODEL, "lyria-3.5")

    def test_valid_audio_block(self):
        mp3 = b"ID3" + bytes(32)
        response = {"steps": [{"type": "model_output", "content": [
            {"type": "audio", "data": base64.b64encode(mp3).decode("ascii"), "mime_type": "audio/mpeg"}
        ]}]}
        self.assertEqual(extract_audio(response), mp3)
        self.assertEqual(detect_audio_format(mp3), ".mp3")

    def test_no_audio_fails_closed(self):
        with self.assertRaisesRegex(ValueError, "no inline audio"):
            extract_audio({"steps": [{"type": "model_output", "content": [{"type": "text", "text": "no audio"}]}]})

    def test_invalid_base64_fails_closed(self):
        with self.assertRaises(ValueError):
            extract_audio({"steps": [{"type": "model_output", "content": [{"type": "audio", "data": "not base64!!!"}]}]})

    def test_mock_http_error_never_calls_network(self):
        error = urllib.error.HTTPError(API, 403, "Forbidden", {}, None)
        with patch("urllib.request.urlopen", side_effect=error) as request:
            with self.assertRaises(urllib.error.HTTPError) as caught:
                request("dummy")
            self.assertEqual(caught.exception.code, 403)
            self.assertEqual(request.call_count, 1)

if __name__ == "__main__":
    unittest.main(verbosity=2)
