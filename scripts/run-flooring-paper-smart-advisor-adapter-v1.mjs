import fs from 'node:fs';import vm from 'node:vm';const src=fs.readFileSync('flooring/paper-smart-advisor-adapter-v1.js','utf8');new vm.Script(src);const ctx={module:{exports:{}}};vm.createContext(ctx);vm.runInContext(src,ctx);const a=ctx.module.exports,ok=(p,msg)=>{if(!p)throw Error(msg)};
ok(a.readOnly,'adapter must be read only');
for(const unit of ['SF','SYD'])ok(a.quantity('90 '+unit).quantity===90,'unit '+unit);
ok(a.quantity('20')===null,'unlabelled quantity cannot be guessed');
ok(a.quantity('90 LF')===null,'LF is not an area');
ok(a.dimensions("10 x 17").lengthFt===17,'cut dimensions');
ok(a.readRow(['90 SF','10 x 17','Dawn','Blue','']).ready,'five-column paper extraction');
for(const i of [0,2,3]){const row=['90 SF','10 x 17','Dawn','Blue',''];row[i]='';ok(!a.readRow(row).ready,'no early suggestion when required field absent '+i)}
const r=a.readRow(['10 SYD','10 x 17','Dawn','Blue','']);
let called=0;a.rank(r,[],{advise:arg=>{called++;ok(arg.quantity===10&&arg.unit==='syd','original units preserved');return {ok:true,results:[]}}});
ok(called===1,'advisor integration');
ok(!/localStorage|fetch\(|\.rpc\(|\.update\(|\.insert\(/.test(src),'no side effects');
console.log('Paper Smart Advisor Adapter V1: PASS');
