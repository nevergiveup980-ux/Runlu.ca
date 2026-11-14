// User-JWT-scoped backend: no service-role key needed for reads or signing.
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUUID=value=>typeof value==='string'&&UUID.test(value);
export function createSupabaseBackend({url,publishableKey,fetchImpl=fetch}) {
  const origin=new URL(url).origin;
  if(!/^https:/.test(origin)||!publishableKey)throw Error('INVALID_CONFIG');
  async function request(path,token,options={},acceptedStatuses=[]) {
    let response;
    try {response=await fetchImpl(origin+path,{...options,redirect:'error',signal:AbortSignal.timeout(15000),headers:{apikey:publishableKey,Authorization:`Bearer ${token}`,...options.headers}});}
    catch {throw Error('BACKEND_UNAVAILABLE');}
    if(!response.ok&&!acceptedStatuses.includes(response.status)){const error=Error((response.status===401||(path==='/auth/v1/user'&&[400,403].includes(response.status)))?'UNAUTHENTICATED':response.status===404?'NOT_FOUND':'BACKEND_UNAVAILABLE');throw error;}
    return response;
  }
  async function rows(query,token){return (await request('/rest/v1/runlu_music_versions?'+query,token)).json();}
  return {
    async verify(token) {
      const user=await (await request('/auth/v1/user',token)).json();
      if(!isUUID(user.id)||user.is_anonymous===true)throw Error('UNAUTHENTICATED');
      return user;
    },
    async list(owner,token,{limit=20,before=null}={}) {
      const query=new URLSearchParams({select:'*',owner_id:`eq.${owner}`,order:'created_at.desc,version_id.desc',limit:String(limit+1)});
      if(before){const [date,id]=before.split('|');
        if(!isUUID(id)||!/^\d{4}-\d\d-\d\dT[\d:.]+(?:Z|\+00:00)$/.test(date)||!Number.isFinite(Date.parse(date)))throw Error('INVALID_CURSOR');
        query.set('or',`(created_at.lt.${date},and(created_at.eq.${date},version_id.lt.${id}))`);
      }
      return rows(query,token);
    },
    async get(owner,id,token) {
      const query=new URLSearchParams({select:'*',owner_id:`eq.${owner}`,version_id:`eq.${id}`,limit:'1'});
      return (await rows(query,token))[0]||null;
    },
    async sign(row,token,downloadName=null) {
      const expected=`${row.owner_id}/${row.version_id}.mp3`;
      if(row.object_key!==expected)throw Error('AUDIO_NOT_READY');
      // RLS is checked again by Storage using this user's JWT, not a service key.
      const response=await request('/storage/v1/object/sign/runlu-music-private/'+expected,token,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expiresIn:60})});
      const data=await response.json(),signed=data.signedURL||data.signedUrl;
      if(typeof signed!=='string')throw Error('AUDIO_NOT_READY');
      const target=new URL(signed.startsWith('/object/')?'/storage/v1'+signed:signed,origin);
      if(target.origin!==origin||!target.pathname.startsWith('/storage/v1/object/sign/runlu-music-private/'))throw Error('AUDIO_NOT_READY');
      if(downloadName)target.searchParams.set('download',downloadName);
      return target.href;
    },
    async audio(row,token,range) {
      if(row.object_key!==`${row.owner_id}/${row.version_id}.mp3`)throw Error('AUDIO_NOT_READY');
      const response=await request('/storage/v1/object/authenticated/runlu-music-private/'+row.object_key,token,{headers:range?{Range:range}:{}},[416]);
      return response;
    }
  };
}
