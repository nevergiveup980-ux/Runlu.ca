/* RUNLU Flooring OS Universal · U0 role permission matrix
   UI capability model only. Database RLS remains authoritative. */
(function(){
'use strict';
const MATRIX=Object.freeze({
  owner:['company.manage','members.manage','locations.manage','sales.read','sales.write','po.read','po.write','calendar.read','calendar.write','warehouse.read','warehouse.write','payments.read','payments.write','accounting.read','accounting.write','pricing.read','pricing.write','claims.read','claims.write','reports.read'],
  admin:['members.manage','locations.manage','sales.read','sales.write','po.read','po.write','calendar.read','calendar.write','warehouse.read','warehouse.write','payments.read','payments.write','accounting.read','pricing.read','pricing.write','claims.read','claims.write','reports.read'],
  manager:['sales.read','sales.write','po.read','po.write','calendar.read','calendar.write','warehouse.read','warehouse.write','payments.read','accounting.read','pricing.read','claims.read','claims.write','reports.read'],
  sales:['sales.read','sales.write','po.read','po.write','calendar.read','pricing.read','claims.read','claims.write'],
  warehouse:['po.read','calendar.read','warehouse.read','warehouse.write'],
  installer:['calendar.read'],
  accounting:['sales.read','po.read','payments.read','payments.write','accounting.read','accounting.write','pricing.read','reports.read'],
  viewer:['sales.read','po.read','calendar.read','warehouse.read','reports.read']
});
function permissions(role){return [...(MATRIX[role]||[])];}
function can(role,capability){return permissions(role).includes(capability);}
window.RUNLUUniversalPermissions=Object.freeze({matrix:MATRIX,permissions,can});
})();