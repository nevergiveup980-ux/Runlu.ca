(()=>{
  const KEY='runlu_site_language';
  const AVAILABLE=['en','zh','fr','es'];
  const PLANNED=[];
  const ALL=[...AVAILABLE,...PLANNED];
  const FALLBACK='en';
  const CATALOG={
    fr:{
      'Philosophy':'Philosophie','What We Do':'Ce que nous faisons','Studio':'Studio','Now':'En ce moment','View':'Regards','Lab':'Laboratoire','Health':'Santé','Forum':'Forum','About':'À propos','Contact':'Contact',
      'A Place to Grow From Within':'Un lieu pour grandir de l’intérieur','RUNLU is a nourishing abode.':'RUNLU est un refuge qui nourrit.','A place shaped by patience, where growth is allowed to rise from within.':'Un lieu façonné par la patience, où la croissance peut naître de l’intérieur.','We do not seek to change people, only to offer space — for life to unfold in its own time.':'Nous ne cherchons pas à changer les personnes, mais à leur offrir un espace — pour que la vie se déploie à son propre rythme.','Our Philosophy':'Notre philosophie','Selected Works':'Œuvres choisies',
      'Philosophy of RUNLU':'La philosophie de RUNLU','Growth is not forced.':'La croissance ne se force pas.','RUNLU is not created to change you. It offers a place to settle — where life is gently nourished and allowed to unfold as it is.':'RUNLU n’a pas été créé pour vous changer. Il offre un lieu où se poser — où la vie est doucement nourrie et libre de se déployer telle qu’elle est.','We believe true growth is never forced or rushed. It emerges quietly within spaces that respect time, presence, and continuity.':'Nous croyons que la véritable croissance ne se force ni ne se précipite. Elle émerge en silence dans des espaces qui respectent le temps, la présence et la continuité.','An abode gives shelter. Nourishment gives life.':'Un refuge abrite. Ce qui nourrit donne vie.','When space is calm, and time is patient, growth rises naturally — from within.':'Lorsque l’espace est calme et le temps patient, la croissance naît naturellement — de l’intérieur.',
      'We create things and spaces that nourish life.':'Nous créons des objets et des espaces qui nourrissent la vie.','How We Do It':'Notre manière de faire','Restraint. Patience. Respect.':'Retenue. Patience. Respect.','Principles':'Principes','Less, but more precisely.':'Moins, mais avec plus de justesse.','Nourish, not stimulate.':'Nourrir, sans surstimuler.','We look for what can quietly support life over time.':'Nous recherchons ce qui peut soutenir la vie discrètement, dans la durée.','Respect what is already there.':'Respecter ce qui est déjà là.','Materials, people, and places are listened to before they are shaped.':'Nous écoutons les matériaux, les personnes et les lieux avant de leur donner forme.','Build for continued use.':'Concevoir pour un usage durable.','The real test of form is not first impression, but life with it.':'Le véritable test d’une forme n’est pas la première impression, mais la vie à ses côtés.','Let time verify the choice.':'Laisser le temps confirmer le choix.','What lasts matters more than what briefly attracts attention.':'Ce qui dure compte davantage que ce qui attire brièvement l’attention.',
      'Ideas shaped through real use.':'Des idées façonnées par l’usage réel.','RUNLU Studio is where ideas become useful systems — built from real environments, refined through experience, and improved with patience.':'RUNLU Studio est le lieu où les idées deviennent des systèmes utiles — nés de situations réelles, affinés par l’expérience et améliorés avec patience.','A live operating system for real warehouse work.':'Un système opérationnel vivant pour le travail réel en entrepôt.','Inventory, receiving, shipping, operations, scanning, voice intelligence, and live cloud data — brought into one practical working system.':'Stocks, réception, expédition, opérations, numérisation, intelligence vocale et données infonuagiques en direct — réunis dans un seul système de travail pratique.','Active system':'Système actif','View project →':'Voir le projet →','Simple invoicing, thoughtfully automated.':'Une facturation simple, automatisée avec soin.','A native iPhone invoicing workspace designed for calm, repeatable billing — with offline-first work, file export, sharing, and subscription support.':'Un espace de facturation natif pour iPhone, conçu pour une facturation sereine et répétable — avec travail hors ligne, export de fichiers, partage et gestion des abonnements.','iOS release candidate':'Version iOS candidate','View product →':'Voir le produit →',
      'Currently at RUNLU':'En ce moment chez RUNLU','A few things, growing carefully.':'Quelques projets qui grandissent avec soin.','Early Beta':'Bêta précoce','Latest · 4 articles':'Derniers · 4 articles','LAB 001 · Question defined':'LAB 001 · Question définie','HEALTH 001 + VIEW 002':'HEALTH 001 + VIEW 002','Important research, understood carefully.':'Des recherches importantes, comprises avec soin.','Independent, carefully sourced introductions to ideas that may reshape how we understand technology, medicine, and the world.':'Des présentations indépendantes et soigneusement sourcées d’idées susceptibles de transformer notre compréhension de la technologie, de la médecine et du monde.','Read the latest selection →':'Lire la dernière sélection →',
      'A quiet place for humans and AI to think together.':'Un lieu calme où humains et IA réfléchissent ensemble.','Thoughtful conversations about AI, making, systems, and the human questions around them. AI does not speak by default — it joins only when invited.':'Des conversations réfléchies sur l’IA, la création, les systèmes et les questions humaines qui les entourent. L’IA ne parle pas par défaut — elle ne participe que lorsqu’elle est invitée.','Enter RUNLU Forum':'Entrer dans le forum RUNLU','About RUNLU':'À propos de RUNLU','A nourishing abode.':'Un refuge qui nourrit.','RUNLU is a nourishing abode. A place shaped by patience, where growth is allowed to rise from within.':'RUNLU est un refuge qui nourrit. Un lieu façonné par la patience, où la croissance peut naître de l’intérieur.','RUNLU Notes':'Notes RUNLU','Quiet notes on making, systems, space, and time.':'Des notes discrètes sur la création, les systèmes, l’espace et le temps.','Not a news feed. A place for occasional thoughts that are worth keeping.':'Pas un fil d’actualité. Un lieu pour conserver, de temps à autre, des pensées qui en valent la peine.','Read RUNLU Notes →':'Lire les Notes RUNLU →','Contact & Support':'Contact et soutien','Built quietly. Made to endure.':'Conçu avec discrétion. Fait pour durer.','RUNLU is growing one thoughtful project at a time.':'RUNLU grandit, un projet réfléchi à la fois.','Leave a Note':'Laisser un message','Support':'Soutien','Privacy':'Confidentialité','Pulse ↗':'Pulse ↗'
    },
    es:{
      'Philosophy':'Filosofía','What We Do':'Lo que hacemos','Studio':'Estudio','Now':'Ahora','View':'Perspectivas','Lab':'Laboratorio','Health':'Salud','Forum':'Foro','About':'Acerca de','Contact':'Contacto',
      'A Place to Grow From Within':'Un lugar para crecer desde dentro','RUNLU is a nourishing abode.':'RUNLU es un refugio que nutre.','A place shaped by patience, where growth is allowed to rise from within.':'Un lugar moldeado por la paciencia, donde el crecimiento puede surgir desde dentro.','We do not seek to change people, only to offer space — for life to unfold in its own time.':'No buscamos cambiar a las personas, sino ofrecerles espacio — para que la vida se despliegue a su propio ritmo.','Our Philosophy':'Nuestra filosofía','Selected Works':'Obras seleccionadas',
      'Philosophy of RUNLU':'La filosofía de RUNLU','Growth is not forced.':'El crecimiento no se fuerza.','RUNLU is not created to change you. It offers a place to settle — where life is gently nourished and allowed to unfold as it is.':'RUNLU no fue creado para cambiarte. Ofrece un lugar donde asentarte — donde la vida recibe cuidado y puede desplegarse tal como es.','We believe true growth is never forced or rushed. It emerges quietly within spaces that respect time, presence, and continuity.':'Creemos que el verdadero crecimiento nunca se fuerza ni se apresura. Surge en silencio dentro de espacios que respetan el tiempo, la presencia y la continuidad.','An abode gives shelter. Nourishment gives life.':'Un refugio protege. El cuidado da vida.','When space is calm, and time is patient, growth rises naturally — from within.':'Cuando el espacio está en calma y el tiempo es paciente, el crecimiento surge de forma natural — desde dentro.',
      'We create things and spaces that nourish life.':'Creamos objetos y espacios que nutren la vida.','How We Do It':'Cómo lo hacemos','Restraint. Patience. Respect.':'Moderación. Paciencia. Respeto.','Principles':'Principios','Less, but more precisely.':'Menos, pero con más precisión.','Nourish, not stimulate.':'Nutrir, no sobreestimular.','We look for what can quietly support life over time.':'Buscamos aquello que pueda sostener la vida silenciosamente a lo largo del tiempo.','Respect what is already there.':'Respetar lo que ya existe.','Materials, people, and places are listened to before they are shaped.':'Escuchamos a los materiales, las personas y los lugares antes de darles forma.','Build for continued use.':'Crear para un uso duradero.','The real test of form is not first impression, but life with it.':'La verdadera prueba de una forma no es la primera impresión, sino la vida junto a ella.','Let time verify the choice.':'Dejar que el tiempo confirme la elección.','What lasts matters more than what briefly attracts attention.':'Lo que perdura importa más que lo que atrae la atención por un instante.',
      'Ideas shaped through real use.':'Ideas moldeadas por el uso real.','RUNLU Studio is where ideas become useful systems — built from real environments, refined through experience, and improved with patience.':'RUNLU Studio es donde las ideas se convierten en sistemas útiles — nacidos de entornos reales, refinados mediante la experiencia y mejorados con paciencia.','A live operating system for real warehouse work.':'Un sistema operativo vivo para el trabajo real de almacén.','Inventory, receiving, shipping, operations, scanning, voice intelligence, and live cloud data — brought into one practical working system.':'Inventario, recepción, envíos, operaciones, escaneo, inteligencia de voz y datos en vivo en la nube — reunidos en un único sistema de trabajo práctico.','Active system':'Sistema activo','View project →':'Ver proyecto →','Simple invoicing, thoughtfully automated.':'Facturación sencilla, automatizada con cuidado.','A native iPhone invoicing workspace designed for calm, repeatable billing — with offline-first work, file export, sharing, and subscription support.':'Un espacio de facturación nativo para iPhone, diseñado para una facturación serena y repetible — con trabajo sin conexión, exportación de archivos, uso compartido y gestión de suscripciones.','iOS release candidate':'Versión candidata para iOS','View product →':'Ver producto →',
      'Currently at RUNLU':'Ahora en RUNLU','A few things, growing carefully.':'Algunos proyectos que crecen con cuidado.','Early Beta':'Beta inicial','Latest · 4 articles':'Últimos · 4 artículos','LAB 001 · Question defined':'LAB 001 · Pregunta definida','HEALTH 001 + VIEW 002':'HEALTH 001 + VIEW 002','Important research, understood carefully.':'Investigación importante, comprendida con cuidado.','Independent, carefully sourced introductions to ideas that may reshape how we understand technology, medicine, and the world.':'Introducciones independientes y cuidadosamente documentadas a ideas que pueden transformar nuestra comprensión de la tecnología, la medicina y el mundo.','Read the latest selection →':'Leer la selección más reciente →',
      'A quiet place for humans and AI to think together.':'Un lugar tranquilo donde humanos e IA piensan juntos.','Thoughtful conversations about AI, making, systems, and the human questions around them. AI does not speak by default — it joins only when invited.':'Conversaciones reflexivas sobre la IA, la creación, los sistemas y las cuestiones humanas que los rodean. La IA no habla por defecto — solo participa cuando es invitada.','Enter RUNLU Forum':'Entrar al foro RUNLU','About RUNLU':'Acerca de RUNLU','A nourishing abode.':'Un refugio que nutre.','RUNLU is a nourishing abode. A place shaped by patience, where growth is allowed to rise from within.':'RUNLU es un refugio que nutre. Un lugar moldeado por la paciencia, donde el crecimiento puede surgir desde dentro.','RUNLU Notes':'Notas RUNLU','Quiet notes on making, systems, space, and time.':'Notas serenas sobre la creación, los sistemas, el espacio y el tiempo.','Not a news feed. A place for occasional thoughts that are worth keeping.':'No es un canal de noticias. Es un lugar para conservar, de vez en cuando, pensamientos que merecen permanecer.','Read RUNLU Notes →':'Leer las Notas RUNLU →','Contact & Support':'Contacto y soporte','Built quietly. Made to endure.':'Creado en silencio. Hecho para perdurar.','RUNLU is growing one thoughtful project at a time.':'RUNLU crece, un proyecto cuidadoso a la vez.','Leave a Note':'Dejar un mensaje','Support':'Soporte','Privacy':'Privacidad','Pulse ↗':'Pulse ↗'
    }
  };
  const LEGACY_KEYS=['runlu-view-language','runlu-lab-language','runlu-health-language','runlu_forum_lang'];
  function isKnown(value){return ALL.includes(value)}
  function isAvailable(value){return AVAILABLE.includes(value)}
  function normalise(value){return isAvailable(value)?value:FALLBACK}
  function pageAllows(language){
    const selects=[...document.querySelectorAll('[data-runlu-language-select]')];
    if(!selects.length)return true;
    return selects.some(select=>[...select.options].some(option=>option.value===language&&!option.disabled))
  }
  function savedLanguage(){
    const current=localStorage.getItem(KEY);
    if(current)return normalise(current);
    for(const key of LEGACY_KEYS){
      const legacy=localStorage.getItem(key);
      if(legacy){const migrated=normalise(legacy);localStorage.setItem(KEY,migrated);return migrated}
    }
    return FALLBACK
  }
  let current=savedLanguage();
  function apply(language,{announce=false}={}){
    current=normalise(language);
    if(!pageAllows(current))current=FALLBACK;
    const HTML_LANG={en:'en',zh:'zh-CN',fr:'fr',es:'es'};
    document.documentElement.lang=HTML_LANG[current]||HTML_LANG[FALLBACK];
    document.documentElement.dataset.runluLanguage=current;
    document.querySelectorAll('[data-en]').forEach(element=>{
      const translated=element.dataset[current]??CATALOG[current]?.[element.dataset.en];
      if(typeof translated==='string')element.textContent=translated;
      else if(typeof element.dataset[FALLBACK]==='string')element.textContent=element.dataset[FALLBACK]
    });
    document.querySelectorAll('[data-runlu-language-select]').forEach(select=>{
      select.value=current;
      const labels={en:'Choose site language',zh:'选择网站语言',fr:'Choisir la langue du site',es:'Elegir el idioma del sitio'};
      select.setAttribute('aria-label',labels[current]||labels.en)
    });
    document.querySelectorAll('[data-runlu-language-toggle],#languageToggle:not(select),#viewLanguage:not(select),#labLanguage:not(select),#healthLanguage:not(select),#forumLang:not(select)').forEach(button=>{
      button.textContent=current==='en'?'中文':'EN';
      button.setAttribute('aria-label',current==='en'?'Switch to Chinese':'Switch to English');
      button.setAttribute('aria-pressed',String(current==='zh'))
    });
    if(announce)window.dispatchEvent(new CustomEvent('runlu:languagechange',{detail:{language:current}}))
  }
  function set(language){
    if(!isKnown(language))language=FALLBACK;
    if(!isAvailable(language)){
      const requested=language;language=FALLBACK;
      window.dispatchEvent(new CustomEvent('runlu:translationmissing',{detail:{requested,fallback:FALLBACK}}))
    }
    current=language;localStorage.setItem(KEY,current);apply(current,{announce:true})
  }
  function toggle(){set(current==='en'?'zh':'en')}
  function bind(){
    document.querySelectorAll('[data-runlu-language-select]').forEach(select=>{
      if(select.dataset.runluLanguageBound==='true')return;
      select.dataset.runluLanguageBound='true';
      select.addEventListener('change',()=>set(select.value))
    });
    const legacySelector='[data-runlu-language-toggle],#languageToggle:not(select),#viewLanguage:not(select),#labLanguage:not(select),#healthLanguage:not(select),#forumLang:not(select)';
    document.querySelectorAll(legacySelector).forEach(button=>{
      if(button.dataset.runluLanguageBound==='true')return;
      button.dataset.runluLanguageBound='true';
      button.addEventListener('click',toggle)
    });
    apply(current)
  }
  window.RUNLULanguage={key:KEY,available:[...AVAILABLE],planned:[...PLANNED],fallback:FALLBACK,get:()=>current,set,toggle,apply,isAvailable};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind()
})();
