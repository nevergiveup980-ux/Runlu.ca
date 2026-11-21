import {it,expect} from 'vitest';
import {demoOrders,getDemo} from './demos';
import {calculateShared} from './browser';
it('computes all three demo orders using the shared engine with complete and incomplete cases',()=>{
 const results=demoOrders.map(d=>calculateShared(d.rolls,d.pieces,0,d.settings.shortRollFirst));
 expect(results[0].unplaced).toEqual([]);expect(results[1].unplaced).toEqual([]);
 expect(results[1].scenarios.length).toBeGreaterThan(1);
 expect(results[2].unplaced).toContain('DEMO Missing Lot');expect(results[2].unplaced).toContain('DEMO No Stock');
 for(const p of results){expect(p.allocated).toBeCloseTo(p.net+p.waste);expect(p.scenarios[0].allocatedSF/9).toBeGreaterThan(0);}
 console.info(JSON.stringify(results.map((p,i)=>({demo:demoOrders[i].id,allocatedSF:p.allocated,wasteSF:p.waste,unplaced:p.unplaced,strategies:p.scenarios.length,savingsSF:p.scenarios[0].savingsSF}))));
});
it('resets demo inputs from fresh copies and rejects unknown orders',()=>{
 const d=getDemo('01');d.rolls[0].l=1;expect(getDemo('01').rolls[0].l).not.toBe(1);expect(()=>getDemo('99')).toThrow();
});
