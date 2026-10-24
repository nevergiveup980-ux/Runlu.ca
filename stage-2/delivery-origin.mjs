// Strict same-origin policy for cookie-authenticated private delivery.
// Enforce before reading request bodies or invoking authentication/service.
// A deployment must explicitly configure its trusted HTTPS origin.
export function enforceDeliveryOrigin(request,{allowedOrigin}={}){
 if(typeof allowedOrigin!=="string")throw Error("Trusted origin required");
 let trusted;
 try{trusted=new URL(allowedOrigin);}catch{throw Error("Invalid trusted origin");}
 if(trusted.protocol!=="https:"||trusted.username||trusted.password||trusted.pathname!=="/"||trusted.search||trusted.hash)throw Error("HTTPS origin required");
 const headers=request?.headers;
 if(!headers||typeof headers!=="object")return false;
 const origin=headers.origin;
 if(typeof origin!=="string"||origin==="null")return false;
 let parsed;
 try{parsed=new URL(origin);}catch{return false;}
 if(parsed.origin!==trusted.origin||parsed.href!==parsed.origin+"/")return false;
 const site=headers["sec-fetch-site"];
 if(site!==undefined&&site!=="same-origin")return false;
 return true;
}
