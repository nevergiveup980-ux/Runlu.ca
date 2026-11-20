// Signed, episode-bound recovery pagination cursor. Prototype only; not mounted.
// A server must supply a private secret and authorize each requested episode.
import {createHmac,timingSafeEqual} from 'node:crypto';
const ID=/^[A-Za-z0-9_-]{1,100}$/;
const TOKEN=/^[A-Za-z0-9_-]{1,512}$/;
const ISO=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/;
function secretBytes(secret){
 if(typeof secret!=='string'||Buffer.byteLength(secret,'utf8')<32)throw Error('Strong cursor secret required');
 return Buffer.from(secret,'utf8');
}
function validTuple(tuple){
 return tuple&&ID.test(tuple.attemptId??'')&&typeof tuple.updatedAt==='string'&&
 ISO.test(tuple.updatedAt)&&Number.isFinite(Date.parse(tuple.updatedAt));
}
export function signRecoveryCursor({episodeId,after,secret,issuedAt=Date.now()}){
 const key=secretBytes(secret);
 if(!ID.test(episodeId??'')||!validTuple(after)||!Number.isSafeInteger(issuedAt)||issuedAt<0)
  throw Error('Invalid cursor input');
 const payload=Buffer.from(JSON.stringify({v:1,e:episodeId,t:after.updatedAt,a:after.attemptId,i:issuedAt})).toString('base64url');
 const mac=createHmac('sha256',key).update(payload).digest('base64url');
 const token=payload+'.'+mac;
 if(token.length>512)throw Error('Cursor too long');
 return token;
}
export function verifyRecoveryCursor({token,episodeId,secret,now=Date.now(),maxAgeMs=15*60*1000}){
 const key=secretBytes(secret);
 if(!ID.test(episodeId??'')||typeof token!=='string'||token.length>512||
  !Number.isSafeInteger(now)||!Number.isSafeInteger(maxAgeMs)||maxAgeMs<1)throw Error('Invalid cursor request');
 const parts=token.split('.');
 if(parts.length!==2||!TOKEN.test(parts[0])||!TOKEN.test(parts[1]))throw Error('Invalid cursor');
 const expected=createHmac('sha256',key).update(parts[0]).digest();
 let actual;
 try{actual=Buffer.from(parts[1],'base64url')}catch{throw Error('Invalid cursor')}
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))throw Error('Invalid cursor signature');
 let value;
 try{value=JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8'))}catch{throw Error('Invalid cursor payload')}
 const after={updatedAt:value?.t,attemptId:value?.a};
 if(value?.v!==1||value.e!==episodeId||!validTuple(after)||!Number.isSafeInteger(value.i)||
  value.i>now||now-value.i>maxAgeMs)throw Error('Expired or mismatched cursor');
 return Object.freeze({...after,issuedAt:value.i});
}
