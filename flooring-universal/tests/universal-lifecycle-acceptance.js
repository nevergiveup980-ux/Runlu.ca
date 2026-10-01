const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');const html=read('index.html');let failed=0;function ok(n,c){console.log((c?'PASS ':'FAIL ')+n);if(!c)failed++}
ok('Today action view exists',html.includes('TODAY · ACTION NEEDED')&&html.includes('universalToday'));
ok('Seven lifecycle modules represented',['Sales & Jobs','Supplier Orders','Receiving','Warehouse','Installation','Customer Billing','Accounting'].every(x=>html.includes(x)));
ok('Priority logic covers exception/review/partial',/exception\|attention\|review\|partial/.test(html));
ok('Direct navigation focus exists',html.includes('todayFocus')&&html.includes('ACTION NEEDED'));
for(const [file,cls] of [['universal-sales.js','uJobCard'],['universal-po.js','uPORow'],['universal-inbound.js','uInbound'],['universal-warehouse.js','uWHRow'],['universal-installation.js','uInstall'],['universal-billing.js','uBill'],['universal-accounting.js','uAcct']]){const s=read(file);ok(file+' runtime API',s.includes('window.RUNLUUniversal'));ok(file+' record identity',s.includes('data-record-id='));ok(file+' record status',s.includes('data-record-status='))}
ok('Sales quote state exposed',read('universal-sales.js').includes('data-quote-status='));
if(failed){console.error('\nUniversal lifecycle acceptance failed: '+failed);process.exit(1)}console.log('\nUniversal lifecycle acceptance: PASS');
// Static shell closure: every local script/style referenced by index must exist in the Universal tree.
const refs=[...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)].map(x=>x[1]).filter(x=>!/^https?:|^data:|^#/.test(x));
for(const ref of refs){const clean=ref.split('?')[0].replace(/^\.\//,'');ok('Shell asset exists: '+clean,fs.existsSync(path.join(root,clean)))}
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]),dupes=ids.filter((x,i)=>ids.indexOf(x)!==i);ok('No duplicate DOM ids',dupes.length===0);
ok('Universal shell has no Deerfoot production route',!/[\x27\x22\x60]\/flooring\//.test(html));
if(failed){console.error('\nUniversal lifecycle acceptance failed after shell closure: '+failed);process.exit(1)}
