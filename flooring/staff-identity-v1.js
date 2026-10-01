/* RUNLU Flooring · Staff Identity Bridge V1
   Identity boundary only. Browser-local People/Staff stores are directory hints, never authentication.
   Production role elevation requires a trusted account-role provider.
*/
(()=>{'use strict';const PEOPLE='runlu_calendar_people_v064',USER='runlu_flooring_current_salesperson_v1',MAP='runlu_flooring_account_staff_map_v1';
const str=v=>String(v??'').trim(),read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}};
function staffMap(){const x=read(MAP);return Array.isArray(x)?x:[]}
function mappedStaff(userId){const m=staffMap().find(x=>str(x?.userId)===str(userId)&&x?.active!==false);if(!m)return null;const p=directoryPerson(m.personName||m.staffName);if(!p||p.active===false)return null;return {mapping:m,person:p}}
function directoryPerson(name){const a=read(PEOPLE);return Array.isArray(a)?a.find(p=>str(p?.name).toLowerCase()===str(name).toLowerCase()):null}
async function account(){const provider=window.RUNLUFlooringTrustedIdentity;if(provider?.getIdentity){try{return await provider.getIdentity()}catch(_){}}return null}
async function resolve(){const a=await account();if(a?.userId){const linked=mappedStaff(a.userId);if(!linked)return {authenticated:true,userId:a.userId,email:str(a.email),displayName:str(a.displayName||a.email),role:'sales',canManage:false,staffLinked:false,source:'trusted-account-unmapped'};const mappedRole=str(linked.mapping.role).toLowerCase(),r=['sales','manager','admin'].includes(str(a.role).toLowerCase())?str(a.role).toLowerCase():'sales';return {authenticated:true,userId:a.userId,email:str(a.email),displayName:str(linked.person.name),personId:str(linked.person.personId),role:r,canManage:['manager','admin'].includes(r),staffLinked:true,source:'trusted-account-staff-map'}}
const name=str(localStorage.getItem(USER))||'Unassigned',p=directoryPerson(name);return {authenticated:false,userId:'',email:str(p?.email),displayName:name,role:'sales',groups:Array.isArray(p?.groups)?p.groups:[],source:'local-preview',canManage:false}}
function salesStaff(){const a=read(PEOPLE);return (Array.isArray(a)?a:[]).filter(p=>p&&p.active!==false&&Array.isArray(p.groups)&&p.groups.includes('Sales')&&str(p.personId)).map(p=>({personId:str(p.personId),name:str(p.name),email:str(p.email)})).sort((a,b)=>a.name.localeCompare(b.name))}
window.RUNLUFlooringStaffIdentityV1={resolve,salesStaff};
})();