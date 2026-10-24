// Bounded JSON request-body reader for Node.js HTTP hosts.
// Use before the delivery handler; never buffer unbounded user input.
export async function readDeliveryJsonBody(req,{maxBytes=4096}={}){
 if(!req||typeof req[Symbol.asyncIterator]!=="function")throw Error("Readable HTTP request required");
 if(!Number.isSafeInteger(maxBytes)||maxBytes<1||maxBytes>65536)throw Error("Invalid body limit");
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>30000)throw Error("Invalid body timeout");
 const contentType=String(req.headers?.["content-type"]??"").split(";")[0].trim().toLowerCase();
 if(contentType!=="application/json")throw Error("Unsupported content type");
 const declared=Number(req.headers?.["content-length"]);
 if(req.headers?.["content-length"]!==undefined&&(!Number.isSafeInteger(declared)||declared<0||declared>maxBytes))throw Error("Request body too large");
 const chunks=[];let size=0;
 const controller=new AbortController();
 const timeout=setTimeout(()=>{controller.abort(Error("Request body timeout"));req.destroy(Error("Request body timeout"));},timeoutMs);
 try{
 for await(const chunk of req.iterator({signal:controller.signal})){
  if(controller.signal.aborted)throw Error("Request body timeout");
  if(!Buffer.isBuffer(chunk))throw Error("Invalid body chunk");
  size+=chunk.length;
  if(size>maxBytes)throw Error("Request body too large");
  chunks.push(chunk);
 }
 if(controller.signal.aborted)throw Error("Request body timeout");
 }catch(error){if(controller.signal.aborted)throw Error("Request body timeout");throw error;}
 finally{clearTimeout(timeout);}
 let body;
 try{body=JSON.parse(Buffer.concat(chunks,size).toString("utf8"));}catch{throw Error("Invalid JSON body");}
 if(!body||typeof body!=="object"||Array.isArray(body))throw Error("JSON object required");
 if(typeof body.ticket!=="string"||body.ticket.length<10||body.ticket.length>2048)throw Error("Invalid ticket");
 return Object.freeze({ticket:body.ticket});
}
