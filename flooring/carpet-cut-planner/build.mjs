import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
let commit='unknown';
try{commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
await build({entryPoints:['browser.ts'],bundle:true,format:'iife',target:'es2020',outfile:'dist/browser.js',define:{__BUILD_COMMIT__:JSON.stringify(commit)}});
