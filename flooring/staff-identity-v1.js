/* RUNLU Flooring · Staff Identity Bridge V1
   Identity boundary only. Browser-local People/Staff stores are directory hints, never authentication.
   Production role elevation requires a trusted account-role provider.
*/
(()=>{'use strict';const PEOPLE='runlu_calendar_people_v064',USER='runlu_flooring_current_salesperson_v1';
const str=v=>String(v??'').trim(),read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}};
function directoryPerson(name){const a=read(PEOPLE);return Array.isArray(a)?a.find(p=>str(p?.name).toLowerCase()===str(name).toLowerCase()):null}
async function account(){const provider=window.RUNLUFlooringTrustedIdentity;if(provider?.getIdentity){try{return await provider.getIdentity()}catch(_){}}return null}
async function resolve(){const a=await account();if(a?.userId){return {authenticated:true,userId:a.userId,email:str(a.email),displayName:str(a.displayName||a.email),role:['sales','manager','admin'].includes(str(a.role).toLowerCase())?str(a.role).toLowerCase():'sales',source:'trusted-account-role'}}
const name=str(localStorage.getItem(USER))||'Unassigned',p=directoryPerson(name);return {authenticated:false,userId:'',email:str(p?.email),displayName:name,role:'sales',groups:Array.isArray(p?.groups)?p.groups:[],source:'local-preview',canManage:false}}
window.RUNLUFlooringStaffIdentityV1={resolve};
})();