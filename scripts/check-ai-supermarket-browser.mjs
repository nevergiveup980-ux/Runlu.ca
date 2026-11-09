import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

await mkdir('ai-supermarket-browser-evidence',{recursive:true});
const browser=await chromium.launch({headless:true});
try {
  for (const width of [320,375,390,430,768,1280]) {
    const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const requests=[];
    page.on('request',req=>requests.push(req.url()));
    await page.goto(pathToFileURL(resolve('ai-supermarket.html')).href);
    await page.locator('#language').waitFor();
    for (const [lang,heading] of [['en','Find the right AI for a real need.'],['zh','从真实需求出发，寻找合适的 AI 工具。'],['fr','Trouvez la bonne IA pour un besoin réel.'],['es','Encuentra la IA adecuada para una necesidad real.']]) {
      await page.locator('#language').selectOption(lang);
      assert.equal(await page.locator('h1').innerText(),heading,'heading '+lang);
      const translations=await page.locator('[data-en]').evaluateAll((nodes,language)=>nodes.map(node=>({actual:node.textContent,expected:node.getAttribute('data-'+language)})).filter(x=>x.actual!==x.expected),lang);
      assert.deepEqual(translations,[],'all translated nodes '+lang);
      assert.equal(await page.locator('html').getAttribute('data-runlu-language'),lang);
      await page.reload();
      assert.equal(await page.locator('#language').inputValue(),lang,'persist '+lang);
      assert.equal(await page.locator('h1').innerText(),heading,'reload '+lang);
      const afterReload=await page.locator('[data-en]').evaluateAll((nodes,language)=>nodes.map(node=>({actual:node.textContent,expected:node.getAttribute('data-'+language)})).filter(x=>x.actual!==x.expected),lang);
      assert.deepEqual(afterReload,[],'all translated nodes after reload '+lang);
      if (lang==='en'||lang==='zh') await page.screenshot({path:`ai-supermarket-browser-evidence/viewport-${width}-${lang}.png`,fullPage:true});
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
      assert.equal(overflow,false,'horizontal overflow at '+width+'px '+lang);
    }
    await page.goto(pathToFileURL(resolve('ai-supermarket.html')).href);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement?.classList.contains('skip-link')),true,'skip link is first keyboard target');
    await page.keyboard.press('Enter');
    assert.equal(new URL(page.url()).hash,'#main','skip link targets main content');
    assert.equal(await page.locator('.grid article').count(),6,'six category cards');
    assert.equal(errors.length,0,'page errors: '+errors.join('; '));
    assert.ok(requests.every(url=>url.startsWith('file:')),'Unexpected external request: '+requests.join(', '));
    console.log('PASS browser viewport',width,'all translations, persistence, keyboard skip link, no overflow, no errors/external requests');
    await page.close();
  }
} finally {await browser.close();}
