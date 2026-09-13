(()=>{
  const cover='cover-flagship.jpg?v=20260912-flagship-3';
  const titles={en:'The Lost Meridian | RUNLU',zh:'失落经纬 | RUNLU',fr:'Le Méridien Perdu | RUNLU',es:'El Meridiano Perdido | RUNLU'};
  const coverTitles={en:'THE LOST MERIDIAN',zh:'失落经纬',fr:'LE MÉRIDIEN PERDU',es:'EL MERIDIANO PERDIDO'};
  const alts={en:'The Lost Meridian flagship cover',zh:'《失落经纬》镇庐之作封面',fr:'Couverture phare de Le Méridien Perdu',es:'Portada emblemática de El Meridiano Perdido'};
  function lang(){return document.documentElement.dataset.runluLanguage||'en'}
  function style(){
    if(document.getElementById('lost-flagship-localized-style'))return;
    const s=document.createElement('style');s.id='lost-flagship-localized-style';s.textContent=`
      .lost-flagship-cover-frame{position:relative;display:block;width:min(100%,390px);margin:0 auto;overflow:hidden;border-radius:3px;box-shadow:0 22px 55px rgba(0,10,18,.42)}
      .lost-flagship-cover-frame .cover{display:block!important;width:100%!important;height:auto!important;margin:0!important;border-radius:0!important;box-shadow:none!important}
      .lost-flagship-cover-title{position:absolute;z-index:2;left:0;right:0;top:5%;min-height:34%;padding:5.5% 9% 4%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:linear-gradient(180deg,rgba(2,9,16,.94) 0%,rgba(3,13,22,.88) 55%,rgba(3,13,22,.64) 82%,rgba(3,13,22,0) 100%);color:#ead09a;text-shadow:0 2px 9px rgba(0,0,0,.88);pointer-events:none}
      .lost-flagship-cover-title b{font-family:Georgia,'Noto Serif SC','Songti SC',serif;font-size:clamp(1.65rem,4.4vw,3.15rem);line-height:1.03;letter-spacing:.07em;font-weight:600}
      .lost-flagship-cover-title small{margin-top:.8rem;font:700 .67rem/1.2 Inter,Arial,sans-serif;letter-spacing:.25em;color:#cfb77d}
      @media(max-width:560px){.lost-flagship-cover-title b{font-size:clamp(1.45rem,8vw,2.45rem)}.lost-flagship-cover-title small{font-size:.58rem;letter-spacing:.18em}}
    `;document.head.appendChild(s);
  }
  function frame(img){
    let f=img.closest('.lost-flagship-cover-frame');
    if(!f){
      f=document.createElement('div');f.className='lost-flagship-cover-frame';
      img.parentNode.insertBefore(f,img);f.appendChild(img);
      const t=document.createElement('div');t.className='lost-flagship-cover-title';t.innerHTML='<b></b><small>RUNLU · FLAGSHIP WORK</small>';f.appendChild(t);
    }
    return f;
  }
  function sync(){
    style();
    const l=lang(),img=document.getElementById('localized-cover');
    if(img){
      img.src=cover;img.alt=alts[l]||alts.en;
      const f=frame(img),b=f.querySelector('.lost-flagship-cover-title b'),sm=f.querySelector('.lost-flagship-cover-title small');
      if(b)b.textContent=coverTitles[l]||coverTitles.en;
      if(sm)sm.textContent=l==='zh'?'RUNLU · 镇庐之作':l==='fr'?'RUNLU · ŒUVRE PHARE':l==='es'?'RUNLU · OBRA EMBLEMÁTICA':'RUNLU · FLAGSHIP WORK';
    }
    document.title=titles[l]||titles.en;
    const og=document.querySelector('meta[property="og:image"]');if(og)og.content='https://runlu.ca/book/lost-meridian/cover-flagship.jpg';
  }
  sync();
  window.addEventListener('runlu:languagechange',sync);
  window.addEventListener('pageshow',sync);
})();