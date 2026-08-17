(()=>{
  const KEY='runlu_site_language';
  const AVAILABLE=['en','zh'];
  const PLANNED=['fr','es'];
  const ALL=[...AVAILABLE,...PLANNED];
  const FALLBACK='en';
  const LEGACY_KEYS=['runlu-view-language','runlu-lab-language','runlu-health-language','runlu_forum_lang'];
  function isKnown(value){return ALL.includes(value)}
  function isAvailable(value){return AVAILABLE.includes(value)}
  function normalise(value){return isAvailable(value)?value:FALLBACK}
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
    document.documentElement.lang=current==='zh'?'zh-CN':'en';
    document.documentElement.dataset.runluLanguage=current;
    document.querySelectorAll('[data-en]').forEach(element=>{
      const translated=element.dataset[current];
      if(typeof translated==='string')element.textContent=translated;
      else if(typeof element.dataset[FALLBACK]==='string')element.textContent=element.dataset[FALLBACK]
    });
    document.querySelectorAll('[data-runlu-language-select]').forEach(select=>{
      select.value=current;
      select.setAttribute('aria-label',current==='zh'?'选择网站语言':'Choose site language')
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