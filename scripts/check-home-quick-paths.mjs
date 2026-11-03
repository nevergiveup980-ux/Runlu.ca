import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const nav = html.match(/<nav\\b[^>]*data-runlu-quick-paths[^>]*>([\\s\\S]*?)<\\/nav>/)?.[1];
if (!nav) throw new Error('Homepage quick navigation is missing');
const expected = ['latest-reading', 'studio', 'view-preview', 'book-preview', 'digital-preview', 'contact'];
const anchors = [...nav.matchAll(/<a\\b([^>]*)>/g)];
if (anchors.length !== expected.length) throw new Error(`Expected ${expected.length} quick links, found ${anchors.length}`);
for (const [index, match] of anchors.entries()) {
  const attrs = match[1];
  const target = expected[index];
  if (!attrs.includes(`href="#${target}"`)) throw new Error(`Quick link ${index + 1} must target #${target}`);
  if (!new RegExp(`\\bid=["']${target}["']`).test(html)) throw new Error(`Missing homepage section #${target}`);
  for (const lang of ['en', 'zh', 'fr', 'es']) {
    if (!new RegExp(`\\bdata-${lang}="[^"]+"`).test(attrs)) throw new Error(`#${target} missing ${lang} label`);
  }
}
console.log('Homepage quick paths: six destinations and four-language labels verified.');
