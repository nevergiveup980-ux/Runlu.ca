// Creative draft; appearance and voice descriptions are adaptation choices, not approved assets.
import {createGlassThronePilot} from './glass-throne-pilot.mjs';
export const characters = [
  {
    "id": "daniel",
    "name": "Daniel Mercer",
    "appearance": "Brown hair, early forties, charcoal suit, white shirt",
    "voice": "Measured, observant, restrained",
    "visualAssetId": null,
    "voiceAssetId": null
  },
  {
    "id": "richard",
    "name": "Richard Vale",
    "appearance": "Silver-gray hair, senior executive, navy suit",
    "voice": "Low, composed, authoritative",
    "visualAssetId": null,
    "voiceAssetId": null
  },
  {
    "id": "jonathan",
    "name": "Jonathan Reed",
    "appearance": "51, tailored black suit, composed expression",
    "voice": "Confident, controlled",
    "visualAssetId": null,
    "voiceAssetId": null
  },
  {
    "id": "caroline",
    "name": "Caroline Voss",
    "appearance": "Dark blazer, neat shoulder-length hair, notebook",
    "voice": "Precise, calm",
    "visualAssetId": null,
    "voiceAssetId": null
  },
  {
    "id": "marcus",
    "name": "Marcus Hale",
    "appearance": "Dark suit, neat hair, remote London office",
    "voice": "Even, restrained",
    "visualAssetId": null,
    "voiceAssetId": null
  },
  {
    "id": "narrator",
    "name": "Narrator",
    "appearance": null,
    "voice": "Neutral English, quiet and deliberate",
    "visualAssetId": null,
    "voiceAssetId": null
  }
];
const cast=[[],['daniel'],['richard','daniel'],['jonathan','caroline','marcus'],['richard'],['jonathan','daniel'],['daniel','jonathan'],[]];
export function createGlassThroneAssetPlan(){
 const plan=createGlassThronePilot();
 return {...plan,shots:plan.shots.map((s,i)=>({...s,characterIds:cast[i],voiceCharacterIds:[...new Set(s.dialogue.map(l=>l.characterId))]})),characters:structuredClone(characters),assetStatus:'DRAFT',providerCallsAllowed:false};
}
