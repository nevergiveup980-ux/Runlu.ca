import {filename} from '../library.mjs';
import {isUUID} from './supabase-backend.mjs';
const READY=new Set(['completed','imported']);
const codes={UNAUTHENTICATED:401,NOT_FOUND:404,AUDIO_NOT_READY:409,INVALID_REQUEST:400,INVALID_CURSOR:400,ORIGIN_BLOCKED:403,METHOD_NOT_ALLOWED:405};
function metadata(row) {
  return {id:row.version_id,song_id:row.song_id,title:row.title,version:row.version,created_at:row.created_at,status:row.generation_status,duration:row.duration,
    audio_available:READY.has(row.generation_status)&&!!row.object_key,download_status:READY.has(row.generation_status)&&!!row.object_key?'available':'unavailable'};
}
export function createMusicHandler({backend,allowedOrigins=[]}) {
  return async request=>{
    const responseHeaders={'Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8','Vary':'Origin','X-Content-Type-Options':'nosniff'};
    const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:responseHeaders});
    try {
      const origin=request.headers.get('origin');
      if(origin&&!allowedOrigins.includes(origin))throw Error('ORIGIN_BLOCKED');
      if(request.method!=='GET')throw Error('METHOD_NOT_ALLOWED');
      const auth=request.headers.get('authorization');
      if(!/^Bearer [^\s]+$/.test(auth||''))throw Error('UNAUTHENTICATED');
      const token=auth.slice(7),user=await backend.verify(token);
      if(!isUUID(user?.id)||user.is_anonymous===true)throw Error('UNAUTHENTICATED');
      const url=new URL(request.url),path=url.pathname.replace(/^\/api\/music\/?/,'');
      if(path==='library') {
        const limit=Number(url.searchParams.get('limit')||20);
        if(!Number.isInteger(limit)||limit<1||limit>50)throw Error('INVALID_REQUEST');
        const rows=await backend.list(user.id,token,{limit,before:url.searchParams.get('before')});
        if(!Array.isArray(rows)||rows.some(row=>row.owner_id!==user.id))throw Error('NOT_FOUND');
        const page=rows.slice(0,limit),last=page.at(-1);
        return json({items:page.map(metadata),has_more:rows.length>limit,next_cursor:rows.length>limit&&last?`${last.created_at}|${last.version_id}`:null});
      }
      const match=path.match(/^songs\/([^/]+)(?:\/(access|audio))?$/);
      if(!match||!isUUID(match[1]))throw Error('NOT_FOUND');
      const row=await backend.get(user.id,match[1],token);
      if(!row||row.owner_id!==user.id)throw Error('NOT_FOUND');
      if(!match[2])return json(metadata(row));
      if(!READY.has(row.generation_status)||!row.object_key||!(row.duration>0))throw Error('AUDIO_NOT_READY');
      const download=url.searchParams.get('download')==='1';
      if(match[2]==='access')return json({url:await backend.sign(row,token,download?filename(row.title,row.version):null),expires_in:60});
      const range=request.headers.get('range');
      if(range&&!/^bytes=(?:\d+-\d*|-\d+)$/.test(range))throw Error('INVALID_REQUEST');
      const upstream=await backend.audio(row,token,range),headers=new Headers({'Cache-Control':'no-store','Content-Type':'audio/mpeg','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'});
      for(const key of ['content-range','content-length'])if(upstream.headers.has(key))headers.set(key,upstream.headers.get(key));
      headers.set('Content-Disposition',`${download?'attachment':'inline'}; filename="runlu-${row.version}.mp3"; filename*=UTF-8''${encodeURIComponent(filename(row.title,row.version)).replace(/['()*]/g,c=>'%'+c.charCodeAt(0).toString(16))}`);
      return new Response(upstream.body,{status:upstream.status,headers});
    }catch(error){const code=codes[error.message]?error.message:'BACKEND_UNAVAILABLE';return json({error_code:code},codes[code]||503);}
  };
}
