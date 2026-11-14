/** Strict CSV import. Values are data only; no spreadsheet expressions are evaluated. */
export function parseCSV(source:string):{line:number;cells:string[]}[]{
 if(source.length>1_000_000)throw Error('CSV exceeds 1 MB');
 const text=source.replace(/^\uFEFF/,'');
 const rows:{line:number;cells:string[]}[]=[];let cells:string[]=[],cell='',quoted=false,closed=false,line=1,start=1;
 const finishCell=()=>{cells.push(cell.trim());cell='';closed=false};
 const finishRow=()=>{finishCell();if(cells.some(Boolean))rows.push({line:start,cells});cells=[];start=line+1};
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++}else{quoted=false;closed=true}}else{cell+=c;if(c==='\n')line++}continue;}
  if(c===','){finishCell();continue;}
  if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;finishRow();line++;continue;}
  if(closed)throw Error(`CSV line ${line}: unexpected character after closing quote`);
  if(c==='"'){if(cell)throw Error(`CSV line ${line}: quote inside unquoted field`);quoted=true;continue;}
  cell+=c;
 }
 if(quoted)throw Error(`CSV line ${start}: unclosed quoted field`);
 if(cell||cells.length||closed)finishRow();
 if(rows.length>1001)throw Error('CSV supports at most 1000 data rows');
 return rows;
}
function records(source:string,required:string[],optional:string[]){
 const rows=parseCSV(source);if(rows.length<2)throw Error('CSV requires a header and at least one data row');
 const headers=rows.shift()!.cells;
 if(new Set(headers).size!==headers.length)throw Error('CSV has duplicate headers');
 for(const h of required)if(!headers.includes(h))throw Error(`CSV missing header: ${h}`);
 for(const h of headers)if(![...required,...optional].includes(h))throw Error(`CSV unknown header: ${h}`);
 return rows.map(({line,cells})=>{
  if(cells.length!==headers.length)throw Error(`CSV line ${line}: expected ${headers.length} columns, got ${cells.length}`);
  return {line,values:Object.fromEntries(headers.map((h,i)=>[h,cells[i]]))};
 });
}
const dimension=(v:string,line:number,key:string)=>{
 if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(v)||!Number.isFinite(Number(v))||Number(v)<=0)throw Error(`CSV line ${line}: ${key} must be positive decimal feet`);
 return Number(v);
};
function identity(v:string,line:number,key:string,ids:Set<string>){
 if(!v||v.length>200||ids.has(v))throw Error(`CSV line ${line}: empty, duplicate or overlong ${key}`);
 ids.add(v);return v;
}
export function importOrderCSV(rollSource:string,pieceSource:string){
 const rollIds=new Set<string>(),pieceIds=new Set<string>();
 const rolls=records(rollSource,['roll_id','stock_type','width_ft','available_length_ft','dye_lot'],['notes']).map(({line,values:v})=>{
  if(!['FULL','SHORT','REMNANT'].includes(v.stock_type))throw Error(`Roll CSV line ${line}: stock_type must be FULL, SHORT or REMNANT`);
  if(!v.dye_lot)throw Error(`Roll CSV line ${line}: dye_lot is required`);
  return {id:identity(v.roll_id,line,'roll_id',rollIds),stockType:v.stock_type as 'FULL'|'SHORT'|'REMNANT',w:dimension(v.width_ft,line,'width_ft'),l:dimension(v.available_length_ft,line,'available_length_ft'),lot:v.dye_lot};
 });
 const pieces=records(pieceSource,['piece_id','width_ft','length_ft','dye_lot','allow_rotate'],['notes']).map(({line,values:v})=>{
  if(!['true','false'].includes(v.allow_rotate.toLowerCase()))throw Error(`Piece CSV line ${line}: allow_rotate must be true or false`);
  return {id:identity(v.piece_id,line,'piece_id',pieceIds),w:dimension(v.width_ft,line,'width_ft'),l:dimension(v.length_ft,line,'length_ft'),lot:v.dye_lot,rotate:v.allow_rotate.toLowerCase()==='true'};
 });
 const warnings=[...(pieces.some(p=>!p.lot)?['Some pieces have no required dye lot; assignment is unconstrained.']:[]),...(pieces.some(p=>p.lot&&!rolls.some(r=>r.lot===p.lot))?['Some required dye lots are absent from stock; pieces may remain unplaced.']:[])];
 return {rolls,pieces,warnings};
}
