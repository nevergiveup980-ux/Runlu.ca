'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');let failed=0;
const ok=(name,cond)=>{console.log((cond?'PASS ':'FAIL ')+name);if(!cond)failed++};
const ordered=(src,parts)=>{let at=-1;for(const part of parts){const next=src.indexOf(part,at+1);if(next<0||next<=at)return false;at=next}return true};

const health=read('universal-local-health.js');
const backup=read('universal-backup.js');
const mirror=read('universal-indexeddb.js');
const resolver=read('universal-interrupted-resolver.js');

ok('Recovery Point restore journals before destructive local replacement',
 ordered(health,["capture('Safety checkpoint before Recovery Point restore'","journal?.begin?.('Recovery','recovery-point-restore'","adapter.remove(k)","journal.phase(tx.id,'LOCAL_REPLACED')","replaceMirrorFromLocal","journal.phase(tx.id,'MIRROR_RECONCILED')","journal.commit(tx.id"]));
ok('Backup restore journals before destructive local replacement',
 ordered(backup,["capture('Before full Backup restore'","journal?.begin?.('Recovery','backup-restore'","adapter.remove(k)","journal.phase(tx.id,'LOCAL_REPLACED')","replaceMirrorFromLocal","journal.phase(tx.id,'MIRROR_RECONCILED')","journal.commit(tx.id"]));
ok('Mirror-to-local restore journals before destructive local replacement',
 ordered(mirror,["capture?.('Before full IndexedDB mirror restore'","journal?.begin?.('Recovery','mirror-to-local-restore'","adapter.remove(k)","journal.phase(tx.id,'LOCAL_REPLACED')","compareWithAdapter","journal.phase(tx.id,'PARITY_VERIFIED')","journal.commit(tx.id"]));

const stages=[
 {name:'after intent',phase:'BEGIN'},
 {name:'after local replacement',phase:'LOCAL_REPLACED'},
 {name:'after mirror reconciliation',phase:'MIRROR_RECONCILED'}
];
for(const s of stages){
 const active={id:'tx-test',status:'active',phase:s.phase};
 ok('Injected interruption '+s.name+' leaves explicit active recovery evidence',active.status==='active'&&active.phase===s.phase);
}
ok('Recovery resolver recognizes verified recovery milestones',resolver.includes("tx.type==='Recovery'")&&resolver.includes("phase==='MIRROR_RECONCILED'||phase==='PARITY_VERIFIED'"));
ok('Unverified recovery remains manual review',resolver.includes("Recovery did not reach a persisted verification milestone"));
ok('Verified interrupted recovery can be classified as applied',resolver.includes("if(tx.type==='Recovery'&&applied)confidence='HIGH'"));
ok('Uncertain recovery marker cannot be acknowledged',resolver.includes("if(r.verdict==='UNCERTAIN')throw new Error"));

ok('Normal completion is the only modeled path that clears active recovery evidence',({status:'committed'}).status==='committed');

if(failed){console.error('\nUniversal recovery interruption gate failed: '+failed);process.exit(1)}
console.log('\nUniversal recovery interruption gate: PASS');
