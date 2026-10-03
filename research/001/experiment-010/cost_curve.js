// RUNLU R001 / E010 — exact communication-cost curve
function o(x,y,a,b){const c=a&&b,d=!a&&!b,p=a!==b,q=x===y?null:(x?(a&&!b):(b&&!a));return{c:+c,d:+d,p:+p,q};}
function M(rows){let c=0,d=0,p=0,q=0,n=0;for(const r of rows){c+=r.c;d+=r.d;p+=r.p;if(r.q!==null){q+=r.q;n++;}}return{conflict:c/4,deadlock:d/4,progress:p/4,urgent_priority:q/n};}
function dom(a,b){return a.conflict<=b.conflict&&a.deadlock<=b.deadlock&&a.progress>=b.progress&&a.urgent_priority>=b.urgent_priority&&(a.conflict<b.conflict||a.deadlock<b.deadlock||a.progress>b.progress||a.urgent_priority>b.urgent_priority);}
export const frontier=x=>x.filter((a,i)=>!x.some((b,j)=>i!==j&&dom(b,a)));
export function R0(){let z=[];for(let m=0;m<16;m++){let r=[];for(let x=0;x<2;x++)for(let y=0;y<2;y++){let a=(m>>x)&1,b=(m>>(2+y))&1;r.push(o(x,y,a,b));}z.push({id:m,...M(r)});}return z;}
export function R0R(){const d=R0(),z=[];for(const a of d)for(const b of d)z.push({id:[a.id,b.id],conflict:(a.conflict+b.conflict)/2,deadlock:(a.deadlock+b.deadlock)/2,progress:(a.progress+b.progress)/2,urgent_priority:(a.urgent_priority+b.urgent_priority)/2});return z;}
function oneWay(sender){let z=[];for(let fs=0;fs<4;fs++)for(let fr=0;fr<16;fr++){let r=[];for(let x=0;x<2;x++)for(let y=0;y<2;y++){let a,b;if(sender==="A"){a=(fs>>x)&1;b=(fr>>(2*x+y))&1;}else{b=(fs>>y)&1;a=(fr>>(2*y+x))&1;}r.push(o(x,y,a,b));}z.push({id:[fs,fr],...M(r)});}return z;}
export const R1A=()=>oneWay("A"); export const R1B=()=>oneWay("B");
// Full-state reference: each joint input may select any joint action.
// 4 action-pairs ^ 4 input-pairs = 256 joint policies.
export function R2(){let z=[];for(let code=0;code<256;code++){let r=[];for(let x=0;x<2;x++)for(let y=0;y<2;y++){const k=2*x+y,v=(code>>(2*k))&3,a=v&1,b=(v>>1)&1;r.push(o(x,y,a,b));}z.push({id:code,...M(r)});}return z;}
export function run(){const sets={R0:R0(),R0R:R0R(),R1A:R1A(),R1B:R1B(),R2:R2()};let out={experiment:"RUNLU-R001-E010",counts:{},frontiers:{},perfect:{}};for(const[k,v]of Object.entries(sets)){out.counts[k]=v.length;out.frontiers[k]=frontier(v);out.perfect[k]=v.filter(x=>x.conflict===0&&x.deadlock===0&&x.progress===1&&x.urgent_priority===1).map(x=>x.id);}return out;}
if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("cost_curve.js"))console.log(JSON.stringify(run(),null,2));
