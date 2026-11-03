/* Run with: node book/lost-meridian/growth-events.test.cjs
 * Dependency-free unit checks; no browser, Cloudflare or network required.
 */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const code=fs.readFileSync(path.join(__dirname,'growth-events.js'),'utf8');

function simulate(query='',href){
  const events=[];
  let click;
  class Element {
    constructor(link){this.link=link;}
    closest(){return this.link?{getAttribute:()=>this.link}:null;}
  }
  const window={dataLayer:[],dispatchEvent:e=>events.push(e.detail)};
  const document={addEventListener:(type,callback)=>{if(type==='click')click=callback;}};
  const location=new URL('https://runlu.ca/book/lost-meridian/'+query);
  vm.runInNewContext(code,{URL,URLSearchParams,window,document,location,Element,
    CustomEvent:class{constructor(type,options){this.detail=options.detail;}}});
  if(href)click({target:new Element(href)});
  return events;
}

assert.equal(simulate('?utm_source=x&utm_campaign=lost_meridian_launch')[0].source,'x');
assert.equal(simulate('?utm_source=tiktok')[0].source,'tiktok');
assert.equal(simulate('')[0].source,'unattributed');
assert.equal(simulate('?utm_source=unknown')[0].source,'other');
assert.equal(simulate('?utm_campaign=%3Cscript%3E')[0].campaign,'none');
assert.equal(simulate('','reader.html?ch=1')[1].chapter,1);
assert.equal(simulate('','reader.html?ch=10')[1].chapter,10);
assert.equal(simulate('','reader.html?ch=11')[1].chapter,null);
assert.equal(simulate('','https://books.apple.com/')[1].event,'book_external_link_click');
assert.equal(simulate('','mailto:hello@runlu.ca').length,1);
console.log('PASS: 10 growth event assertions');
