"""Verify a locally built .app or .xcarchive against this checkout; no network/upload."""
from pathlib import Path
import hashlib, json, plistlib, sys
source = Path(__file__).resolve().parents[1] / 'RUNLUTwist'
product = Path(sys.argv[1]).resolve()
if product.suffix == '.xcarchive':
    apps = list((product / 'Products/Applications').glob('*.app'))
    assert len(apps) == 1, 'Expected exactly one app'
    product = apps[0]
info = plistlib.loads((product / 'Info.plist').read_bytes())
assert info['CFBundleIdentifier'] == 'ca.runlu.twist'
assert info['CFBundleShortVersionString'] == '1.1'
assert info['CFBundleVersion'] == '4'
assert info['UIDeviceFamily'] == [1]
assert info['MinimumOSVersion'] == '17.0'
resources = {}
for name in ['twist.html', 'twist-privacy.html', 'twist-support.html', 'qa-suite.js']:
    expected = (source / 'Web' / name).read_bytes()
    actual = (product / 'Web' / name).read_bytes()
    assert actual == expected, f'Bundled {name} differs from current source'
    resources[name] = hashlib.sha256(actual).hexdigest()
assert (product / 'Assets.car').is_file()
assert info['CFBundleIcons']['CFBundlePrimaryIcon']['CFBundleIconName'] == 'AppIcon'
assert plistlib.loads((product / 'PrivacyInfo.xcprivacy').read_bytes())['NSPrivacyTracking'] is False
binary = (product / info['CFBundleExecutable']).read_bytes()
for flag in [b'-twist-qa-suite', b'-twist-qa-corrupt', b'-twist-qa-large-type', b'-twist-dark']:
    assert flag not in binary, f'DEBUG launch hook remains in Release binary: {flag!r}'
print(json.dumps({'result': 'PASS', 'product': str(product), 'bundleId': info['CFBundleIdentifier'],
                  'version': info['CFBundleShortVersionString'], 'build': info['CFBundleVersion'],
                  'deviceFamily': info['UIDeviceFamily'], 'minimumOS': info['MinimumOSVersion'],
                  'resourcesSHA256': resources, 'releaseDebugHooksAbsent': True}, indent=2))
