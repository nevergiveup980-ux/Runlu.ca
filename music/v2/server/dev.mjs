// Local-only review server. node music/v2/server/dev.mjs
// Uses the project's existing PUBLIC key; never accepts or serves privileged keys.
import {createServer} from 'node:http';
import {readFile,realpath} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {createMusicHandler} from './handler.mjs';
import {createSupabaseBackend} from './supabase-backend.mjs';
const root=await realpath(new URL('../../../',import.meta.url).pathname),port=4173;
const backend=createSupabaseBackend({url:'https://ekrnknlawekeoszzkamd.supabase.co',publishableKey:'sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn'});
const handler=createMusicHandler({backend,allowedOrigins:[`http://127.0.0.1:${port}`]});
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.mjs':'text/javascript','.json':'application/json'};
createServer(async(req,res)=>{
 try {
  if(req.headers.host!==`127.0.0.1:${port}`){res.writeHead(403);res.end();return;}
  const url=new URL(req.url,`http://127.0.0.1:${port}`);
  if(url.pathname.startsWith('/api/music/')){
   const response=await handler(new Request(url,{method:req.method,headers:req.headers}));
   res.writeHead(response.status,Object.fromEntries(response.headers));
   if(response.body)for await(const chunk of response.body)res.write(chunk);
   res.end();return;
  }
  // Explicit static allow-list: server source, .git, env files and media never served.
  const path=url.pathname==='/'?'/music-studio-v2.html':url.pathname;
  if(!/^\/(?:music-studio-v2\.html|music\/v2\/(?:studio\.(?:mjs|css)|cloud\.(?:mjs|css)|library\.mjs)|music-studio-tools\/when-the-lights-go-down-v2\.json)$/.test(path)){res.writeHead(404);res.end();return;}
  const target=await realpath(resolve(root,'.'+path));
  if(!target.startsWith(root+sep))throw Error('PATH');
  const bytes=await readFile(target);res.writeHead(200,{'Content-Type':types[extname(target)]||'text/plain','Cache-Control':'no-store'});res.end(bytes);
 } catch {if(!res.headersSent)res.writeHead(503);res.end('Unavailable');}
}).listen(port,'127.0.0.1',()=>console.log(`Local review: http://127.0.0.1:${port}/music-studio-v2.html (paid generation disabled)`));
