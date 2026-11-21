const esc=(s:unknown)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const fmt=(n:number)=>n.toFixed(2);
export function renderCutLayout(roll:{id:string;w:number;l:number},cuts:{id:string;x:number;y:number;w:number;h:number;rotated?:boolean}[],used:number){
 if(!cuts.length)return '<p>No cuts allocated to this roll.</p>';
 const scale=Math.min(480/roll.w,600/used,24),W=roll.w*scale,H=used*scale;
 let svg=`<svg role="img" aria-label="Cut layout for ${esc(roll.id)}" viewBox="0 0 ${W+85} ${H+75}" width="${W+85}" height="${H+75}"><title>${esc(roll.id)}: width ${fmt(roll.w)} ft; allocated length ${fmt(used)} ft. Origin at top left. Numbered cuts match the table.</title><text x="55" y="16" font-size="13">Width ${fmt(roll.w)} ft →</text><text x="4" y="36" font-size="12">0</text><text x="4" y="${H+52}" font-size="12">${fmt(used)} ft</text><rect x="55" y="40" width="${W}" height="${H}" fill="#eef1ef" stroke="#334e47"/>`;
 cuts.forEach((c,i)=>{
  const x=55+c.x*scale,y=40+c.y*scale,w=c.w*scale,h=c.h*scale;
  svg+=`<g><title>#${i+1} ${esc(c.id)}: ${fmt(c.w)} × ${fmt(c.h)} ft; x ${fmt(c.x)}, y ${fmt(c.y)} ft${c.rotated?'; rotated 90°':''}</title><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${i%2?'#d2e4f3':'#c4e8d9'}" stroke="#234b43" stroke-width="1"/>`;
  if(w>=18&&h>=18)svg+=`<text x="${x+w/2}" y="${y+h/2+4}" text-anchor="middle" font-size="12" font-weight="bold" fill="#142e28">${i+1}</text>`;
  svg+='</g>';
 });
 svg+='</svg>';
 return '<p class="small">Origin (0,0): top-left roll edge. X → across width; Y ↓ along roll. Dimensions include allowances. Diagram shows allocated length only; shaded gaps are within-allocation offcuts. Small cuts may have no number inside; use the table for every cut.</p>'+svg+'<table class="cutLegend"><caption>Cut coordinates in feet · '+esc(roll.id)+'</caption><thead><tr><th>#</th><th>Piece ID</th><th>Cut W × L ft</th><th>X ft</th><th>Y ft</th><th>Orientation</th></tr></thead><tbody>'+cuts.map((c,i)=>`<tr><td>${i+1}</td><td>${esc(c.id)}</td><td>${fmt(c.w)} × ${fmt(c.h)}</td><td>${fmt(c.x)}</td><td>${fmt(c.y)}</td><td>${c.rotated?'Rotated 90°':'As entered'}</td></tr>`).join('')+'</tbody></table>';
}
