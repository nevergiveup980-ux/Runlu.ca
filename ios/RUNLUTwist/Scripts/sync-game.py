from pathlib import Path
import re
root=Path(__file__).resolve().parents[3]
source=(root/'twist.html').read_text()
target=root/'ios/RUNLUTwist/RUNLUTwist/Web/twist.html'
style=(Path(__file__).with_name('native-style.css')).read_text()
bridge=(Path(__file__).with_name('native-storage.js')).read_text()
source=source.replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data:; base-uri \'none\'; form-action \'none\'">')
source=source.replace('width=device-width,initial-scale=1','width=device-width,initial-scale=1,viewport-fit=cover')
source=re.sub(r'<style>[\s\S]*?</style>',lambda _: '<style>'+style+'</style>',source,count=1)
source=source.replace('<a href="/">RUNLU · 润庐</a>','<strong>RUNLU · 润庐</strong>')
source=source.replace(' © RUNLU.</p>', ' © RUNLU. · <a href="twist-privacy.html">Privacy / 隐私</a> · <a href="twist-support.html">Support / 支持</a></p>')
source=source.replace('stays in this browser','stays on this device').replace('仅保存在当前浏览器','仅保存在这台设备上')
source=source.replace('localStorage.', 'nativeStorage.')
source=source.replace('"use strict";', '"use strict";\n'+bridge,1)
# Native sharing never exposes file:// URLs.
source=source.replace('try{if(navigator.share)', 'if(nativeBridge){nativeBridge.postMessage({type:"share",text:message});return;}try{if(navigator.share)')
target.write_text(source)
print('Bundled gameplay synchronized from twist.html')

import shutil
shutil.copy2(Path(__file__).with_name("qa-suite.js"),target.with_name("qa-suite.js"))
