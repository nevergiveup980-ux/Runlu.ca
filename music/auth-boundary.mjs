// RUNLU MUSIC server-side authentication boundary.
// Adapt a verified Supabase Auth user to the job service without trusting browser IDs.
// This is a pure adapter; route handlers must validate JWTs using their server SDK.
export async function requireVerifiedMusicUser({authorization,verifyToken}){
  if(typeof verifyToken!=="function")throw Error("AUTH_VERIFIER_MISSING");
  if(typeof authorization!=="string"||!/^Bearer [^\s]+$/.test(authorization))throw Error("UNAUTHENTICATED");
  const token=authorization.slice(7);
  const user=await verifyToken(token); // MUST be verified server-side, not decoded-only
  if(!user||typeof user.id!=="string"||!/^[0-9a-f-]{36}$/i.test(user.id)||user.is_anonymous===true)throw Error("UNAUTHENTICATED");
  return user.id;
}
export function redactMusicError(error){
  const known=new Set(["UNAUTHENTICATED","INVALID_REQUEST","INVALID_TITLE","INVALID_LYRICS","INVALID_VOICE","LYRICS_REQUIRED","INVALID_STYLE","INVALID_LANGUAGE","INVALID_IDEMPOTENCY_KEY","INSUFFICIENT_CREDITS","NOT_FOUND"]);
  return known.has(error?.message)?error.message:"INTERNAL_ERROR";
}
