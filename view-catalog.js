(()=>{
  const entries=[
    {n:'001',href:'view-archive-001-010.html#ai-research',en:'AI research',zh:'AI 科研',fr:'Recherche IA',es:'Investigación IA'},
    {n:'002',href:'view-archive-001-010.html#personal-crispr',en:'Personal CRISPR',zh:'个体化基因编辑',fr:'CRISPR personnalisé',es:'CRISPR personalizado'},
    {n:'003',href:'view-archive-001-010.html#ips-parkinsons',en:'Parkinson’s regeneration',zh:'帕金森与再生医学',fr:'Parkinson et régénération',es:'Párkinson y regeneración'},
    {n:'004',href:'view-archive-001-010.html#ai-science-human-center',en:'Human-centred AI',zh:'以人为本的 AI',fr:'IA centrée sur l’humain',es:'IA centrada en las personas'},
    {n:'005',href:'view-archive-001-010.html#ai-reproducibility-teams',en:'Reproducibility',zh:'可重复性',fr:'Reproductibilité',es:'Reproducibilidad'},
    {n:'006',href:'view-archive-001-010.html#human-ai-common-ground',en:'Human–AI common ground',zh:'人机共识',fr:'Terrain commun humain–IA',es:'Terreno común humano–IA'},
    {n:'007',href:'view-archive-001-010.html#robot-chatgpt-moment',en:'Robot brains',zh:'机器人脑',fr:'Cerveaux robotiques',es:'Cerebros robóticos'},
    {n:'008',href:'view-archive-001-010.html#quantum-cft-spectrum',en:'Quantum spectrum',zh:'量子能谱',fr:'Spectre quantique',es:'Espectro cuántico'},
    {n:'009',href:'view-archive-001-010.html#llm-writing-signals',en:'AI writing signals',zh:'AI 写作信号',fr:'Signaux d’écriture IA',es:'Señales de escritura con IA'},
    {n:'010',href:'view-archive-001-010.html#science-authority-cues',en:'Science authority cues',zh:'科学权威线索',fr:'Signaux d’autorité scientifique',es:'Señales de autoridad científica'},
    {n:'011',href:'view-011-model-hardware-standard.html',date:'28 AUG 2026',en:'When AI agents leave the screen',zh:'当 AI 代理走出屏幕',fr:'Quand les agents IA quittent l’écran',es:'Cuando los agentes de IA salen de la pantalla'},
    {n:'012',href:'view-012-ordinary-people-build-tools.html',date:'3 SEP 2026',en:'When users begin building',zh:'当使用者开始亲手参与制造',fr:'Quand les utilisateurs commencent à construire',es:'Cuando los usuarios empiezan a construir'},
    {n:'013',href:'view-013-explainable-self-driving-ai.html',date:'4 SEP 2026',en:'When intelligent systems explain themselves',zh:'当智能系统开始解释自己',fr:'Quand les systèmes intelligents s’expliquent',es:'Cuando los sistemas inteligentes se explican'}
  ];
  const makeLink=(entry,latest=false)=>{
    const a=document.createElement('a');
    a.className=latest?'catalog-card latest-card':'catalog-card';
    a.href=entry.href;
    a.dataset.runluCatalog='true';

    const number=document.createElement('span');
    number.className='catalog-no';
    number.textContent=entry.n;

    const title=document.createElement('span');
    title.className='catalog-title';
    title.dataset.en=entry.en;
    title.dataset.zh=entry.zh;
    title.dataset.fr=entry.fr;
    title.dataset.es=entry.es;
    title.textContent=entry.en;

    a.append(number,title);

    if(entry.date){
      const date=document.createElement('span');
      date.className='catalog-date';
      date.textContent=entry.date;
      a.appendChild(date)
    }

    const arrow=document.createElement('span');
    arrow.className='catalog-arrow';
    arrow.textContent='→';
    a.appendChild(arrow);
    return a
  };
  function render(){
    const catalog=document.getElementById('viewCatalog');
    if(catalog&&!catalog.dataset.ready){
      entries.slice().reverse().forEach(e=>catalog.appendChild(makeLink(e)));
      catalog.dataset.ready='true'
    }
    const latest=document.getElementById('viewLatest');
    if(latest&&!latest.dataset.ready){latest.appendChild(makeLink(entries[entries.length-1],true));latest.dataset.ready='true'}
    if(window.RUNLULanguage)window.RUNLULanguage.apply(window.RUNLULanguage.get())
  }
  window.RUNLUViewCatalog={entries:[...entries]};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render()
})();