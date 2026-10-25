/* Pilot-only RUNLU central Supabase sign-in in the same origin as SmartRoll.
   Credentials are sent only through Supabase Auth SDK; never saved or logged by this file. */
(function(root){
"use strict";
const PROJECT="https://ekrnknlawekeoszzkamd.supabase.co";
const KEY="sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn";
const AUTH="runlu-flooring-auth-v1";
let client;
function getClient(){
 if(!root.supabase?.createClient)throw new Error("Authentication library unavailable");
 return client||(client=root.supabase.createClient(PROJECT,KEY,{auth:{persistSession:true,storageKey:AUTH,autoRefreshToken:true,detectSessionInUrl:false}}));
}
async function status(){
 const {data,error}=await getClient().auth.getSession();
 if(error)throw error;
 return !!data?.session;
}
async function signIn(email,password){
 if(!email||!password)throw new Error("Enter your RUNLU central services email and password");
 const {data,error}=await getClient().auth.signInWithPassword({email,password});
 if(error)throw error;
 if(!data?.session)throw new Error("No session returned; sign-in was not completed");
 return true;
}
async function signOut(){
 const {error}=await getClient().auth.signOut();
 if(error)throw error;
 return true;
}
root.RUNLUSmartRollPaperAuthV1=Object.freeze({status,signIn,signOut});
})(window);
