from pathlib import Path
import json,plistlib,re,sys
r=Path(__file__).resolve().parents[1]
s=(r/'RUNLUTwist/Web/twist.html').read_text()
assert 'connect-src' not in s and "default-src 'none'" in s
assert not re.search(r'<(?:script|link|img)[^>]+(?:src|href)=[\"\']https?://',s)
for p in [r/'RUNLUTwist/Info.plist',r/'RUNLUTwist/PrivacyInfo.xcprivacy']:
    plistlib.loads(p.read_bytes())
d=json.loads((r/'Release/app-store-metadata.json').read_text())
for locale,v in d['localizations'].items():
    for field,limit in [('name',30),('subtitle',30),('promotionalText',170),('description',4000),('keywords',100)]:
        assert len(v[field])<=limit,(locale,field)
assert (r/'RUNLUTwist/Assets.xcassets/AppIcon.appiconset/AppIcon.png').exists()
if len(sys.argv)>1:
    archive=Path(sys.argv[1])
    apps=list((archive/'Products/Applications').glob('*.app/Info.plist'))
    assert len(apps)==1,'Expected one application in archive'
    info=plistlib.loads(apps[0].read_bytes())
    assert info['UIDeviceFamily']==[1], 'Release archive must target iPhone only'
    assert info['CFBundleIdentifier']==d['bundleId']
    assert info['CFBundleShortVersionString']==d['version']
    assert info['CFBundleVersion']==d['build']
    print('Actual archive device family, Bundle ID, version and build validated.')
print('Package, property lists, offline dependencies and metadata lengths validated.')
