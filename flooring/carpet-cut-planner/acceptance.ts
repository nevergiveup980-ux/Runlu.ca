export type Reading={rollId:string;plannedLF:number;availableLF:number;expectedLF:string;actualLF:string};
/** Explicit comparison record, never an authenticated sign-off or cutting authorization. */
export function evaluateAcceptance(rows:Reading[],complete:boolean,reviewed:boolean,verified:boolean,job:string,reviewer:string){
 const missing=rows.some(r=>r.expectedLF.trim()===''||r.actualLF.trim()==='');
 const invalid=rows.some(r=>[r.expectedLF,r.actualLF].some(v=>v.trim()!==''&&(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(v.trim())||!Number.isFinite(Number(v))||Number(v)>r.availableLF)));
 const compared=rows.map(r=>({...r,expectedDeltaLF:r.expectedLF.trim()===''?null:r.plannedLF-Number(r.expectedLF),actualDeltaLF:r.actualLF.trim()===''?null:Number(r.actualLF)-r.plannedLF}));
 const different=compared.some(r=>r.expectedDeltaLF!==null&&Math.abs(r.expectedDeltaLF)>0.010000001||r.actualDeltaLF!==null&&Math.abs(r.actualDeltaLF)>0.010000001);
 const status=!complete||!reviewed||!verified||!job.trim()||!reviewer.trim()||!rows.length||missing||invalid?'BLOCKED':different?'FAIL':'PASS';
 return {status,toleranceLF:0.01,rows:compared,reason:status==='BLOCKED'?'Complete the plan, all pre-cut checks, job/reviewer, independent verification and valid per-roll readings.':status==='FAIL'?'At least one expected or actual length differs from the plan by more than 0.01 LF.':'Length comparisons passed; independent installation and cutting authority approval remain required.'};
}
