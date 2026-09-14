import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sim=require('../flooring/engineering-simulator-v010.js');

const stress=Math.max(100,Number(process.env.RUNLU_SIM_STRESS||5000));
const chaos=Math.max(100,Number(process.env.RUNLU_SIM_CHAOS||1000));
const seed=Number(process.env.RUNLU_SIM_SEED||20260914);

if(typeof sim.runAll!=='function')throw new Error('Engineering simulator missing runAll()');
const report=sim.runAll({stress,chaos,seed});
fs.writeFileSync('flooring-engineering-simulator-report.json',JSON.stringify(report,null,2));

const s=report.scenarios;
console.log(`${s.pass?'PASS':'FAIL'} · Company workflow scenarios · ${s.passed}/${s.tests.length}`);
console.log(`${report.stress.pass?'PASS':'FAIL'} · Stress · ${report.stress.attemptedOperations} operations · seed ${report.stress.seed}`);
console.log(`${report.chaos.pass?'PASS':'FAIL'} · Chaos · ${report.chaos.attemptedOperations} hostile attempts · ${report.chaos.safeRejects} safely rejected · seed ${report.chaos.seed}`);
console.log(`Isolation · ${report.environment} · production data access: NONE`);

if(!report.pass){
  console.error('ENGINEERING SIMULATOR: FAIL');
  if(!s.pass)console.error('Scenario failures:',s.tests.filter(x=>!x.pass));
  if(report.stress.failure)console.error('Stress failure:',report.stress.failure);
  if(report.chaos.failure)console.error('Chaos failure:',report.chaos.failure);
  process.exit(1);
}
console.log('ENGINEERING SIMULATOR: PASS');
