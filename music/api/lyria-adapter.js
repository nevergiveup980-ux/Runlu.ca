/**
 * RUNLU MUSIC STUDIO — Google Lyria 3.5 REST adapter (opt-in, not deployed).
 * Google docs: https://ai.google.dev/gemini-api/docs/music-generation
 * Never call this directly from the browser; GEMINI_API_KEY is a server-side secret.
 */
import {MusicProviderError} from "./provider-contract.js";
const MODELS=Object.freeze({clip:"lyria-3-clip-preview",full:"lyria-3.5"});
export function createLyriaAdapter({apiKey,fetchImpl=fetch,model="clip",timeoutMs=120000}={}){
 if(!apiKey||typeof apiKey!=="string")throw new MusicProviderError("PROVIDER_NOT_CONFIGURED","Server-side Gemini API key required");
 if(!Object.hasOwn(MODELS,model))throw new MusicProviderError("INVALID_MODEL","Unsupported Lyria model");
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1000||timeoutMs>300000)throw new MusicProviderError("INVALID_TIMEOUT","Timeout must be 1–300 seconds");
 const selected=MODELS[model];
 return Object.freeze({
  async generate({prompt,language="en",instrumental=false}){
   if(typeof prompt!=="string"||!prompt.trim()||prompt.length>2000)throw new MusicProviderError("INVALID_PROMPT","Invalid prompt");
   if(!["zh","en","fr","es"].includes(language))throw new MusicProviderError("INVALID_LANGUAGE","Invalid language");
   // The caller supplies the localized, rights-safe instruction via buildLyriaPrompt.
   let response;
   try{response=await fetchImpl("https://generativelanguage.googleapis.com/v1beta/interactions",{
    method:"POST",signal:AbortSignal.timeout(timeoutMs),headers:{"content-type":"application/json","Api-Revision":"2026-05-20","x-goog-api-key":apiKey},
    body:JSON.stringify({model:selected,input:prompt.trim()})
   });}catch(error){
    // A timeout may happen after the provider accepted a billable request: never retry automatically.
    throw new MusicProviderError("PROVIDER_NETWORK_ERROR","Provider request interrupted; billing status unknown",{retryable:false});
   }
   if(!response.ok){
    const retryable=response.status===429||response.status>=500;
    throw new MusicProviderError("PROVIDER_HTTP_ERROR","Lyria request failed (HTTP "+response.status+")",{retryable});
   }
   const contentLength=Number(response.headers?.get?.("content-length")||0);
   if(contentLength>36*1024*1024)throw new MusicProviderError("PROVIDER_RESPONSE_TOO_LARGE","Provider response exceeds size limit");
   const data=await response.json();
   const blocks=(data.steps||[]).filter(s=>s.type==="model_output").flatMap(s=>s.content||[]);
   const audio=blocks.find(b=>b.type==="audio"&&typeof b.data==="string");
   if(!audio)throw new MusicProviderError("NO_AUDIO","Lyria response contained no audio");
   if(audio.data.length>Math.ceil(25*1024*1024*4/3)+8)throw new MusicProviderError("PROVIDER_AUDIO_TOO_LARGE","Provider audio exceeds 25 MB");
   const lyrics=blocks.filter(b=>b.type==="text"&&typeof b.text==="string").map(b=>b.text).join("\n");
   return Object.freeze({model:selected,audioBase64:audio.data,mimeType:audio.mime_type||"audio/mpeg",lyrics});
  }
 });
}
