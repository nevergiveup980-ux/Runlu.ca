/* Localized presentation only: never changes licensing or inventory state. */
(function(){
'use strict';
const messages={
  "Pilot error": [
    "Pilot error",
    "试验页错误",
    "Erreur du pilote",
    "Error del piloto"
  ],
  "Supabase library did not load. Refresh once.": [
    "Supabase library did not load. Refresh once.",
    "Supabase 组件未加载，请刷新一次。",
    "La bibliothèque Supabase ne s’est pas chargée. Actualisez la page.",
    "No se cargó la biblioteca Supabase. Actualiza la página."
  ],
  "Activated · offline-ready": [
    "Activated · offline-ready",
    "已激活 · 可离线使用",
    "Activé · disponible hors ligne",
    "Activado · disponible sin conexión"
  ],
  "Local activation receipt found for {code}.": [
    "Local activation receipt found for {code}.",
    "已找到 {code} 的本地激活凭据。",
    "Reçu d’activation local trouvé pour {code}.",
    "Se encontró el recibo de activación local de {code}."
  ],
  "Offline grace · local activation receipt accepted.": [
    "Offline grace · local activation receipt accepted.",
    "离线宽限期 · 已接受本地激活凭据。",
    "Délai de grâce hors ligne · reçu d’activation local accepté.",
    "Período de gracia sin conexión · recibo local aceptado."
  ],
  "License verified online · offline-ready.": [
    "License verified online · offline-ready.",
    "许可证已在线验证 · 可离线使用。",
    "Licence vérifiée en ligne · disponible hors ligne.",
    "Licencia verificada en línea · disponible sin conexión."
  ],
  "Activation released": [
    "Activation released",
    "激活已解除",
    "Activation libérée",
    "Activación liberada"
  ],
  "This activation was released from RUNLU Account. Activate again if a slot is available.": [
    "This activation was released from RUNLU Account. Activate again if a slot is available.",
    "此激活已从 RUNLU 账户解除。如有可用名额，请重新激活。",
    "Cette activation a été libérée depuis RUNLU Account. Réactivez si une place est disponible.",
    "Esta activación se liberó desde RUNLU Account. Activa de nuevo si hay una plaza disponible."
  ],
  "Verification unavailable · using local offline receipt.": [
    "Verification unavailable · using local offline receipt.",
    "暂时无法验证 · 使用本地离线凭据。",
    "Vérification indisponible · utilisation du reçu local hors ligne.",
    "Verificación no disponible · se usa el recibo local sin conexión."
  ],
  "Sign in required": [
    "Sign in required",
    "需要登录",
    "Connexion requise",
    "Debes iniciar sesión"
  ],
  "Sign in to ": [
    "Sign in to ",
    "请登录 ",
    "Connectez-vous à ",
    "Inicia sesión en "
  ],
  ", then return here and refresh.": [
    ", then return here and refresh.",
    "，然后返回此页并刷新。",
    ", puis revenez ici et actualisez la page.",
    ", luego vuelve aquí y actualiza la página."
  ],
  "Ready to activate": [
    "Ready to activate",
    "可以激活",
    "Prêt à activer",
    "Listo para activar"
  ],
  "Account session found. Tap the button once.": [
    "Account session found. Tap the button once.",
    "已检测到账户会话，请点击一次按钮。",
    "Session du compte trouvée. Appuyez une fois sur le bouton.",
    "Se encontró la sesión de la cuenta. Pulsa el botón una vez."
  ],
  "Session check failed: {error}": [
    "Session check failed: {error}",
    "会话检查失败：{error}",
    "Échec de vérification de la session : {error}",
    "Falló la comprobación de sesión: {error}"
  ],
  "Activating…": [
    "Activating…",
    "正在激活…",
    "Activation en cours…",
    "Activando…"
  ],
  "Contacting RUNLU License…": [
    "Contacting RUNLU License…",
    "正在连接 RUNLU 许可服务…",
    "Connexion à RUNLU License…",
    "Contactando con RUNLU License…"
  ],
  "Sign in to RUNLU Account first.": [
    "Sign in to RUNLU Account first.",
    "请先登录 RUNLU 账户。",
    "Connectez-vous d’abord à RUNLU Account.",
    "Inicia sesión primero en RUNLU Account."
  ],
  "Activation failed": [
    "Activation failed",
    "激活失败",
    "Échec de l’activation",
    "Error de activación"
  ],
  "Error details: {error}": [
    "Error details: {error}",
    "错误详情：{error}",
    "Détails de l’erreur : {error}",
    "Detalles del error: {error}"
  ],
  "Unnamed roll": [
    "Unnamed roll",
    "未命名卷材",
    "Rouleau sans nom",
    "Rollo sin nombre"
  ],
  "{total} total · {active} active · {shown} shown": [
    "{total} total · {active} active · {shown} shown",
    "共 {total} 卷 · {active} 卷在用 · 显示 {shown} 卷",
    "{total} au total · {active} actifs · {shown} affichés",
    "{total} en total · {active} activos · {shown} mostrados"
  ],
  "✓ Same-source count check passed": [
    "✓ Same-source count check passed",
    "✓ 同源数量检查通过",
    "✓ Vérification des comptes de même source réussie",
    "✓ Comprobación de recuentos de la misma fuente correcta"
  ],
  "✕ Count mismatch": [
    "✕ Count mismatch",
    "✕ 数量不一致",
    "✕ Les comptes diffèrent",
    "✕ Los recuentos no coinciden"
  ],
  "Cloud error": [
    "Cloud error",
    "云端错误",
    "Erreur du cloud",
    "Error de la nube"
  ],
  "Search roll, product, color, location…": [
    "Search roll, product, color, location…",
    "搜索卷材、产品、颜色、位置…",
    "Rechercher rouleau, produit, couleur, emplacement…",
    "Buscar rollo, producto, color, ubicación…"
  ],
  "Not loaded": [
    "Not loaded",
    "尚未加载",
    "Non chargé",
    "Sin cargar"
  ],
  "Cloud inventory": [
    "Cloud inventory",
    "云端库存",
    "Stock du cloud",
    "Inventario de la nube"
  ],
  "Data provider": [
    "Data provider",
    "数据源",
    "Source de données",
    "Fuente de datos"
  ]
};
const languages=['en','zh','fr','es'];
function language(){return window.RUNLULanguage?window.RUNLULanguage.get():'en'}
function variants(key,params={}){return (messages[key]||[key,key,key,key]).map(text=>text.replace(/\{(\w+)\}/g,(whole,name)=>Object.prototype.hasOwnProperty.call(params,name)?String(params[name]):whole))}
function text(key,params){return variants(key,params)[Math.max(0,languages.indexOf(language()))]}
function set(el,key,params){const values=variants(key,params);languages.forEach((lang,i)=>el.setAttribute('data-'+lang,values[i]));el.textContent=values[Math.max(0,languages.indexOf(language()))]}
window.RUNLUToolMessages={text,set};
})();
