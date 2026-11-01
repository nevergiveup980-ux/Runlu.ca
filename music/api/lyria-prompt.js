/**
 * RUNLU MUSIC STUDIO — Lyria prompt builder.
 * Keep user instructions in their chosen language; don't copy living artists' voices or protected lyrics.
 * A 30s preview is not an exact-duration promise for the full-song model.
 */
const languages=Object.freeze({
 zh:"请用自然、清晰的简体中文歌词演唱。",
 en:"Sing with natural, clear English lyrics.",
 fr:"Chante avec des paroles naturelles et claires en français.",
 es:"Canta con letras naturales y claras en español."
});
export function buildLyriaPrompt({prompt,language="zh",instrumental=false,mode="clip"}){
 if(typeof prompt!=="string"||!prompt.trim()||prompt.length>1000)throw new TypeError("Prompt must be 1–1000 characters");
 if(!Object.hasOwn(languages,language))throw new TypeError("Unsupported language");
 if(!["clip","full"].includes(mode))throw new TypeError("Unsupported generation mode");
 const style=instrumental
  ?"纯器乐演奏，不要人声、歌词或口白。"
  :languages[language]+" Compose entirely original melody and lyrics; include a memorable chorus.";
 const length=mode==="clip"?"Create a 30-second musical preview.":"Create a coherent full song with intro, verses, chorus, and ending.";
 return [prompt.trim(),style,length,"Do not imitate any identifiable artist's voice or reproduce existing copyrighted lyrics or melodies."].join("\n");
}
export function selectLyriaMode({durationSeconds}){
 if(durationSeconds===30)return "clip";
 if(durationSeconds===60)return "full"; // Full-song length is approximate; actual duration must be measured.
 throw new TypeError("Unsupported requested duration");
}
