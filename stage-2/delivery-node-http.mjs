// Node.js HTTP transport bridge for framework-neutral STAGE delivery replies.
// The application must authenticate and CSRF-check before calling the handler.
import {pipeline} from "node:stream/promises";
export async function writeDeliveryHttpResponse(res,descriptor){
 if(!res||typeof res.writeHead!=="function"||typeof res.end!=="function")throw Error("Node HTTP response required");
 if(!descriptor||!Number.isInteger(descriptor.status)||!descriptor.headers)throw Error("Invalid delivery response");
 const {status,headers,stream,body}=descriptor;
 if(stream){
  if(status!==200||typeof stream.pipe!=="function"||typeof stream.destroy!=="function")throw Error("Invalid private delivery stream");
  // pipeline destroys source on socket closure and propagates backpressure.
  res.writeHead(status,headers);
  try{await pipeline(stream,res);}
  catch(error){
   if(!stream.destroyed)stream.destroy();
   // Headers are already sent: do not attempt a JSON error response.
   if(!res.destroyed)res.destroy(error);
   throw error;
  }
  return;
 }
 res.writeHead(status,headers);
 res.end(JSON.stringify(body??{}));
}
