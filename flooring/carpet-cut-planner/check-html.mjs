import {readFileSync} from "node:fs";
import {Script} from "node:vm";
const html=readFileSync(new URL("./index.html",import.meta.url),"utf8");
const inline=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(Boolean);
if(inline.length===0)throw Error("No inline UI script found");
for(const source of inline)new Script(source,{filename:"index.html:inline-script"});
console.log("Inline browser scripts parsed successfully");
