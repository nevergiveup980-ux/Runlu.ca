(()=>{
  const ART='cover-flagship.jpg?v=20260912-5';
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
      .lost-cover-titleband{position:absolute;inset:0 0 auto 0;height:39%;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8% 8% 5%;background:radial-gradient(circle at 50% 112%,rgba(176,138,68,.22),transparent 42%),linear-gradient(165deg,#06131c 0%,#0b2230 58%,#112c38 100%);border-bottom:1px solid rgba(214,180,111,.7);overflow:hidden}
      .lost-cover-titleband:before,.lost-cover-titleband:after{content:"";position:absolute;border:1px solid rgba(213,179,107,.18);border-radius:50%;pointer-events:none}
      .lost-cover-titleband:before{width:72%;aspect-ratio:1;left:14%;top:42%}.lost-cover-titleband:after{width:48%;aspect-ratio:1;left:26%;top:58%}
      .lost-cover-titleband b{position:relative;z-index:1;max-width:92%;font-family:Georgia,'Noto Serif SC','Songti SC',serif;font-size:clamp(1.65rem,4.4vw,3.15rem);line-height:1.02;letter-spacing:.055em;font-weight:600;color:#efd79f;text-shadow:0 2px 10px rgba(0,0,0,.72)}
      .lost-cover-titleband small{position:relative;z-index:1;margin-top:.9rem;font:700 .66rem/1.2 Inter,Arial,sans-serif;letter-spacing:.22em;color:#cdb47a}
      .lost-cover-art{position:absolute;left:0;right:0;bottom:0;height:61%;overflow:hidden;background:#07141d}
      .lost-cover-art img{display:block;width:100%;height:100%;object-fit:cover;object-position:center bottom;filter:saturate(.96) contrast(1.03) brightness(.96)}
      .lost-cover-art:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,19,28,.26) 0%,rgba(6,19,28,0) 22%,rgba(0,0,0,.08) 100%);pointer-events:none}
      @media(max-width:560px){.lost-cover-titleband b{font-size:clamp(1.45rem,8vw,2.35rem)}.lost-cover-titleband small{font-size:.56rem;letter-spacing:.16em}.lost-cover-titleband{height:40%}.lost-cover-art{height:60%}}
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
    frame.innerHTML=`<div class="lost-cover-titleband"><b></b><small></small></div><div class="lost-cover-art"><img src="${ART}" alt="" aria-hidden="true"></div>`;
    el.replaceWith(frame);
    return frame;
  }

  function sync(){
    const l=lang(),cover=ensureCover();
    if(cover){
      cover.setAttribute('aria-label',alts[l]||alts.en);
      const b=cover.querySelector('.lost-cover-titleband b');
      const sm=cover.querySelector('.lost-cover-titleband small');
      const art=cover.querySelector('.lost-cover-art img');
      if(b)b.textContent=coverTitles[l]||coverTitles.en;
      if(sm)sm.textContent=coverMarks[l]||coverMarks.en;
      if(art && !art.src.includes('20260912-5'))art.src=ART;
    }
    document.title=titles[l]||titles.en;
    const og=document.querySelector('meta[property="og:image"]');
    if(og)og.content='https://runlu.ca/book/lost-meridian/cover-flagship.jpg';
  }

  sync();
  window.addEventListener('runlu:languagechange',sync);
  window.addEventListener('pageshow',sync);
})();