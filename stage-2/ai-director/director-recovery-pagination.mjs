// Recovery pagination request contract (not mounted on a production endpoint).
// Keyset cursor is opaque to clients; authenticated handlers must bind it to
// episode, filters and an authorized server-side query before using it.
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
const TOKEN=/^[A-Za-z0-9_-]{1,512}$/;
export const RECOVERY_PAGE_MAX=100;
export function parseRecoveryPageRequest(url){
 const u=new URL(url,'https://stage.invalid');
 const episodeId=u.searchParams.get('episodeId');
 if(!ID.test(episodeId??''))throw Error('Invalid episode');
 const rawSize=u.searchParams.get('pageSize')??'50';
 if(!/^[1-9][0-9]*$/.test(rawSize))throw Error('Invalid page size');
 const pageSize=Number(rawSize);
 if(!Number.isSafeInteger(pageSize)||pageSize>RECOVERY_PAGE_MAX)throw Error('Invalid page size');
 const cursor=u.searchParams.get('cursor');
 if(cursor!==null&&!TOKEN.test(cursor))throw Error('Invalid cursor');
 return Object.freeze({episodeId,pageSize,cursor});
}
export function projectRecoveryPage({episodeId,items,nextCursor=null,pageSize}){
 if(!ID.test(episodeId??'')||!Number.isInteger(pageSize)||pageSize<1||pageSize>RECOVERY_PAGE_MAX||
    !Array.isArray(items)||items.length>pageSize||
    (nextCursor!==null&&!TOKEN.test(nextCursor)))throw Error('Invalid recovery page');
 return Object.freeze({episodeId,items,nextCursor,pageSize,hasMore:nextCursor!==null});
}
