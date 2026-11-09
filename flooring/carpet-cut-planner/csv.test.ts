import {describe,it,expect} from 'vitest';
import {importOrderCSV,parseCSV} from './csv';
const rolls='roll_id,stock_type,width_ft,available_length_ft,dye_lot,notes\r\nR1,FULL,12,30,A,"verified, stock"';
const pieces='piece_id,width_ft,length_ft,dye_lot,allow_rotate,notes\nP1,6,10,A,false,';
describe('CSV order import',()=>{
 it('reads BOM, CRLF, escaped quotes and quoted multiline fields',()=>{
  expect(parseCSV('\uFEFFa,b\r\n"x""y","line1\nline2"\r\n')).toEqual([{line:1,cells:['a','b']},{line:2,cells:['x"y','line1\nline2']}]);
  expect(importOrderCSV(rolls,pieces)).toMatchObject({rolls:[{id:'R1',stockType:'FULL',w:12,l:30,lot:'A'}],pieces:[{id:'P1',w:6,l:10,rotate:false}],warnings:[]});
 });
 it.each(['P1,6,10,A,yes,','P1,-6,10,A,false,','P1,0,10,A,false,','P1,NaN,10,A,false,','P1,1e3,10,A,false,','P1,6ft,10,A,false,','P1,6,10,A,false'])('rejects unsafe or ambiguous row %s',row=>{
  expect(()=>importOrderCSV(rolls,pieces.split('\n')[0]+'\n'+row)).toThrow(/line 2/);
 });
 it('rejects malformed quoting, duplicate IDs and headers without silently dropping rows',()=>{
  expect(()=>parseCSV('a\n"unfinished')).toThrow(/unclosed/);
  expect(()=>parseCSV('a\n"x"oops')).toThrow(/closing quote/);
  expect(()=>importOrderCSV(rolls,pieces+'\nP1,6,10,A,false,')).toThrow(/duplicate/);
  expect(()=>importOrderCSV(rolls.replace('notes','roll_id'),pieces)).toThrow(/duplicate headers/);
  expect(()=>importOrderCSV(rolls.replace('width_ft','width'),pieces)).toThrow(/missing header/);
  expect(()=>importOrderCSV(rolls.replace('FULL','full'),pieces)).toThrow(/stock_type/);
  expect(()=>importOrderCSV(rolls.replace(',A,',',,'),pieces)).toThrow(/dye_lot/);
 });
 it('requires data and limits payload size and count',()=>{
  expect(()=>importOrderCSV(rolls,pieces.split('\n')[0])).toThrow(/at least one/);
  expect(()=>parseCSV('x'.repeat(1000001))).toThrow(/1 MB/);
  expect(()=>parseCSV('a\n'+'x\n'.repeat(1001))).toThrow(/1000/);
 });
 it('keeps rotation explicit and warns about missing or unavailable lots',()=>{
  expect(importOrderCSV(rolls,pieces.replace(',A,false',',,TRUE'))).toMatchObject({pieces:[{rotate:true,lot:''}],warnings:[expect.stringContaining('unconstrained')]});
  expect(importOrderCSV(rolls,pieces.replace(',A,false',',B,false')).warnings[0]).toContain('absent');
 });
});
