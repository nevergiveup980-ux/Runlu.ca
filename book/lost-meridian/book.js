(()=>{
  const ART='cover-flagship.jpg?v=20260912-6';
  const titles={en:'The Lost Meridian | RUNLU',zh:'失落经纬 | RUNLU',fr:'Le Méridien Perdu | RUNLU',es:'El Meridiano Perdido | RUNLU'};
  const coverTitles={en:'THE LOST MERIDIAN',zh:'失落经纬',fr:'LE MÉRIDIEN PERDU',es:'EL MERIDIANO PERDIDO'};
  const coverMarks={en:'RUNLU · FLAGSHIP WORK',zh:'RUNLU · 镇庐之作',fr:'RUNLU · ŒUVRE PHARE',es:'RUNLU · OBRA EMBLEMÁTICA'};
  const alts={en:'The Lost Meridian flagship cover',zh:'《失落经纬》镇庐之作封面',fr:'Couverture phare de Le Méridien Perdu',es:'Portada emblemática de El Meridiano Perdido'};

  function lang(){const d=document.documentElement.dataset.runluLanguage;return ['en','zh','fr','es'].includes(d)?d:'en'}

  function ensureStyle(){
    if(document.getElementById('lost-meridian-rebuilt-cover-style'))return;
    const s=document.createElement('style');
    s.id='lost-meridian-rebuilt-cover-style';
    s.textContent=`
      .lost-cover-rebuilt.cover{position:relative!important;display:block!important;width:min(100%,390px)!important;aspect-ratio:2/3!important;height:auto!important;margin:0 auto!important;padding:0!important;overflow:hidden!important;border-radius:4px!important;background:#07141d!important;box-shadow:0 22px 55px rgba(0,10,18,.46)!important}
      .lost-cover-fullart{position:absolute;inset:0;z-index:1;width:100%;height:100%;object-fit:cover;object-position:center center;display:block;filter:saturate(1.02) contrast(1.03) brightness(.98)}
      .lost-cover-rebuilt:after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(180deg,rgba(2,12,20,.12) 0%,rgba(2,12,20,0) 44%,rgba(0,0,0,.08) 100%)}
      .lost-cover-titleplate{position:absolute;z-index:3;left:5.5%;right:5.5%;top:4.8%;min-height:27%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6.5% 6% 5.2%;background:linear-gradient(165deg,rgba(4,17,26,.97),rgba(10,35,48,.94));border:1px solid rgba(225,190,118,.72);box-shadow:0 8px 28px rgba(0,0,0,.34);overflow:hidden}
      .lost-cover-titleplate:before,.lost-cover-titleplate:after{content:"";position:absolute;border:1px solid rgba(213,179,107,.13);border-radius:50%;pointer-events:none}
      .lost-cover-titleplate:before{width:76%;aspect-ratio:1;left:12%;top:44%}.lost-cover-titleplate:after{width:50%;aspect-ratio:1;left:25%;top:62%}
      .lost-cover-titleplate b{position:relative;z-index:1;max-width:96%;font-family:Georgia,'Noto Serif SC','Songti SC',serif;font-size:clamp(1.5rem,4vw,2.85rem);line-height:1.02;letter-spacing:.048em;font-weight:600;color:#f0d89f;text-shadow:0 2px 10px rgba(0,0,0,.8)}
      .lost-cover-titleplate small{position:relative;z-index:1;margin-top:.72rem;font:700 .62rem/1.2 Inter,Arial,sans-serif;letter-spacing:.19em;color:#d0b679}
      @media(max-width:560px){.lost-cover-titleplate{left:5%;right:5%;top:4.5%;min-height:28%;padding:6% 5%}.lost-cover-titleplate b{font-size:clamp(1.35rem,7.5vw,2.15rem)}.lost-cover-titleplate small{font-size:.54rem;letter-spacing:.14em}}
    `;
    document.head.appendChild(s);
  }

  function ensureCover(){
    ensureStyle();
    let el=document.getElementById('localized-cover');
    if(el && el.classList.contains('lost-cover-rebuilt')) return el;
    if(!el) return null;
    const frame=document.createElement('div');
    frame.id='localized-cover';
    frame.className='cover lost-cover-rebuilt';
    frame.setAttribute('role','img');
    frame.innerHTML=`<img class="lost-cover-fullart" src="${ART}" alt="" aria-hidden="true"><div class="lost-cover-titleplate"><b></b><small></small></div>`;
    el.replaceWith(frame);
    return frame;
  }

  function sync(){
    const l=lang(),cover=ensureCover();
    if(cover){
      cover.setAttribute('aria-label',alts[l]||alts.en);
      const b=cover.querySelector('.lost-cover-titleplate b');
      const sm=cover.querySelector('.lost-cover-titleplate small');
      const art=cover.querySelector('.lost-cover-fullart');
      if(b)b.textContent=coverTitles[l]||coverTitles.en;
      if(sm)sm.textContent=coverMarks[l]||coverMarks.en;
      if(art && !art.src.includes('20260912-6'))art.src=ART;
    }
    document.title=titles[l]||titles.en;
    const og=document.querySelector('meta[property="og:image"]');
    if(og)og.content='https://runlu.ca/book/lost-meridian/cover-flagship.jpg';
  }

  sync();
  window.addEventListener('runlu:languagechange',sync);
  window.addEventListener('pageshow',sync);
})();