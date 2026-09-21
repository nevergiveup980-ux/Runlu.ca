// RUNLU R001 / E007 — warehouse-style CHSH bridge semantics
// Mathematical bridge only; no production control.

export const labels={
  inputA:{0:"route normal",1:"route constrained"},
  inputB:{0:"route normal",1:"route constrained"},
  action:{0:"HOLD/YIELD",1:"COMMIT/GO"}
};

export function coordinated(x,y,a,b){
  return (a^b)===(x&y);
}

export function truthTable(){
 const rows=[];
 for(let x=0;x<2;x++)for(let y=0;y<2;y++)for(let a=0;a<2;a++)for(let b=0;b<2;b++)
  rows.push({x,y,a,b,coordinated:coordinated(x,y,a,b)});
 return rows;
}

export function requiredRelation(){
 return [
  {x:0,y:0,relation:"same"},
  {x:0,y:1,relation:"same"},
  {x:1,y:0,relation:"same"},
  {x:1,y:1,relation:"different"}
 ];
}
