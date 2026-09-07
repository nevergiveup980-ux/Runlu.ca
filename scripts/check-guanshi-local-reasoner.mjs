globalThis.window = {};
await import('../guanshi-local-reasoner.js');
const engine = globalThis.window.GUANSHI_LOCAL_REASONER;
if (!engine || !engine.version?.startsWith('2.1-local-reasoner')) throw new Error('Local reasoner export/version missing');

const general = engine.analyze({
  mode:'general', language:'en',
  fields:{question:'Should we launch now?',facts:'Prototype works\nBudget is limited',options:'Launch now\nPilot first',constraints:'Avoid irreversible spend',stakes:'high',horizon:'1m'},
  knowledge:[{id:'GS-CORE-REALITY',status:'Supported',source:'GUANSHI.md',summary:'Reality first.'}]
});
if (!general.text.includes('LOCAL BASELINE')) throw new Error('General local baseline missing title');
if (!general.text.includes('High-stakes case')) throw new Error('High-stakes posture missing');
if (!general.knowledgeIds.includes('GS-CORE-REALITY')) throw new Error('Knowledge trace missing');
if (general.completeness !== 100) throw new Error(`Unexpected completeness ${general.completeness}`);

const zh = engine.analyze({mode:'general',language:'zh',fields:{question:'现在该不该做？',stakes:'medium'},knowledge:[]});
if (!zh.text.includes('本地观势基线')) throw new Error('Chinese baseline missing');
if (!zh.text.includes('还缺什么')) throw new Error('Chinese missing-data section missing');

const traditional = engine.analyze({mode:'traditional',language:'en',fields:{method:'bazi',question:'What should I watch?',facts:'Job offer is real',decision:'Accept or wait'},knowledge:[]});
if (!traditional.text.includes('Traditional material is kept in a separate ledger')) throw new Error('Traditional boundary missing');
if (!traditional.text.includes('does not fabricate chart/cast calculations')) throw new Error('Traditional local limit missing');

console.log('GUANSHI local reasoner checks passed.');