import fs from 'node:fs';import vm from 'node:vm';
const files=['flooring/warehouse-po-handoff-v001.js','flooring/warehouse-work-sync-v090.js'];
for(const p of files){const s=fs.readFileSync(p,'utf8');new vm.Script(s,{filename:p})}
const handoff=fs.readFileSync(files[0],'utf8'),sync=fs.readFileSync(files[1],'utf8');
const must=(x,m)=>{if(!x)throw new Error(m)};
must(/CANCELLED ORDER — DO NOT PICK UP \/ RECEIVE/.test(handoff),'cancelled handoff warning missing');
must(/po\?\.status==='Cancelled'\)return ''/.test(handoff),'cancelled Warehouse URL not blocked');
must(/Cancelled PO — Warehouse receiving is blocked/.test(handoff),'cancelled open guard missing');
must(/about:blank/.test(handoff),'cancelled iframe quarantine missing');
must(/async function reconcileCancelledPlans/.test(sync),'cloud cancellation reconciliation missing');
must(/p_status:'Cancelled'/.test(sync),'cloud task cancellation status missing');
must(/\['Completed','Cancelled'\]/.test(sync),'terminal cloud task guard missing');
must(/localPO\?\.status==='Cancelled'/.test(sync),'local cancellation UI precedence missing');
must(/x\?\.status!=='Cancelled'/.test(sync),'cancelled PO exclusion from plan creation missing');
console.log('Cancelled order quarantine V1: PASS');