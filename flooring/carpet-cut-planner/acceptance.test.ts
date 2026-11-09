import {describe,it,expect} from 'vitest';
import {evaluateAcceptance} from './acceptance';
const row={rollId:'R',plannedLF:10,availableLF:30,expectedLF:'10',actualLF:'10'};
const compare=(rows=[row],complete=true,reviewed=true,verified=true,job='JOB',reviewer='Alex')=>evaluateAcceptance(rows,complete,reviewed,verified,job,reviewer);
describe('field comparison gates',()=>{
 it('passes only complete, reviewed, independently verified readings',()=>{
  expect(compare()).toMatchObject({status:'PASS',rows:[{actualDeltaLF:0,expectedDeltaLF:0}]});
  expect(compare([row],false).status).toBe('BLOCKED');expect(compare([row],true,false).status).toBe('BLOCKED');
  expect(compare([row],true,true,false).status).toBe('BLOCKED');expect(compare([row],true,true,true,'').status).toBe('BLOCKED');
  expect(compare([row],true,true,true,'JOB','').status).toBe('BLOCKED');expect(compare([]).status).toBe('BLOCKED');
 });
 it.each(['','-1','NaN','Infinity','31','1e1'])('blocks invalid or missing readings %s',actualLF=>expect(compare([{...row,actualLF}]).status).toBe('BLOCKED'));
 it('reports expected/actual differences per roll and enforces tolerance',()=>{
  expect(compare([{...row,actualLF:'10.01'}]).status).toBe('PASS');
  expect(compare([{...row,actualLF:'10.02'}])).toMatchObject({status:'FAIL',rows:[{actualDeltaLF:expect.closeTo(.02)}]});
  expect(compare([{...row,expectedLF:'9'}]).status).toBe('FAIL');
  expect(compare([{...row,actualLF:'9'},{...row,rollId:'S',actualLF:'11'}]).status).toBe('FAIL');
 });
});
