/**
 * RUNLU MUSIC STUDIO — explicit paid generation gate.
 * No HTTP route invokes this module yet. Enable only in private dev after budget approval.
 */
import {MusicProviderError} from "./provider-contract.js";
import {buildLyriaPrompt,selectLyriaMode} from "./lyria-prompt.js";
import {createLyriaAdapter} from "./lyria-adapter.js";
export async function generateWithApproval({env,request,fetchImpl}){
 if(env?.MUSIC_GENERATION_ENABLED!=="true")
  throw new MusicProviderError("GENERATION_DISABLED","Paid generation is disabled");
 if(env?.MUSIC_TEST_APPROVED!=="true")
  throw new MusicProviderError("APPROVAL_REQUIRED","Explicit test approval required");
 if(!env?.GEMINI_API_KEY)
  throw new MusicProviderError("PROVIDER_NOT_CONFIGURED","Private Gemini API key required");
 if(!request||typeof request!=="object")throw new MusicProviderError("INVALID_INPUT","Missing generation request");
 const mode=selectLyriaMode({durationSeconds:request.duration_seconds});
 const prompt=buildLyriaPrompt({prompt:request.prompt,language:request.language,instrumental:request.instrumental,mode});
 const provider=createLyriaAdapter({apiKey:env.GEMINI_API_KEY,model:mode,fetchImpl});
 return await provider.generate({prompt,language:request.language,instrumental:request.instrumental});
}
