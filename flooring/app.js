/* RUNLU Deerfoot Flooring OS · Core Runtime Bridge V0.3.13
   Loads the fresh core runtime from a new asset path to bypass stale/corrupt CDN responses on the legacy app.js URL. */
(function(){
  'use strict';
  if(window.__runluCoreBridge0313)return;
  window.__runluCoreBridge0313=true;
  document.write('<script src="app-core-v0313.js?v=001"><\/script>');
})();
