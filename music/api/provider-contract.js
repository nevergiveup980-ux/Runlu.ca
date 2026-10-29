/**
 * Music provider adapter contract (not connected to a provider).
 * Provider-specific modules must implement this shape without exposing credentials.
 */
export class MusicProviderError extends Error {
 constructor(code,message,{retryable=false}={}){super(message);this.name="MusicProviderError";this.code=code;this.retryable=retryable;}
}
export function validateGeneratedTrack(track){
 if(!track || typeof track!=="object")throw new MusicProviderError("INVALID_PROVIDER_RESULT","Missing generated track");
 if(typeof track.id!=="string"||!track.id.trim())throw new MusicProviderError("INVALID_PROVIDER_RESULT","Missing track ID");
 if(typeof track.title!=="string"||!track.title.trim())throw new MusicProviderError("INVALID_PROVIDER_RESULT","Missing track title");
 if(!Number.isFinite(track.duration_seconds)||track.duration_seconds<=0)throw new MusicProviderError("INVALID_PROVIDER_RESULT","Invalid track duration");
 if(track.format!=="mp3")throw new MusicProviderError("INVALID_PROVIDER_RESULT","Track is not verified MP3");
 // The API must return only application-owned download routes, never provider secret-bearing URLs.
 if(typeof track.download_path!=="string"||!/^\/api\/music\/tracks\/[a-zA-Z0-9_-]+\/download$/.test(track.download_path))
  throw new MusicProviderError("INVALID_PROVIDER_RESULT","Download route must be an application-owned path");
 return Object.freeze({id:track.id,title:track.title,duration_seconds:track.duration_seconds,format:"mp3",download_path:track.download_path});
}
export function assertProviderReady(provider){
 if(!provider || typeof provider.createJob!=="function" || typeof provider.getJob!=="function")
  throw new MusicProviderError("PROVIDER_NOT_CONFIGURED","Music provider is not configured");
}
