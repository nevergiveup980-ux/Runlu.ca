(()=>{
'use strict';

const root=window.RUNLU=window.RUNLU||{};
const SUPABASE_URL='https://ekrnknlawekeoszzkamd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
let client=null;

function core(){return root}
function ensureSdk(){
  if(!window.supabase?.createClient)throw new Error('Supabase SDK is not loaded.');
}
function getClient(){
  ensureSdk();
  if(!client){
    client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
  }
  return client;
}
async function session(){return (await getClient().auth.getSession()).data.session||null}
async function user(){return (await getClient().auth.getUser()).data.user||null}
async function requireUser(){
  const current=await user();
  if(!current)throw new Error('Authentication required.');
  return current;
}
function signIn(email,password){return getClient().auth.signInWithPassword({email:String(email||'').trim(),password:String(password||'')})}
function signUp(email,password,redirectTo){
  const options=redirectTo?{emailRedirectTo:redirectTo}:undefined;
  return getClient().auth.signUp({email:String(email||'').trim(),password:String(password||''),options});
}
function signOut(){return getClient().auth.signOut()}
function onAuthStateChange(handler){return getClient().auth.onAuthStateChange(handler)}
function from(table){return getClient().from(table)}
function upload(bucket,path,file,options={}){return getClient().storage.from(bucket).upload(path,file,{upsert:false,...options})}
function download(bucket,path){return getClient().storage.from(bucket).download(path)}
function remove(bucket,paths){return getClient().storage.from(bucket).remove(Array.isArray(paths)?paths:[paths])}
function versionedUserPath({userId,scope='asset',filename='file'}){
  if(!userId)throw new Error('userId is required.');
  const security=core().security||{};
  const files=core().files||{};
  const safeKey=security.safeKey||((value)=>String(value||'asset').replace(/[^A-Za-z0-9_-]+/g,'-'));
  const safeFileName=security.safeFileName||((value)=>String(value||'file').replace(/[^A-Za-z0-9_.-]+/g,'-'));
  const stamp=files.utcStamp?files.utcStamp():new Date().toISOString().replace(/[:.]/g,'-');
  return `${userId}/${safeKey(scope,'asset')}/${stamp}-${safeFileName(filename,'file')}`;
}

root.cloud={
  version:'0.1.0',
  provider:'supabase',
  projectUrl:SUPABASE_URL,
  getClient,
  from,
  auth:{session,user,requireUser,signIn,signUp,signOut,onAuthStateChange},
  storage:{upload,download,remove,versionedUserPath}
};

window.dispatchEvent(new CustomEvent('runlu:cloud-ready',{detail:{provider:'supabase',version:'0.1.0'}}));
})();
