(()=>{
  function sync(){
    const lang=document.documentElement.dataset.runluLanguage||'en';
    document.querySelectorAll('[data-book-lang]').forEach(el=>{el.hidden=el.dataset.bookLang!==lang});
  }
  sync();
  window.addEventListener('runlu:languagechange',sync);
})();
