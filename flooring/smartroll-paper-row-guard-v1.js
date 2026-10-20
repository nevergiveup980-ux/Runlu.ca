/* SmartRoll paper PO row confirmation guard V1 — pure, read-only.
 * Pure comparison only; no DOM, inventory or PO modifications.
 * Confirms a recommendation only for the same live paper row and same fields.
 */
(function(root){
"use strict";
const norm=x=>String(x??"").trim().toLowerCase().replace(/\s+/g," ");
function snapshot(row,adapter){
 if(!row||!row.isConnected||!adapter?.readRow)return {ready:false,reason:"ROW_DETACHED"};
 const cells=Array.from(row.children||[]);
 if(cells.length<5)return {ready:false,reason:"ROW_STRUCTURE_CHANGED"};
 const clean=cell=>Array.from(cell.childNodes||[]).filter(node=>!node.classList?.contains("ppb52InventoryBtn")).map(node=>node.textContent||"").join("").trim();
 const current=adapter.readRow(cells.map(clean));
 if(!current.ready)return {ready:false,reason:"INCOMPLETE_ROW"};
 return {ready:true,row,document:row.ownerDocument,requestKey:current.requestKey,sourceRef:norm(clean(cells[4]))};
}
function begin(row,adapter){
 const s=snapshot(row,adapter);
 if(!s.ready)return {ok:false,reason:s.reason};
 return {ok:true,token:Object.freeze({row:s.row,document:s.document,requestKey:s.requestKey,sourceRef:s.sourceRef})};
}
function check(token,adapter){
 if(!token?.row||!token.document)return {ok:false,reason:"NO_TOKEN"};
 const s=snapshot(token.row,adapter);
 if(!s.ready)return {ok:false,reason:s.reason};
 if(s.document!==token.document)return {ok:false,reason:"ROW_DOCUMENT_CHANGED"};
 if(s.requestKey!==token.requestKey)return {ok:false,reason:"REQUEST_CHANGED"};
 if(s.sourceRef!==token.sourceRef)return {ok:false,reason:"REFERENCE_CHANGED"};
 return {ok:true,reason:"SAFE_TO_CONFIRM"};
}
const api=Object.freeze({version:"1.0.0",begin,check});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.RUNLUSmartRollPaperRowGuardV1=api;
})(typeof window!=="undefined"?window:null);
