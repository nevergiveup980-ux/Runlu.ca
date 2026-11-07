// AI Director Character Bible: immutable, provider-neutral visual/voice identity.
const txt=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
const ident=v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(v);
const safeOptional=(v,max)=>v===undefined||v===null||(typeof v==='string'&&v.length<=max);
export function createCharacterBible({characters}){
 if(!Array.isArray(characters)||!characters.length||characters.length>100)
  throw Error('1-100 characters required');
 const seen=new Set();
 const entries=characters.map(c=>{
  if(!ident(c?.id)||seen.has(c.id)||!txt(c.name,120)||!txt(c.visualPrompt,3000)||
    !safeOptional(c.voiceId,100)||!safeOptional(c.costume,1200)||
    !safeOptional(c.referenceAssetId,100)||!safeOptional(c.negativePrompt,1200))
   throw Error('Invalid or duplicate character');
  seen.add(c.id);
  return Object.freeze({id:c.id,name:c.name.trim(),visualPrompt:c.visualPrompt.trim(),
   negativePrompt:c.negativePrompt?.trim()??'',
   costume:c.costume?.trim()??'',voiceId:c.voiceId??null,
   referenceAssetId:c.referenceAssetId??null,revision:1});
 });
 return Object.freeze({schemaVersion:1,characters:Object.freeze(entries)});
}
export function characterShotReferences({bible,characterIds}){
 if(!Array.isArray(bible?.characters)||!Array.isArray(characterIds))throw Error('Invalid character lookup');
 const byId=new Map(bible.characters.map(c=>[c.id,c]));
 if(new Set(characterIds).size!==characterIds.length)throw Error('Duplicate shot character');
 return characterIds.map(id=>{
  const c=byId.get(id);
  if(!c)throw Error('Unknown character '+String(id));
  return {characterId:c.id,visualPrompt:c.visualPrompt,
   negativePrompt:c.negativePrompt,costume:c.costume,
   referenceAssetId:c.referenceAssetId,voiceId:c.voiceId,revision:c.revision};
 });
}
export function reviseCharacter({bible,characterId,changes}){
 if(!bible?.characters?.some(c=>c.id===characterId))throw Error('Unknown character');
 if(!changes||typeof changes!=='object'||Array.isArray(changes)||
    Object.keys(changes).some(k=>!['visualPrompt','negativePrompt','costume','voiceId','referenceAssetId'].includes(k)))
  throw Error('Unsupported character edit');
 const next=bible.characters.map(c=>c.id===characterId?
  {...c,...changes,revision:c.revision+1}:c);
 const validated=createCharacterBible({characters:next});
 return Object.freeze({...validated,characters:Object.freeze(validated.characters.map(c=>
  Object.freeze({...c,revision:next.find(n=>n.id===c.id).revision})))});
}
