import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const origins = new Set(["https://runlu.ca","https://www.runlu.ca","https://nevergiveup980-ux.github.io"]);
function reply(req:Request, data:unknown, status=200) {
  const origin=req.headers.get("origin")||"";
  return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin","Access-Control-Allow-Origin":origins.has(origin)?origin:"https://runlu.ca","Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS"}});
}
Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":origins.has(req.headers.get("origin")||"")?req.headers.get("origin")!:"https://runlu.ca","Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS"}});
  if(req.method!=="POST")return reply(req,{ok:false,error:"method_not_allowed"},405);
  const origin=req.headers.get("origin")||"";
  if(origin&&!origins.has(origin))return reply(req,{ok:false,error:"origin_blocked"},403);
  const supabaseUrl=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),secret=Deno.env.get("STRIPE_SECRET_KEY");
  if(!supabaseUrl||!anon||!service||!secret)return reply(req,{ok:false,error:"server_not_configured"},503);
  const auth=req.headers.get("Authorization")||"";
  if(!auth.startsWith("Bearer "))return reply(req,{ok:false,error:"authentication_required"},401);
  const client=createClient(supabaseUrl,anon,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user)return reply(req,{ok:false,error:"authentication_required"},401);
  const admin=createClient(supabaseUrl,service,{auth:{persistSession:false,autoRefreshToken:false}});
  // The customer ID must be derived exclusively from the authenticated user's stored subscriptions.
  const {data:subs,error:dbError}=await admin.from("runlu_subscriptions").select("provider_customer_reference,provider_subscription_reference,status").eq("user_id",user.id).eq("payment_provider","stripe").in("status",["active","trialing","past_due","unpaid"]).not("provider_customer_reference","is",null).order("created_at",{ascending:false}).limit(50);
  if(dbError)return reply(req,{ok:false,error:"subscription_lookup_failed"},503);
  const customers=[...new Set((subs||[]).map(s=>String(s.provider_customer_reference||"")).filter(x=>/^cus_[A-Za-z0-9]+$/.test(x)))];
  if(!customers.length)return reply(req,{ok:false,error:"no_stripe_subscription"},404);
  // Multiple Stripe customers cannot safely be chosen by a client-provided ID.
  if(customers.length>1)return reply(req,{ok:false,error:"multiple_billing_profiles_contact_support"},409);
  const customer=customers[0];
  // Never attempt a portal session using a test-mode customer against a live-mode key or vice versa.
  const check=await fetch("https://api.stripe.com/v1/customers/"+encodeURIComponent(customer),{headers:{Authorization:"Bearer "+secret}});
  const checked=await check.json().catch(()=>({}));
  if(!check.ok||checked.deleted)return reply(req,{ok:false,error:"stripe_customer_unavailable"},502);
  const params=new URLSearchParams({customer,return_url:"https://runlu.ca/account.html#subscriptions"});
  const result=await fetch("https://api.stripe.com/v1/billing_portal/sessions",{method:"POST",headers:{Authorization:"Bearer "+secret,"Content-Type":"application/x-www-form-urlencoded"},body:params});
  const portal=await result.json().catch(()=>({}));
  if(!result.ok||typeof portal.url!=="string"||!portal.url.startsWith("https://billing.stripe.com/"))return reply(req,{ok:false,error:"portal_unavailable"},502);
  return reply(req,{ok:true,url:portal.url});
});
