from pathlib import Path
import json,plistlib,re
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
print('Package, property lists, offline dependencies and metadata lengths validated.')
