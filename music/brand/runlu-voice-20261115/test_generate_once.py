"""Mocked transport regression: never calls provider or installs tools."""
import base64
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import urllib.error
import generate_once as g

class Tests(unittest.TestCase):
    def invoke(self, output, paid=True):
        argv=['generate_once','--output',str(output)]+(['--confirm-paid'] if paid else [])
        with patch('sys.argv',argv):
            g.main()

    def test_dry_run_no_network_no_files(self):
        with tempfile.TemporaryDirectory() as folder, patch.object(g.urllib.request,'build_opener') as opener:
            target=Path(folder)/'new'
            self.invoke(target,False)
            opener.assert_not_called()
            self.assertFalse(target.exists())

    def test_rerun_rejected_before_network(self):
        with patch.dict(os.environ,{'GITHUB_RUN_ATTEMPT':'2'}), patch.object(g.urllib.request,'build_opener') as opener:
            with self.assertRaises(SystemExit):self.invoke(Path('must-not-write'))
            opener.assert_not_called()

    def test_multiple_audio_blocks_rejected(self):
        block={'type':'audio','data':base64.b64encode(b'ID3'+b'a'*200).decode()}
        with self.assertRaises(ValueError):g.extract({'steps':[{'type':'model_output','content':[block,block]}]})

    def test_redirect_not_followed(self):
        self.assertIsNone(g.NoRedirect().redirect_request(None,None,302,'',{},'https://example.test'))

    def test_failure_stops_pair_and_records_reason_no_retry(self):
        error=urllib.error.HTTPError('https://example.test',400,'bad',{},io.BytesIO(b'{"error":{"status":"INVALID_ARGUMENT","message":"fixture-key invalid"}}'))
        with tempfile.TemporaryDirectory() as folder, patch.dict(os.environ,{'GITHUB_RUN_ATTEMPT':'1','RUNLU_MUSIC_GEMINI_API_KEY':'fixture-key'}), patch.object(g.subprocess,'run'), patch.object(g.urllib.request,'build_opener') as opener:
            opener.return_value.open.side_effect=error
            target=Path(folder)/'new'
            with self.assertRaises(SystemExit):self.invoke(target)
            self.assertEqual(opener.return_value.open.call_count,1)
            result=json.loads((target/'results.json').read_text())
            self.assertEqual(len(result['results']),1)
            self.assertEqual(result['results'][0]['http_status'],400)
            self.assertNotIn('fixture-key',json.dumps(result))

    def test_success_two_requests_distinct_files_and_hashes(self):
        payload=json.dumps({'steps':[{'type':'model_output','content':[{'type':'audio','data':base64.b64encode(b'ID3'+b'a'*200).decode()}]}]}).encode()
        with tempfile.TemporaryDirectory() as folder, patch.dict(os.environ,{'GITHUB_RUN_ATTEMPT':'1','RUNLU_MUSIC_GEMINI_API_KEY':'fixture-key'}), patch.object(g.subprocess,'run'), patch.object(g.subprocess,'check_output',return_value=b'{"format":{"duration":"175.1"},"streams":[{"codec_name":"mp3","sample_rate":"44100","channels":2}]}'), patch.object(g.urllib.request,'build_opener') as opener:
            opener.return_value.open.side_effect=lambda *a,**k:io.BytesIO(payload)
            target=Path(folder)/'new'
            self.invoke(target)
            self.assertEqual(opener.return_value.open.call_count,2)
            result=json.loads((target/'results.json').read_text())
            self.assertEqual(len(result['results']),2)
            self.assertEqual(len(list(target.glob('*.mp3'))),2)
            for e in result['results']:
                self.assertEqual(e['quality_flags'],[])
                self.assertEqual(len(e['sha256']),64)
                self.assertIn('not_listening_approved',e['state'])
            with self.assertRaises(FileExistsError):self.invoke(target)
            self.assertEqual(opener.return_value.open.call_count,2)

if __name__=='__main__':unittest.main()
