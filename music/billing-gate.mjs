// RUNLU MUSIC: fail-closed billing gate. No network, database writes or provider calls.
// A trusted server must pass catalog records fetched from its own database, never browser input.
export function authorizeMusicCharge({catalogPlan,units=1,serverBillingEnabled=false}={}){
  if(serverBillingEnabled!==true)throw Error("MUSIC_BILLING_DISABLED");
  if(!catalogPlan||typeof catalogPlan!=="object")throw Error("MUSIC_PLAN_NOT_CONFIGURED");
  if(typeof catalogPlan.plan_key!=="string"||!/^runlu_music_[a-z0-9_]+$/.test(catalogPlan.plan_key))
    throw Error("MUSIC_PLAN_NOT_CONFIGURED");
  if(typeof catalogPlan.product_key!=="string"||!/^runlu_music(?:_[a-z0-9_]+)?$/.test(catalogPlan.product_key))
    throw Error("MUSIC_PLAN_NOT_CONFIGURED");
  if(catalogPlan.fulfillment_mode!=="consumable_credit")throw Error("INVALID_FULFILLMENT_MODE");
  if(units!==1)throw Error("INVALID_MUSIC_UNITS");
  return Object.freeze({planKey:catalogPlan.plan_key,units:1});
}
export function assertProviderExecutionAllowed({billingAuthorization,job,providerEnabled=false}={}){
  if(providerEnabled!==true)throw Error("MUSIC_PROVIDER_DISABLED");
  if(!billingAuthorization||billingAuthorization.units!==1)throw Error("MUSIC_BILLING_NOT_AUTHORIZED");
  if(!job||job.status!=="running"||!job.id)throw Error("MUSIC_JOB_NOT_CLAIMED");
  return true;
}
