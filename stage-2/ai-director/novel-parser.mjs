// RUNLU STAGE AI Director — offline, dependency-free TXT chapter parsing.
// EPUB and DOCX must be parsed by vetted adapters; never interpret them as TXT.
export const NOVEL_MAX_BYTES=5*1024*1024;
const CHAPTER=/^(?:chapter\s+(?:\d+|[ivxlcdm]+)(?:\s*[:.\-–—]\s*.*)?|(?:prologue|epilogue)(?:\s*[:.\-–—]\s*.*)?|第[一二三四五六七八九十百千万零〇两0-9]+[章节回](?:\s*.*)?)$/i;
export function parseNovelTxt({filename,bytes}){
 if(typeof filename!=='string'||!filename.toLowerCase().endsWith('.txt'))throw Error('TXT filename required');
 if(!(bytes instanceof Uint8Array)||!bytes.length||bytes.length>NOVEL_MAX_BYTES)throw Error('Invalid TXT size');
 let source;
 try{source=new TextDecoder('utf-8',{fatal:true}).decode(bytes)}catch{throw Error('TXT must be UTF-8');}
 source=source.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
 if(source.includes('\0'))throw Error('Binary content rejected');
 const lines=source.split('\n');
 const chapters=[];let title='Opening',start=1,body=[];
 const flush=()=>{const content=body.join('\n').trim();if(content)chapters.push({id:'chapter_'+String(chapters.length+1).padStart(3,'0'),title,startLine:start,text:content,characters:content.length});};
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();
  if(line.length<=160&&CHAPTER.test(line)){
   flush();title=line;start=i+1;body=[];
  }else body.push(lines[i]);
 }
 flush();
 if(!chapters.length)throw Error('No readable novel text');
 if(chapters.length>500)throw Error('Too many chapters');
 return {format:'txt',filename,chapterCount:chapters.length,chapters};
}
