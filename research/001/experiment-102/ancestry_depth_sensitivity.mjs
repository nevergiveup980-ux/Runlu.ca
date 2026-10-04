#!/usr/bin/env node
const parent={A:"FA",B:"FA",C:"FC",D:"FD",E:"FE",FA:"RA",FC:"RA",FD:"RD",FE:"RD",RA:"META",RD:"META",META:null};
const leaves=["A","B","C","D","E"];
function ancestorAt(node,depth){let n=node;for(let i=0;i<depth;i++){n=parent[n];if(n==null)return null;}return n;}
function profile(depth){
 const groups={};
 for(const leaf of leaves){const a=ancestorAt(leaf,depth)??"ROOT_END";(groups[a]??=[]).push(leaf);}
 return {depth,family_count:Object.keys(groups).length,groups};
}
const profiles=[0,1,2,3].map(profile);
const expected=[5,4,2,1];
if(profiles.some((p,i)=>p.family_count!==expected[i]))throw new Error("depth profile mismatch");
const claimThreshold=3;
const claims=profiles.map(p=>({...p,claim:p.family_count>=claimThreshold?"DIVERSITY_THRESHOLD_MET":"DIVERSITY_THRESHOLD_NOT_MET"}));
if(claims[1].claim!=="DIVERSITY_THRESHOLD_MET"||claims[2].claim!=="DIVERSITY_THRESHOLD_NOT_MET")throw new Error("sensitivity fixture");
console.log(JSON.stringify({
 schema:"e102-ancestry-depth-sensitivity-v1",profiles,claimThreshold,claims,
 conclusion:"The same declared ancestry graph yields family counts 5, 4, 2, and 1 across depths 0-3. A diversity-threshold conclusion flips between depths 1 and 2."
},null,2));