import hashlib
import unittest
from publish_audio import publish

OWNER='00000000-0000-4000-8000-000000000a01'
SONG='00000000-0000-4000-8000-000000001a01'
VERSION='00000000-0000-4000-8000-000000002a01'

class PublicationTests(unittest.TestCase):
    def fixture(self, corrupt=False, existing=False, rpc_failure=False):
        data=b'ID3'+b'a'*200
        calls=[]
        def send(method,path,payload):
            calls.append((method,path,payload))
            if '/admin/users/' in path: return {'id': OWNER, 'is_anonymous':False}
            if 'runlu_music_songs?' in path: return []
            if 'runlu_music_versions?' in path: return [{'version_id':VERSION}] if existing else []
            if '/authenticated/' in path: return b'corrupt' if corrupt else data
            if '/rpc/' in path and rpc_failure: raise TimeoutError('private-key')
            return {}
        args=dict(data=data, metadata={'duration':182,'sha256':hashlib.sha256(data).hexdigest(),'audio_bytes':len(data)},owner=OWNER,song=SONG,version_id=VERSION,title='Original',version='V1',source='imported',send=send)
        return args,calls
    def test_publish_only_after_persisted_hash_verified(self):
        args,calls=self.fixture()
        self.assertEqual(publish(**args),VERSION)
        self.assertIn('/authenticated/',calls[-2][1])
        self.assertIn('/rpc/',calls[-1][1])
    def test_corrupt_readback_does_not_publish(self):
        args,calls=self.fixture(corrupt=True)
        with self.assertRaisesRegex(RuntimeError,'STORAGE_VERIFICATION_FAILED'): publish(**args)
        self.assertFalse(any('/rpc/' in c[1] for c in calls))
    def test_existing_version_does_not_upload(self):
        args,calls=self.fixture(existing=True)
        with self.assertRaisesRegex(ValueError,'VERSION_ALREADY_EXISTS'): publish(**args)
        self.assertFalse(any(c[0]=='POST' for c in calls))
    def test_ambiguous_completion_never_retries(self):
        args,calls=self.fixture(rpc_failure=True)
        with self.assertRaisesRegex(RuntimeError,'NEEDS_REVIEW_NO_RETRY'): publish(**args)
        self.assertEqual(sum('/rpc/' in c[1] for c in calls),1)

if __name__=='__main__': unittest.main()
