const common={settings:{shortRollFirst:false,widthAllowance:0,lengthAllowance:0,patternRepeat:0}};
export const demoOrders=[
 {id:'01',name:'Standard Carpet Job',...common,rolls:[{id:'DEMO-FULL-A',w:12,l:40,lot:'DEMO-A',stockType:'FULL' as const}],pieces:[{id:'DEMO Living',w:8,l:12,lot:'DEMO-A',rotate:false},{id:'DEMO Bedroom',w:6,l:10,lot:'DEMO-A',rotate:false},{id:'DEMO Hall',w:4,l:12,lot:'DEMO-A',rotate:false}]},
 {id:'02',name:'Multiple Rolls & Remnants',settings:{...common.settings,shortRollFirst:true},rolls:[{id:'DEMO-FULL',w:12,l:76,lot:'DEMO-A',stockType:'FULL' as const},{id:'DEMO-REMNANT',w:8,l:25,lot:'DEMO-A',stockType:'REMNANT' as const},{id:'DEMO-SHORT',w:12,l:12,lot:'DEMO-A',stockType:'SHORT' as const}],pieces:[{id:'DEMO Wide',w:11,l:5,lot:'DEMO-A',rotate:true},{id:'DEMO Main',w:10,l:11,lot:'DEMO-A',rotate:true},{id:'DEMO Small',w:6,l:3,lot:'DEMO-A',rotate:true},{id:'DEMO Entry',w:4,l:6,lot:'DEMO-A',rotate:false}]},
 {id:'03',name:'Dye Lot / Insufficient Stock',...common,rolls:[{id:'DEMO-LIMITED',w:12,l:10,lot:'DEMO-A',stockType:'SHORT' as const},{id:'DEMO-OTHER-LOT',w:12,l:30,lot:'DEMO-B',stockType:'FULL' as const}],pieces:[{id:'DEMO Fit',w:12,l:10,lot:'DEMO-A',rotate:false},{id:'DEMO No Stock',w:12,l:10,lot:'DEMO-A',rotate:false},{id:'DEMO Missing Lot',w:6,l:8,lot:'DEMO-C',rotate:false}]}
];
export function getDemo(id:string){const demo=demoOrders.find(d=>d.id===id);if(!demo)throw Error('Unknown demo order');return JSON.parse(JSON.stringify(demo)) as typeof demo;}
declare global{interface Window{runluGetDemo:typeof getDemo}}
if(typeof window!=='undefined')window.runluGetDemo=getDemo;
