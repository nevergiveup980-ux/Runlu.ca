import test from 'node:test';
import assert from 'node:assert/strict';
import {createCharacterBible,characterShotReferences,reviseCharacter} from './character-bible.mjs';
const make=()=>createCharacterBible({characters:[
 {id:'lead',name:'The protagonist',visualPrompt:'Dark hair, distinctive scar',costume:'Navy coat',voiceId:'voice_1',referenceAssetId:'ref_1'},
 {id:'guard',name:'Guard',visualPrompt:'Silver hair and uniform',voiceId:'voice_2'}]});
test('character reference and voice remain consistent across shots',()=>{
 const b=make();
 const a=characterShotReferences({bible:b,characterIds:['lead']})[0];
 const c=characterShotReferences({bible:b,characterIds:['guard','lead']})[1];
 assert.deepEqual(a,c);assert.equal(a.referenceAssetId,'ref_1');
});
test('revisions do not mutate earlier bible or silently change identity',()=>{
 const b=make(),n=reviseCharacter({bible:b,characterId:'lead',changes:{costume:'Black coat'}});
 assert.equal(b.characters[0].costume,'Navy coat');
 assert.equal(n.characters[0].costume,'Black coat');
 assert.equal(n.characters[0].revision,2);
 assert.equal(n.characters[1].revision,1);
});
test('unknown characters and duplicate identifiers are rejected',()=>{
 const b=make();
 assert.throws(()=>characterShotReferences({bible:b,characterIds:['missing']}));
 assert.throws(()=>characterShotReferences({bible:b,characterIds:['lead','lead']}));
 assert.throws(()=>createCharacterBible({characters:[b.characters[0],b.characters[0]]}));
 assert.throws(()=>reviseCharacter({bible:b,characterId:'lead',changes:{id:'new'}}));
});
