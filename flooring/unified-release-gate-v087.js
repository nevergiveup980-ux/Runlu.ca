(function(root){'use strict';
  const SUITES=[
    {key:'normal',name:'Normal Business',version:'0.3.81',kind:'engine',global:'RUNLUV081Regression',cycles:25,critical:true},
    {key:'adversarial',name:'Adversarial Boundary',version:'0.3.82',kind:'engine',global:'RUNLUV082Regression',cycles:50,critical:true},
    {key:'financial',name:'Financial & Lifecycle',version:'0.3.83',kind:'engine',global:'RUNLUV083Regression',cycles:100,critical:true},
    {key:'permission',name:'Permission & Concurrency',version:'0.3.84',kind:'engine',global:'RUNLUV084Regression',cycles:200,critical:true},
    {key:'recovery',name:'Data Integrity & Recovery',version:'0.3.85',kind:'engine',global:'RUNLUV085Recovery',cycles:300,critical:true},
    {key:'reconciliation',name:'Corruption & Reconciliation',version:'0.3.86',kind:'engine',global:'RUNLUV086Reconciliation',cycles:400,critical:true}
  ];
  function now(){return new Date().toISOString()}
  function blank(s){return{key:s.key,name:s.name,version:s.version,classification:'synthetic-executable',critical:s.critical,status:'NOT RUN',assertions:0,passed:0,failed:0,cycles:0,notes:'Executable synthetic regression engine.'}}
  function runEngine(s){const api=root[s.global];if(!api||typeof api.run!=='function'){const r=blank(s);r.status='UNAVAILABLE';r.notes='Regression engine not loaded.';return r}try{const x=api.run(s.cycles);return{key:s.key,name:s.name,version:s.version,classification:'synthetic-executable',critical:s.critical,status:x.pass?'PASS':'FAIL',assertions:Number(x.assertions)||0,passed:Number(x.passed)||0,failed:Number(x.failed)||0,cycles:Number(x.cycles)||s.cycles,notes:x.pass?'Deterministic synthetic engine completed in this browser session.':'One or more assertions failed.',tests:Array.isArray(x.tests)?x.tests:[]}}catch(e){const r=blank(s);r.status='FAIL';r.failed=1;r.notes='Engine exception: '+e.message;return r}}
  function evaluate(results){const critical=results.filter(x=>x.critical);const failures=critical.filter(x=>x.status==='FAIL');const incomplete=critical.filter(x=>x.status!=='PASS'&&x.status!=='FAIL');return{status:failures.length||incomplete.length?'BLOCKED':'READY',criticalTotal:critical.length,criticalPass:critical.filter(x=>x.status==='PASS').length,criticalFail:failures.length,criticalIncomplete:incomplete.length}}
  function run(){const startedAt=now();const results=SUITES.map(runEngine);const gate=evaluate(results);const finishedAt=now();return{schema:'runlu.quality-evidence.v1',gateVersion:'0.3.88',product:'RUNLU Flooring OS',environment:'browser-synthetic-gate',startedAt,finishedAt,gate,results,boundaries:['Synthetic regression is not production certification.','All six required suites are executable in this unified browser gate.','UNAVAILABLE and NOT RUN never count as PASS.','Production release must remain blocked while any critical suite is not PASS.']}}
  root.RUNLUV087ReleaseGate={version:'0.3.88',suites:SUITES,run,evaluate};
})(typeof window!=='undefined'?window:globalThis);