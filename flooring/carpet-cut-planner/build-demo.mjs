import './build.mjs';
import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
await mkdir('dist/demo/dist',{recursive:true});
const html=(await readFile('index.html','utf8')).replace('<body>','<body data-demo-only="true">').replace('<title>RUNLU Carpet Cut & Waste Planner · MVP</title>','<title>RUNLU DEMO · iPhone Carpet Planner</title>').replace('<meta charset="utf-8">','<meta charset="utf-8"><meta name="robots" content="noindex,nofollow">');
await writeFile('dist/demo/index.html',html);
await copyFile('dist/browser.js','dist/demo/dist/browser.js');
await writeFile('dist/demo/vercel.json',JSON.stringify({version:2,headers:[{source:'/(.*)',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'},{key:'Cache-Control',value:'no-store'},{key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'"}]}]},null,2));
