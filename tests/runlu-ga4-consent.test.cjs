// RUNLU GROWTH OS — dependency-free Node regression tests.
// Run: node --test tests/runlu-ga4-consent.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../runlu-ga4-consent.js'), 'utf8');
function fixture(initialChoice = null) {
  const store = new Map(); if (initialChoice) store.set('runlu_analytics_consent_v1', initialChoice);
  const elements = new Map(); const appendedScripts = []; let reloads = 0;
  function element(tag) {
    const el = { tag, children: [], attrs: {}, style: {}, parentNode: null, textContent: '',
      setAttribute(k,v) { this.attrs[k] = v; },
      appendChild(child) { this.children.push(child); child.parentNode = this; if (tag === 'head' && child.tag === 'script') appendedScripts.push(child); return child; },
      removeChild(child) { this.children = this.children.filter(x=>x!==child); child.parentNode = null; },
      addEventListener(k,cb) { this['on'+k] = cb; },
      remove() { if (this.parentNode) this.parentNode.removeChild(this); if (this.id) elements.delete(this.id); },
      querySelector(sel) { const key = sel.startsWith('[') && sel.endsWith(']') ? sel.slice(1,-1) : ''; return this.children.flatMap(function walk(x) { return [x, ...x.children.flatMap(walk)]; }).find(x=>Object.prototype.hasOwnProperty.call(x.attrs,key)); }
    };
    Object.defineProperty(el,'id',{get(){return this._id;},set(v){this._id=v;elements.set(v,this);}});
    return el;
  }
  const head = element('head'), footer = element('footer'), body = element('body');
  const document = { readyState:'complete', documentElement:{lang:'en'}, head, body, createElement:element,
    getElementById:id=>elements.get(id)||null, querySelector:sel=>sel==='footer'?footer:null };
  const window = { location:{reload(){reloads++;}} };
  const context = { document, window, localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}, MutationObserver:class { observe(){} } };
  vm.runInNewContext(source,context);
  const banner=()=>elements.get('runlu-analytics-consent');
  const click=(name)=>{ const el=banner().children[1].children.find(x=>x.textContent===name); assert.ok(el,'button '+name);el.onclick(); };
  return {store,document,window,head,footer,banner,click,appendedScripts,reloads:()=>reloads};
}
test('no prior choice: banner, no GA script',()=>{const x=fixture();assert.ok(x.banner());assert.equal(x.appendedScripts.length,0);});
test('reject: persists denial and loads no GA',()=>{const x=fixture();x.click('Reject');assert.equal(x.store.get('runlu_analytics_consent_v1'),'denied');assert.equal(x.appendedScripts.length,0);});
test('accept: loads exactly one GA script',()=>{const x=fixture();x.click('Accept');assert.equal(x.store.get('runlu_analytics_consent_v1'),'granted');assert.equal(x.appendedScripts.length,1);assert.match(x.appendedScripts[0].src,/G-KVRWEFJMCR/);});
test('existing grant: loads without prompting',()=>{const x=fixture('granted');assert.equal(x.banner(),undefined);assert.equal(x.appendedScripts.length,1);});
test('existing denial: does not load or prompt',()=>{const x=fixture('denied');assert.equal(x.banner(),undefined);assert.equal(x.appendedScripts.length,0);});
test('revoke after grant: disables analytics and reloads',()=>{const x=fixture('granted');const settings=x.footer.children[0];settings.onclick();x.click('Reject');assert.equal(x.window['ga-disable-G-KVRWEFJMCR'],true);assert.equal(x.reloads(),1);});
test('grant after prior denial: enables analytics',()=>{const x=fixture('denied');x.footer.children[0].onclick();x.click('Accept');assert.equal(x.window['ga-disable-G-KVRWEFJMCR'],false);assert.equal(x.appendedScripts.length,1);});

test('reject without prior grant does not reload the page',()=>{const x=fixture();x.click('Reject');assert.equal(x.reloads(),0);assert.equal(x.window['ga-disable-G-KVRWEFJMCR'],true);});
test('reopening settings after denial does not load GA',()=>{const x=fixture('denied');x.footer.children[0].onclick();assert.ok(x.banner());assert.equal(x.appendedScripts.length,0);});
test('reopening settings after grant does not duplicate GA script',()=>{const x=fixture('granted');x.footer.children[0].onclick();assert.ok(x.banner());assert.equal(x.appendedScripts.length,1);});
test('revoke stores denial before reload',()=>{const x=fixture('granted');x.footer.children[0].onclick();x.click('Reject');assert.equal(x.store.get('runlu_analytics_consent_v1'),'denied');assert.equal(x.appendedScripts.length,1);});

test('consent banner respects iPhone safe area and viewport width',()=>{const x=fixture();assert.match(x.banner().style.cssText,/safe-area-inset-bottom/);assert.match(x.banner().style.cssText,/box-sizing:border-box/);});
