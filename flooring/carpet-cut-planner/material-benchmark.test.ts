import {describe,it,expect} from 'vitest';
import {materialFixtures,fixtureInput,measureMaterial} from './material-benchmark';
import {comparePlans} from './scenarios';

describe('reproducible material comparison',()=>{
 it('quantifies a win, tie and losing small-first candidate against the full old search',()=>{
  const rows=materialFixtures.map(f=>{const {rolls,pieces}=fixtureInput(f.sizes);return {name:f.name,...measureMaterial(rolls,pieces)}});
  expect(rows[0]).toMatchObject({legacy:{allocatedSF:624,allocatedSYD:624/9,wasteSF:182},small:{allocatedSF:576,wasteSF:134},expanded:{allocatedSF:576,allocatedSYD:64,wasteSF:134},savingsSF:48});
  expect(rows[1]).toMatchObject({legacy:{allocatedSF:120,wasteSF:0},expanded:{allocatedSF:120,wasteSF:0},savingsSF:0});
  expect(rows[2]).toMatchObject({legacy:{allocatedSF:120,wasteSF:30},small:{allocatedSF:180,wasteSF:90},expanded:{allocatedSF:120,wasteSF:30},savingsSF:0});
  expect(rows[3]).toMatchObject({legacy:{complete:false},expanded:{complete:false},savingsSF:null});
 });
 it('preserves complete-job material and geometric validity over a fixed 1000-order corpus',()=>{
  let seed=980;const random=(n:number)=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};
  let wins=0,ties=0,incomplete=0,completionGains=0,totalLegacySF=0,totalExpandedSF=0;
  for(let i=0;i<1000;i++){
   const rolls=Array.from({length:1+random(3)},(_,j)=>({id:`R${j}`,widthIn:12*(8+random(5)),lengthIn:12*(20+random(61)),dyeLot:j===2?'B':'A',priority:random(3)}));
   const pieces=Array.from({length:3+random(6)},(_,j)=>({id:`P${j}`,widthIn:12*(2+random(11)),lengthIn:12*(3+random(14)),dyeLot:random(4)===0?'B':'A',allowRotate:random(4)===0}));
   const result=measureMaterial(rolls,pieces);
   const previous=comparePlans(rolls,pieces,{includeSpaceSearch:false})[0];
   const next=comparePlans(rolls,pieces)[0];
   if(previous.feasible){expect(next.feasible).toBe(true);expect(next.score).toBeLessThanOrEqual(previous.score);}
   expect(comparePlans(rolls,pieces)).toEqual(comparePlans(rolls,pieces));
   if(result.legacy.complete){expect(result.expanded.complete).toBe(true);expect(result.savingsSF).toBeGreaterThanOrEqual(0);}
   if(!result.legacy.complete&&result.expanded.complete)completionGains++;
   if(result.savingsSF===null)incomplete++;else {totalLegacySF+=result.legacy.allocatedSF;totalExpandedSF+=result.expanded.allocatedSF;if(result.savingsSF>0)wins++;else ties++;}
   for(const candidate of [...comparePlans(rolls,pieces),...comparePlans(rolls,[...pieces].reverse())]){
   const plan=candidate.plan;
   expect(new Set([...plan.placements.map(p=>p.pieceId),...plan.unplaced]).size).toBe(pieces.length);
   expect(plan.placements.length+plan.unplaced.length).toBe(pieces.length);
   expect(plan.usedAreaSF+plan.wasteAreaSF).toBeCloseTo(plan.allocatedAreaSF,8);
   for(const p of plan.placements){
    const r=rolls.find(r=>r.id===p.rollId)!;const cut=pieces.find(c=>c.id===p.pieceId)!;
    expect(p.xIn+p.widthIn).toBeLessThanOrEqual(r.widthIn);expect(p.yIn+p.lengthIn).toBeLessThanOrEqual(r.lengthIn);expect(r.dyeLot).toBe(cut.dyeLot);
    expect((p.widthIn===cut.widthIn&&p.lengthIn===cut.lengthIn)||(cut.allowRotate&&p.widthIn===cut.lengthIn&&p.lengthIn===cut.widthIn)).toBe(true);
    for(const q of plan.placements.filter(q=>q!==p&&q.rollId===p.rollId))expect(p.xIn+p.widthIn<=q.xIn||q.xIn+q.widthIn<=p.xIn||p.yIn+p.lengthIn<=q.yIn||q.yIn+q.lengthIn<=p.yIn).toBe(true);
   }
   }
  }
  console.info(JSON.stringify({seed:980,orders:1000,wins,ties,incomplete,completionGains,totalLegacySF,totalExpandedSF}));
  expect({wins,ties,incomplete}).toEqual({wins:196,ties:274,incomplete:530});
 });
});
