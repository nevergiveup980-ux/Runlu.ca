(()=>{
  const KEY='runlu_site_language';
  const SUPPORTED=['en','zh'];
  const LEGACY_KEYS=['runlu-view-language','runlu-lab-language','runlu-health-language','runlu_forum_lang'];

  function normalise(value){return SUPPORTED.includes(value)?value:'en'}
  function savedLanguage(){
    const current=localStorage.getItem(KEY);
    if(current)return normalise(current);
    for(const key of LEGACY_KEYS){
      const legacy=localStorage.getItem(key);
      if(legacy){localStorage.setItem(KEY,normalise(legacy));return normalise(legacy)}
    }
    return 'en'
  }

  let current=savedLanguage();

  function apply(language,{announce=false}={}){
    current=normalise(language);
    document.documentElement.lang=current==='zh'?'zh-CN':'en';
    document.querySelectorAll('[data-en][data-zh]').forEach(element=>{
      element.textContent=element.dataset[current];
    });
    document.querySelectorAll('[data-runlu-language-toggle],#languageToggle,#viewLanguage,#labLanguage,#healthLanguage,#forumLang').forEach(button=>{
      button.textContent=current==='en'?'中文':'EN';
      button.setAttribute('aria-label',current==='en'?'Switch to Chinese':'Switch to English');
      button.setAttribute('aria-pressed',String(current==='zh'));
    });
    if(announce)window.dispatchEvent(new CustomEvent('runlu:languagechange',{detail:{language:current}}));
  }

  function set(language){
    current=normalise(language);
    localStorage.setItem(KEY,current);
    apply(current,{announce:true});
  }

  function toggle(){set(current==='en'?'zh':'en')}

  function bind(){
    const selector='[data-runlu-language-toggle],#languageToggle,#viewLanguage,#labLanguage,#healthLanguage,#forumLang';
    document.querySelectorAll(selector).forEach(button=>{
      if(button.dataset.runluLanguageBound==='true')return;
      button.dataset.runluLanguageBound='true';
      button.addEventListener('click',toggle);
    });
    apply(current);
  }

  window.RUNLULanguage={key:KEY,supported:[...SUPPORTED],get:()=>current,set,toggle,apply};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
  else bind();
})();