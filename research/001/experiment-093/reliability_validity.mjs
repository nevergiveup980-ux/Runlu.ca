#!/usr/bin/env node
const sets=[
 {id:"GOOD",truth:100,values:[100,100,100,100,100]},
 {id:"PRECISE_WRONG",truth:100,values:[99,99,99,99,99]},
 {id:"NOISY_CENTERED",truth:100,values:[98,99,100,101,102]},
 {id:"NOISY_BIASED",truth:100,values:[95,97,99,101,103]}
];
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
const sd=a=>{const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/a.length)};
function audit(x){
 const m=mean(x.values),spread=sd(x.values),bias=m-x.truth;
 const reliable=spread<=0.25,valid=Math.abs(bias)<=0.25;
 let status=reliable&&valid?"RELIABLE_AND_VALID":reliable&&!valid?"RELIABLE_BUT_BIASED":!reliable&&valid?"NOISY_BUT_UNBIASED":"UNRELIABLE_AND_BIASED";
 return {...x,mean:m,sd:spread,bias,reliable,valid,status};
}
const results=sets.map(audit),m=Object.fromEntries(results.map(x=>[x.id,x]));
if(m.GOOD.status!=="RELIABLE_AND_VALID")throw new Error("good");
if(m.PRECISE_WRONG.status!=="RELIABLE_BUT_BIASED")throw new Error("precise");
if(m.NOISY_CENTERED.status!=="NOISY_BUT_UNBIASED")throw new Error("centered");
if(m.NOISY_BIASED.status!=="UNRELIABLE_AND_BIASED")throw new Error("biased");
console.log(JSON.stringify({schema:"e093-reliability-validity-v1",results,
 conclusion:"Repeatability and correctness are distinct. A measurement process can be perfectly repeatable while systematically wrong."},null,2));