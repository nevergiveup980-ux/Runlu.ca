(()=>{
'use strict';

const SUPABASE_URL='https://ekrnknlawekeoszzkamd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});

const $=id=>document.getElementById(id);
const els={
  authSection:$('authSection'),privateZone:$('privateZone'),authEmail:$('authEmail'),authPassword:$('authPassword'),
  signInBtn:$('signInBtn'),signUpBtn:$('signUpBtn'),signOutBtn:$('signOutBtn'),authMessage:$('authMessage'),
  accountEmail:$('accountEmail'),exportBtn:$('exportBtn'),searchInput:$('searchInput'),categoryFilter:$('categoryFilter'),
  maintenanceFilter:$('maintenanceFilter'),addAssetBtn:$('addAssetBtn'),assetRows:$('assetRows'),emptyState:$('emptyState'),
  statTotal:$('statTotal'),statPublished:$('statPublished'),statCost:$('statCost'),statRevenue:$('statRevenue'),
  modal:$('assetModal'),closeModalBtn:$('closeModalBtn'),cancelModalBtn:$('cancelModalBtn'),saveAssetBtn:$('saveAssetBtn'),
  deleteAssetBtn:$('deleteAssetBtn'),modalMessage:$('modalMessage'),assetForm:$('assetForm'),assetId:$('assetId'),assetKey:$('assetKey'),
  assetName:$('assetName'),assetCategory:$('assetCategory'),assetStatus:$('assetStatus'),assetPlatform:$('assetPlatform'),
  assetVersion:$('assetVersion'),assetUrl:$('assetUrl'),releaseDate:$('releaseDate'),renewalDate:$('renewalDate'),
  assetOwnership:$('assetOwnership'),maintenanceState:$('maintenanceState'),masterLocation:$('masterLocation'),
  costCad:$('costCad'),revenueCad:$('revenueCad'),assetNotes:$('assetNotes')
};

let currentUser=null;
let assets=[];

const STARTER_ASSETS=[
  {asset_key:'runlu-brand',name:'RUNLU · 润庐',category:'brand',status:'active',platform:'RUNLU',url:'https://runlu.ca/',maintenance_state:'maintain',ownership:'Personal / RUNLU brand'},
  {asset_key:'runlu-ca',name:'runlu.ca',category:'domain',status:'active',platform:'Web',url:'https://runlu.ca/',maintenance_state:'maintain',ownership:'Personal / RUNLU brand'},
  {asset_key:'universal-invoice',name:'RUNLU Universal Invoice',category:'software',status:'published',platform:'iOS · App Store',url:'https://runlu.ca/invoice.html',version:'1.0',maintenance_state:'maintain',ownership:'Personal / RUNLU brand'},
  {asset_key:'warehouse-os',name:'Warehouse OS',category:'software',status:'active',platform:'Web · Cloud',url:'https://runlu.ca/warehouse.html',maintenance_state:'maintain',ownership:'Personal / RUNLU brand'},
  {asset_key:'flooring-business-os',name:'Flooring Business OS',category:'software',status:'development',platform:'Web · Cloud',url:'https://runlu.ca/flooring-business-os.html',maintenance_state:'maintain',ownership:'Personal / RUNLU brand'},
  {asset_key:'lingguang-health-os',name:'LINGGUANG Health OS',category:'software',status:'development',platform:'Web · Cloud',url:'https://runlu.ca/lingguang-health-os.html',maintenance_state:'maintain',ownership:'Personal / RUNLU brand'},
  {asset_key:'life-ledger',name:'RUNLU Life Ledger',category:'software',status:'private',platform:'Private app',url:'https://runlu.ca/life-ledger.html',maintenance_state:'maintain',ownership:'Personal / RUNLU brand'},
  {asset_key:'market-companion',name:'RUNLU Market Companion',category:'software',status:'development',platform:'Private / Research',url:'https://runlu.ca/market-companion.html',maintenance_state:'watch',ownership:'Personal / RUNLU brand'},
  {asset_key:'wind-beyond-walls',name:'The Wind Beyond the Walls · 《庐外有风》',category:'publishing',status:'published',platform:'Apple Books · RUNLU web',url:'https://runlu.ca/book/',maintenance_state:'maintain',ownership:'Personal / RUNLU Original'},
  {asset_key:'last-person-to-leave',name:'The Last Person to Leave Work · 《最后一个下班的人》',category:'publishing',status:'active',platform:'RUNLU Stories',url:'https://runlu.ca/notes.html',maintenance_state:'maintain',ownership:'Personal / RUNLU Original'},
  {asset_key:'warmth-in-night',name:'Warmth in the Night · 《夜色有温度》',category:'publishing',status:'active',platform:'RUNLU Stories',url:'https://runlu.ca/notes.html',maintenance_state:'maintain',ownership:'Personal / RUNLU Original'},
  {asset_key:'runlu-stories',name:'RUNLU Stories',category:'content',status:'active',platform:'runlu.ca',url:'https://runlu.ca/notes.html',maintenance_state:'maintain',ownership:'Personal / RUNLU brand'},
  {asset_key:'runlu-view',name:'RUNLU VIEW',category:'content',status:'active',platform:'runlu.ca',url:'https://runlu.ca/frontiers.html',maintenance_state:'maintain',ownership:'Personal / RUNLU brand'},
  {asset_key:'runlu-health',name:'RUNLU HEALTH',category:'content',status:'active',platform:'runlu.ca',url:'https://runlu.ca/health.html',maintenance_state:'maintain',ownership:'Personal / RUNLU brand'},
  {asset_key:'runlu-lab',name:'RUNLU LAB',category:'content',status:'active',platform:'runlu.ca',url:'https://runlu.ca/lab.html',maintenance_state:'watch',ownership:'Personal / RUNLU brand'},
  {asset_key:'apple-app-store-channel',name:'Apple App Store distribution',category:'distribution',status:'active',platform:'Apple',maintenance_state:'maintain',ownership:'Account access / RUNLU distribution'},
  {asset_key:'apple-books-channel',name:'Apple Books distribution',category:'distribution',status:'active',platform:'Apple',maintenance_state:'maintain',ownership:'Account access / RUNLU distribution'},
  {asset_key:'four-language-framework',name:'RUNLU Four-language Publishing Framework',category:'design',status:'active',platform:'EN · 中文 · FR · ES',maintenance_state:'maintain',ownership:'Personal / RUNLU reusable capital'}
];

const I18N={
  en:{allCategories:'All categories',search:'Search assets',edit:'Edit',none:'—',active:'Active',published:'Published',development:'In development',private:'Private use',planned:'Planned',archived:'Archived',brand:'Brand',domain:'Domain / Web',software:'Software',publishing:'Publishing',content:'Content / Knowledge',distribution:'Distribution',infrastructure:'Infrastructure',design:'Design / Reusable capital',other:'Other',signedOut:'Signed out.',signedIn:'Signed in.',accountCreated:'Account created. If email confirmation is enabled, confirm the email before signing in.',deleteConfirm:'Delete this asset record? This cannot be undone.',saveError:'Could not save the asset.',deleteError:'Could not delete the asset.',loadError:'Could not load the private ledger.',seedError:'The ledger opened, but starter assets could not be initialized.',saved:'Saved.',deleted:'Deleted.'},
  zh:{allCategories:'全部类别',search:'搜索资产',edit:'编辑',none:'—',active:'运行中',published:'已发布',development:'开发中',private:'私人使用',planned:'计划中',archived:'已归档',brand:'品牌',domain:'域名 / 网站',software:'软件',publishing:'出版',content:'内容 / 知识',distribution:'分发',infrastructure:'基础设施',design:'设计 / 可复用资本',other:'其他',signedOut:'已退出登录。',signedIn:'登录成功。',accountCreated:'账户已创建。如果开启了邮箱确认，请先确认邮件后再登录。',deleteConfirm:'确定删除这条资产记录吗？删除后不能撤销。',saveError:'资产保存失败。',deleteError:'资产删除失败。',loadError:'私人资产总账加载失败。',seedError:'总账已打开，但初始资产未能自动建立。',saved:'已保存。',deleted:'已删除。'},
  fr:{allCategories:'Toutes les catégories',search:'Rechercher des actifs',edit:'Modifier',none:'—',active:'Actif',published:'Publié',development:'En développement',private:'Usage privé',planned:'Prévu',archived:'Archivé',brand:'Marque',domain:'Domaine / Web',software:'Logiciel',publishing:'Édition',content:'Contenu / Savoir',distribution:'Distribution',infrastructure:'Infrastructure',design:'Design / Capital réutilisable',other:'Autre',signedOut:'Déconnecté.',signedIn:'Connexion réussie.',accountCreated:'Compte créé. Si la confirmation e-mail est activée, confirmez l’adresse avant de vous connecter.',deleteConfirm:'Supprimer cette fiche d’actif ? Cette action est irréversible.',saveError:'Impossible d’enregistrer l’actif.',deleteError:'Impossible de supprimer l’actif.',loadError:'Impossible de charger le registre privé.',seedError:'Le registre est ouvert, mais les actifs initiaux n’ont pas pu être créés.',saved:'Enregistré.',deleted:'Supprimé.'},
  es:{allCategories:'Todas las categorías',search:'Buscar activos',edit:'Editar',none:'—',active:'Activo',published:'Publicado',development:'En desarrollo',private:'Uso privado',planned:'Planificado',archived:'Archivado',brand:'Marca',domain:'Dominio / Web',software:'Software',publishing:'Publicación',content:'Contenido / Conocimiento',distribution:'Distribución',infrastructure:'Infraestructura',design:'Diseño / Capital reutilizable',other:'Otro',signedOut:'Sesión cerrada.',signedIn:'Sesión iniciada.',accountCreated:'Cuenta creada. Si la confirmación por correo está activada, confirme el correo antes de iniciar sesión.',deleteConfirm:'¿Eliminar este registro de activo? No se puede deshacer.',saveError:'No se pudo guardar el activo.',deleteError:'No se pudo eliminar el activo.',loadError:'No se pudo cargar el registro privado.',seedError:'El registro se abrió, pero no se pudieron crear los activos iniciales.',saved:'Guardado.',deleted:'Eliminado.'}
};

function lang(){return document.documentElement.dataset.runluLanguage||'en'}
function t(key){return I18N[lang()]?.[key]||I18N.en[key]||key}
function money(v){const n=Number(v||0);return new Intl.NumberFormat(lang()==='zh'?'zh-CN':lang(),{style:'currency',currency:'CAD',maximumFractionDigits:2}).format(n)}
function txt(v){return v==null||v===''?t('none'):String(v)}
function statusClass(status){return status==='development'?'dev':status==='private'?'private':''}
function safeUrl(url){try{const u=new URL(url);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}
function slug(value){return String(value||'asset').toLowerCase().trim().replace(/[^a-z0-9\u4e00-\u9fff]+/g,'-').replace(/^-+|-+$/g,'').slice(0,50)||'asset'}
function setMessage(el,message,error=false){el.textContent=message||'';el.style.color=error?'#9b3f32':'#47644f'}
function setBusy(button,busy){button.disabled=busy}

async function signIn(){
  const email=els.authEmail.value.trim(),password=els.authPassword.value;
  if(!email||!password)return setMessage(els.authMessage,'Email and password are required.',true);
  setBusy(els.signInBtn,true);setMessage(els.authMessage,'');
  const {error}=await db.auth.signInWithPassword({email,password});
  setBusy(els.signInBtn,false);
  if(error)return setMessage(els.authMessage,error.message,true);
  setMessage(els.authMessage,t('signedIn'));
}

async function signUp(){
  const email=els.authEmail.value.trim(),password=els.authPassword.value;
  if(!email||password.length<8)return setMessage(els.authMessage,'Use a valid email and a password of at least 8 characters.',true);
  setBusy(els.signUpBtn,true);setMessage(els.authMessage,'');
  const {data,error}=await db.auth.signUp({email,password,options:{emailRedirectTo:'https://runlu.ca/asset-ledger.html'}});
  setBusy(els.signUpBtn,false);
  if(error)return setMessage(els.authMessage,error.message,true);
  setMessage(els.authMessage,data.session?t('signedIn'):t('accountCreated'));
}

async function signOut(){await db.auth.signOut();setMessage(els.authMessage,t('signedOut'))}

async function loadAssets({seed=true}={}){
  if(!currentUser)return;
  const {data,error}=await db.from('runlu_asset_ledger').select('*').order('name',{ascending:true});
  if(error){setMessage(els.authMessage,t('loadError')+' '+error.message,true);return}
  assets=data||[];
  if(seed&&assets.length===0){
    const {error:seedErr}=await db.from('runlu_asset_ledger').insert(STARTER_ASSETS);
    if(seedErr){setMessage(els.authMessage,t('seedError')+' '+seedErr.message,true)}
    else return loadAssets({seed:false});
  }
  refreshCategoryFilter();render();
}

function refreshCategoryFilter(){
  const selected=els.categoryFilter.value;
  const cats=[...new Set(assets.map(a=>a.category).filter(Boolean))].sort();
  els.categoryFilter.innerHTML='';
  const all=document.createElement('option');all.value='';all.textContent=t('allCategories');els.categoryFilter.appendChild(all);
  cats.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=t(c)||c;els.categoryFilter.appendChild(o)});
  if(cats.includes(selected))els.categoryFilter.value=selected;
  els.searchInput.placeholder=t('search');
}

function filteredAssets(){
  const q=els.searchInput.value.trim().toLowerCase(),cat=els.categoryFilter.value,maint=els.maintenanceFilter.value;
  return assets.filter(a=>{
    const hay=[a.name,a.category,a.status,a.platform,a.version,a.ownership,a.master_location,a.notes].filter(Boolean).join(' ').toLowerCase();
    return (!q||hay.includes(q))&&(!cat||a.category===cat)&&(!maint||a.maintenance_state===maint);
  });
}

function render(){
  const rows=filteredAssets();
  els.assetRows.innerHTML='';
  rows.forEach(asset=>{
    const tr=document.createElement('tr');
    const tdName=document.createElement('td');
    const name=document.createElement('strong');name.textContent=asset.name;tdName.appendChild(name);
    const url=safeUrl(asset.url);if(url){const br=document.createElement('br');const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.textContent='↗';a.style.color='#2f6f45';tdName.append(br,a)}
    const tdCat=document.createElement('td');tdCat.textContent=t(asset.category)||asset.category;
    const tdStatus=document.createElement('td');const pill=document.createElement('span');pill.className='pill '+statusClass(asset.status);pill.textContent=t(asset.status)||asset.status;tdStatus.appendChild(pill);
    const tdVp=document.createElement('td');tdVp.textContent=[asset.version,asset.platform].filter(Boolean).join(' · ')||t('none');
    const tdRenew=document.createElement('td');tdRenew.textContent=txt(asset.renewal_date);
    const tdCost=document.createElement('td');tdCost.className='money';tdCost.textContent=asset.cost_cad==null?t('none'):money(asset.cost_cad);
    const tdRev=document.createElement('td');tdRev.className='money';tdRev.textContent=asset.revenue_cad==null?t('none'):money(asset.revenue_cad);
    const tdActions=document.createElement('td');const edit=document.createElement('button');edit.className='row-link';edit.type='button';edit.textContent=t('edit');edit.addEventListener('click',()=>openModal(asset));tdActions.appendChild(edit);
    tr.append(tdName,tdCat,tdStatus,tdVp,tdRenew,tdCost,tdRev,tdActions);els.assetRows.appendChild(tr);
  });
  els.emptyState.classList.toggle('hidden',rows.length>0);
  els.statTotal.textContent=assets.length;
  els.statPublished.textContent=assets.filter(a=>['published','active'].includes(a.status)).length;
  els.statCost.textContent=money(assets.reduce((s,a)=>s+Number(a.cost_cad||0),0));
  els.statRevenue.textContent=money(assets.reduce((s,a)=>s+Number(a.revenue_cad||0),0));
}

function openModal(asset=null){
  els.assetForm.reset();setMessage(els.modalMessage,'');
  els.assetId.value=asset?.id||'';els.assetKey.value=asset?.asset_key||'';
  els.assetName.value=asset?.name||'';els.assetCategory.value=asset?.category||'software';els.assetStatus.value=asset?.status||'active';
  els.assetPlatform.value=asset?.platform||'';els.assetVersion.value=asset?.version||'';els.assetUrl.value=asset?.url||'';
  els.releaseDate.value=asset?.release_date||'';els.renewalDate.value=asset?.renewal_date||'';els.assetOwnership.value=asset?.ownership||'';
  els.maintenanceState.value=asset?.maintenance_state||'maintain';els.masterLocation.value=asset?.master_location||'';
  els.costCad.value=asset?.cost_cad??'';els.revenueCad.value=asset?.revenue_cad??'';els.assetNotes.value=asset?.notes||'';
  els.deleteAssetBtn.classList.toggle('hidden',!asset?.id);els.modal.classList.remove('hidden');setTimeout(()=>els.assetName.focus(),40);
}
function closeModal(){els.modal.classList.add('hidden')}

function recordFromForm(){
  const name=els.assetName.value.trim();
  return {
    asset_key:els.assetKey.value||`${slug(name)}-${Date.now()}`,
    name,
    category:els.assetCategory.value,
    status:els.assetStatus.value,
    platform:els.assetPlatform.value.trim()||null,
    url:els.assetUrl.value.trim()||null,
    version:els.assetVersion.value.trim()||null,
    release_date:els.releaseDate.value||null,
    renewal_date:els.renewalDate.value||null,
    ownership:els.assetOwnership.value.trim()||null,
    master_location:els.masterLocation.value.trim()||null,
    maintenance_state:els.maintenanceState.value,
    cost_cad:els.costCad.value===''?null:Number(els.costCad.value),
    revenue_cad:els.revenueCad.value===''?null:Number(els.revenueCad.value),
    notes:els.assetNotes.value.trim()||null
  };
}

async function saveAsset(){
  if(!els.assetForm.reportValidity())return;
  const payload=recordFromForm();setBusy(els.saveAssetBtn,true);setMessage(els.modalMessage,'');
  let error;
  if(els.assetId.value){({error}=await db.from('runlu_asset_ledger').update(payload).eq('id',els.assetId.value));}
  else{({error}=await db.from('runlu_asset_ledger').insert(payload));}
  setBusy(els.saveAssetBtn,false);
  if(error)return setMessage(els.modalMessage,t('saveError')+' '+error.message,true);
  setMessage(els.modalMessage,t('saved'));await loadAssets({seed:false});setTimeout(closeModal,250);
}

async function deleteAsset(){
  const id=els.assetId.value;if(!id)return;if(!window.confirm(t('deleteConfirm')))return;
  setBusy(els.deleteAssetBtn,true);const {error}=await db.from('runlu_asset_ledger').delete().eq('id',id);setBusy(els.deleteAssetBtn,false);
  if(error)return setMessage(els.modalMessage,t('deleteError')+' '+error.message,true);
  await loadAssets({seed:false});closeModal();
}

function exportJson(){
  const payload={exported_at:new Date().toISOString(),format:'runlu-asset-ledger-v1',assets};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`runlu-asset-ledger-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}

function applySession(session){
  currentUser=session?.user||null;
  els.authSection.classList.toggle('hidden',!!currentUser);els.privateZone.classList.toggle('hidden',!currentUser);
  if(currentUser){els.accountEmail.textContent=currentUser.email||'';loadAssets();}else{assets=[];render();}
}

els.signInBtn.addEventListener('click',signIn);els.signUpBtn.addEventListener('click',signUp);els.signOutBtn.addEventListener('click',signOut);
els.authPassword.addEventListener('keydown',e=>{if(e.key==='Enter')signIn()});
els.searchInput.addEventListener('input',render);els.categoryFilter.addEventListener('change',render);els.maintenanceFilter.addEventListener('change',render);
els.addAssetBtn.addEventListener('click',()=>openModal());els.closeModalBtn.addEventListener('click',closeModal);els.cancelModalBtn.addEventListener('click',closeModal);
els.saveAssetBtn.addEventListener('click',saveAsset);els.deleteAssetBtn.addEventListener('click',deleteAsset);els.exportBtn.addEventListener('click',exportJson);
els.modal.addEventListener('click',e=>{if(e.target===els.modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!els.modal.classList.contains('hidden'))closeModal()});
window.addEventListener('runlu:languagechange',()=>{refreshCategoryFilter();render()});

db.auth.onAuthStateChange((_event,session)=>applySession(session));
db.auth.getSession().then(({data})=>applySession(data.session));
})();