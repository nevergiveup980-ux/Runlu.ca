import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
const source=readFileSync('flooring/order-pilot.js','utf8');
const rows=new Map();
let loseNext=false;
function device(){
 const nodes=new Map();
 function element(){return {value:'',textContent:'',hidden:false,disabled:false,children:[],events:{},addEventListener(k,fn){this.events[k]=fn},replaceChildren(){this.children=[]},append(n){this.children.push(n)},reset(){for(const id of ['customer','description','quantity','price']) get(id).value='';get('stage').value='draft'}}}
 function get(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id)}
 const controls=['login','refresh','new','logout','editor'].map(get);
 const calls=[];
 const context={document:{getElementById:get,querySelectorAll:()=>controls,createElement:element},crypto:{randomUUID},confirm:()=>true,fetch:async(url,options)=>{
  calls.push({url,options});const body=options.body?JSON.parse(options.body):null;
  let data,code=200;
  if(url.includes('/token?'))data={access_token:'test-token',user:{id:'owner-a',email:'qa@example.invalid'}};
  else if(url.includes('/logout'))data={};
  else if(!options.method)data=[...rows.values()].map(r=>({...r}));
  else if(options.method==='POST'){
   if(rows.has(body.id)){code=409;data={message:'duplicate key'}}
   else{const row={...body,revision:1};rows.set(row.id,row);data=[{...row}];if(loseNext){loseNext=false;throw Error('Network lost')}}
  }else{
   const query=new URL(url).searchParams;const row=rows.get(query.get('id').slice(3));
   if(row&&row.revision===Number(query.get('revision').slice(3))){Object.assign(row,body,{revision:row.revision+1});data=[{...row}]}else data=[];
  }
  return {ok:code<400,status:code,json:async()=>data};
 }};
 vm.runInNewContext(source,context);
 async function fire(id,event='click'){get(id).events[event]({preventDefault(){}});for(let i=0;i<30;i++){await new Promise(setImmediate);if(!controls.some(n=>n.disabled))return}throw Error('UI stayed busy')}
 async function login(){get('email').value='qa@example.invalid';get('password').value='fake';await fire('login','submit')}
 function fill(q){get('customer').value='<img src=x onerror=alert(1)>';get('description').value='Fictional carpet';get('quantity').value=String(q);get('price').value='12.50';get('stage').value='draft'}
 return {get,fire,login,fill,calls};
}
const a=device(),b=device();await a.login();a.fill(2);await a.fire('editor','submit');assert.equal(rows.size,1);
await b.login();b.get('orders').children[0].events.click();assert.equal(b.get('quantity').value,2);
b.get('quantity').value='3';await b.fire('editor','submit');assert.equal([...rows.values()][0].revision,2);
a.get('quantity').value='9';await a.fire('editor','submit');assert.match(a.get('status').textContent,/Another device/);assert.equal([...rows.values()][0].quantity,3);assert.equal(a.get('quantity').value,'9');
await a.fire('refresh');a.get('orders').children[0].events.click();assert.equal(a.get('quantity').value,3);
a.get('stage').value='confirmed';await a.fire('editor','submit');assert.equal([...rows.values()][0].status,'confirmed');
await a.fire('new');a.fill(4);loseNext=true;await a.fire('editor','submit');const count=rows.size;await a.fire('editor','submit');assert.equal(rows.size,count,'retry must not duplicate an ambiguously saved order');
await a.fire('logout');assert.equal(a.get('workspace').hidden,true);assert.equal(a.get('orders').children.length,0);
assert(!/localStorage|sessionStorage/.test(source));assert(!source.includes('innerHTML'));
console.log('PASS: two isolated mocked clients, readback, stale-write conflict, confirmation, ambiguous retry and sign-out. Not physical-device acceptance.');
