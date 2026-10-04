// E036 exact synthetic payload-vs-regret audit.
// Q_A,Q_B iid uniform on {0,...,15}. Contiguous bucket encodings only.

const N=16;
function partitions(k){
 const out=[];
 function rec(start,cuts){
  if(cuts.length===k-1){out.push(cuts.slice());return;}
  for(let c=start;c<=N-(k-cuts.length);c++){cuts.push(c);rec(c+1,cuts);cuts.pop();}
 }
 if(k===1)return [[]];
 rec(1,[]);
 return out;
}
function bucket(q,cuts){let b=0;for(const c of cuts)if(q>=c)b++;return b;}
function regret(cuts){
 let total=0;
 for(let a=0;a<N;a++)for(let b=0;b<N;b++){
  const ba=bucket(a,cuts),bb=bucket(b,cuts);
  if(ba===bb) total+=Math.abs(a-b)/2; // fair tie-break
  // differing buckets are ordered because partitions are contiguous:
  // higher bucket always contains higher Q, hence zero regret.
 }
 return total/(N*N);
}
function best(k){
 let winner=null;
 for(const cuts of partitions(k)){
  const r=regret(cuts);
  if(!winner||r<winner.regret)winner={cuts,regret:r};
 }
 return winner;
}
const e0=(()=>{let t=0;for(let a=0;a<N;a++)for(let b=0;b<N;b++)t+=Math.max(0,b-a);return t/(N*N)})();
const result={
 experiment:"RUNLU-R001-E036",
 model:"iid uniform integer queues 0..15; synthetic",
 E0:{bits:0,regret:e0},
 E1:{bits:1,...best(2)},
 E2:{bits:2,...best(4)},
 E4:{bits:4,cuts:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],regret:0}
};
console.log(JSON.stringify(result,null,2));
