/* ============================================================
   BACKEND CONFIG
   ============================================================ */
let SUPABASE_URL = 'https://bgnykjzxnknyvefytnjj.supabase.co'.trim();
let SUPABASE_ANON_KEY = 'sb_publishable_VSzgwX0q4NsjFezuua_dCQ_Br1bE9EE'.trim();
let BACKEND_CONFIGURED = false;

let supabaseClient = null;
let SUPABASE_LOAD_ERROR = null;
let allProducts = [];
let allLeads = [];
let allOffers = [];
let editingPhotoFile = null;
let editingOfferPhotoFile = null;
let currentSession = null;
let currentUserRole = 'staff';
let authSubscription = null;

window.addEventListener('error', (event)=>{
  console.error('Unhandled script error:', event.error || event.message);
  if(document.getElementById('toastWrap')){
    showToast('err', 'A page error occurred. Please refresh.');
  }
});

window.addEventListener('unhandledrejection', (event)=>{
  console.error('Unhandled async error:', event.reason);
  if(document.getElementById('toastWrap')){
    showToast('err', 'A background request failed. Please retry.');
  }
});

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000){
  const controller = new AbortController();
  const timeout = setTimeout(()=> controller.abort(), timeoutMs);
  try{
    return await fetch(url, { ...options, signal: controller.signal });
  }finally{
    clearTimeout(timeout);
  }
}

const state = {
  products:{ page:1, pageSize:8, search:'', availability:'', sort:'created_desc', colSort:{col:'',dir:1} },
  offers:{ page:1, pageSize:8, search:'', active:'', sort:'sort_asc' },
  leads:{ page:1, pageSize:8, search:'', source:'', sort:'date_desc' }
};

function recomputeBackendConfigured(){
  const isSupabaseUrlValid = /^https:\/\/bgnykjzxnknyvefytnjj\.supabase\.co$/i.test(SUPABASE_URL);
  const isSupabaseKeyValid =
    !!SUPABASE_ANON_KEY &&
    !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY') &&
    !/service_role|secret|password/i.test(SUPABASE_ANON_KEY) &&
    (SUPABASE_ANON_KEY.startsWith('sb_publishable_') || SUPABASE_ANON_KEY.startsWith('eyJ'));
  BACKEND_CONFIGURED = isSupabaseUrlValid && isSupabaseKeyValid;
}

function initSupabaseClient(){
  recomputeBackendConfigured();
  supabaseClient = null;
  SUPABASE_LOAD_ERROR = null;
  if(!BACKEND_CONFIGURED) return;
  try{
    if(!window.supabase) throw new Error('Supabase library did not load. Check connection and reload.');
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }catch(err){
    SUPABASE_LOAD_ERROR = err.message;
  }
}

async function loadRuntimeConfig(){
  try{
    const res = await fetchWithTimeout('admin-config.json', { cache:'no-store' }, 8000);
    if(!res.ok) return;
    const cfg = await res.json();
    const configuredUrl = cfg?.supabase?.url ? String(cfg.supabase.url).trim() : SUPABASE_URL;
    const configuredKey = cfg?.supabase?.anonKey ? String(cfg.supabase.anonKey).trim() : SUPABASE_ANON_KEY;
    if(/^https:\/\/bgnykjzxnknyvefytnjj\.supabase\.co$/i.test(configuredUrl) &&
       !/service_role|secret|password/i.test(configuredKey) &&
       (configuredKey.startsWith('sb_publishable_') || configuredKey.startsWith('eyJ'))){
      SUPABASE_URL = configuredUrl;
      SUPABASE_ANON_KEY = configuredKey;
    }else{
      console.warn('Rejected invalid Supabase runtime configuration.');
    }
  }catch(err){
    console.warn('Could not load admin runtime config, using JS defaults:', err);
  }
}

/* ---------- helpers ---------- */
function showToast(type, text){
  const wrap = document.getElementById('toastWrap');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = text;
  wrap.appendChild(el);
  setTimeout(()=> el.remove(), 2800);
}

function setMessage(id, type, text){
  const msg = document.getElementById(id);
  msg.className = `msg show ${type}`;
  msg.textContent = text;
}

function clearMessage(id){
  const msg = document.getElementById(id);
  msg.className = 'msg';
  msg.textContent = '';
}

function bindSectionToggle(buttonId){
  const button = document.getElementById(buttonId);
  const head = button?.closest('.section-settings-head');
  if(!button || !head) return;

  button.addEventListener('click', ()=>{
    const collapsed = head.classList.toggle('collapsed');
    button.setAttribute('aria-expanded', String(!collapsed));
  });
}

bindSectionToggle('sectionToggle');
bindSectionToggle('popularCategoriesToggle');

const DEFAULT_SITE_SETTINGS = {
  eyebrow: 'Top Products',
  title: 'Favourite-selling Products',
  description: 'Hand-picked items that sell fast at the counter — good margins, reliable stock and easy to explain to customers. Tap any item to view details or message us on WhatsApp for bulk pricing.',
  popularCategories: {
    eyebrow: 'Popular Categories',
    title: 'Shop by Hardware Need',
    cards: [
      { title: 'Power Tools Nairobi', text: 'Drills, impact tools, grinders, and cordless power solutions for homes and contractors.', link: 'power-tools.html', image: 'products/Seweco-Paints-Wood-Finishes-NC-Sanding-Sealer-4.4-Liters_213x234.avif' },
      { title: 'Door Locks & Security', text: 'Quality door locks, lever sets, and security hardware for homes, offices, and rentals.', link: 'door-locks-security.html', image: 'products/Union-Assa-Abloy-Lever-Lockset-Door-Locks_213x234.avif' },
      { title: 'Building Materials Nairobi', text: 'Adhesives, finishes, and site essentials for renovation, construction, and finishing work.', link: 'building-materials.html', image: 'products/Conta-Contact-Adhesive-1000ml_213x234.avif' },
      { title: 'Paints & Finishes', text: 'Interior and exterior paints, sealers, thinners, and wood finishes for clean results.', link: 'paints-and-finishes.html', image: 'products/Seweco-Paints-Super-Standard-Thinner-5-Liters_213x234.avif' },
      { title: 'Safety Gear Nairobi', text: 'Work gloves, protective gear, and essential safety items for daily site productivity.', link: 'safety-gear.html', image: 'products/Union-Mortice-Lockset-Door-Lock_213x234.avif' }
    ]
  }
};

function applySiteSettings(settings = DEFAULT_SITE_SETTINGS){
  document.getElementById('sectionEyebrow').value = settings.eyebrow || DEFAULT_SITE_SETTINGS.eyebrow;
  document.getElementById('sectionTitle').value = settings.title || DEFAULT_SITE_SETTINGS.title;
  document.getElementById('sectionDescription').value = settings.description || DEFAULT_SITE_SETTINGS.description;

  const popular = settings.popularCategories || DEFAULT_SITE_SETTINGS.popularCategories;
  document.getElementById('popularCategoriesEyebrow').value = popular.eyebrow || DEFAULT_SITE_SETTINGS.popularCategories.eyebrow;
  document.getElementById('popularCategoriesTitle').value = popular.title || DEFAULT_SITE_SETTINGS.popularCategories.title;

  const cards = Array.isArray(popular.cards) && popular.cards.length ? popular.cards : DEFAULT_SITE_SETTINGS.popularCategories.cards;
  for (let i = 0; i < 5; i++) {
    const card = cards[i] || {};
    document.getElementById(`popularCategory${i + 1}Title`).value = card.title || '';
    document.getElementById(`popularCategory${i + 1}Text`).value = card.text || '';
    document.getElementById(`popularCategory${i + 1}Link`).value = card.link || '';
    const imageInput = document.getElementById(`popularCategory${i + 1}Image`);
    const preview = document.getElementById(`popularCategory${i + 1}Preview`);
    imageInput.value = card.image || '';
    if (preview) {
      const imgUrl = safeImageUrl(card.image || '');
      preview.innerHTML = imgUrl ? `<img src="${escapeAttr(imgUrl)}" alt="preview">` : '<i class="fa-solid fa-image"></i>';
    }
  }
}

async function loadSiteSettings(){
  if(!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from('site_settings')
    .select('settings')
    .eq('id', 'storefront')
    .maybeSingle();
  if(error){
    console.warn('Could not load site settings:', error.message);
    return;
  }
  if(data?.settings) applySiteSettings(data.settings);
}

document.getElementById('sectionForm')?.addEventListener('submit', async (event)=>{
  event.preventDefault();
  const messageId = 'sectionMsg';
  if(!isAllowed('edit_product')){
    setMessage(messageId, 'err', 'Your account does not have permission to edit this section.');
    return;
  }
  if(!supabaseClient || !BACKEND_CONFIGURED){
    setMessage(messageId, 'err', 'Backend is not configured.');
    return;
  }

  const settings = {
    eyebrow: document.getElementById('sectionEyebrow').value.trim(),
    title: document.getElementById('sectionTitle').value.trim(),
    description: document.getElementById('sectionDescription').value.trim()
  };
  if(!settings.eyebrow || !settings.title){
    setMessage(messageId, 'err', 'Eyebrow and title are required.');
    return;
  }

  const button = document.getElementById('saveSectionBtn');
  button.disabled = true;
  button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
  try{
    const existing = await supabaseClient
      .from('site_settings')
      .select('settings')
      .eq('id', 'storefront')
      .maybeSingle();

    const currentSettings = existing?.data?.settings || {};
    const mergedSettings = {
      ...currentSettings,
      eyebrow: settings.eyebrow,
      title: settings.title,
      description: settings.description,
      popularCategories: currentSettings.popularCategories || DEFAULT_SITE_SETTINGS.popularCategories
    };

    const { error } = await supabaseClient.from('site_settings').upsert({
      id: 'storefront',
      settings: mergedSettings,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if(error) throw error;
    setMessage(messageId, 'ok', 'Section updated. Refresh the storefront to see the change.');
    logAdminActionSafe('update_site_settings', 'site_settings', 'storefront', mergedSettings);
  }catch(error){
    const message = /row-level security|rls|permission/i.test(error.message || '')
      ? 'Supabase blocked this update. Set your user app_metadata role to admin, manager, or staff, then sign in again.'
      : `Could not save section: ${error.message}`;
    setMessage(messageId, 'err', message);
  }finally{
    button.disabled = false;
    button.innerHTML = '<i class="fa-solid fa-check"></i> Update Section';
  }
});

document.getElementById('popularCategoriesForm')?.addEventListener('submit', async (event)=>{
  event.preventDefault();
  const messageId = 'popularCategoriesMsg';
  if(!isAllowed('edit_product')){
    setMessage(messageId, 'err', 'Your account does not have permission to edit this section.');
    return;
  }
  if(!supabaseClient || !BACKEND_CONFIGURED){
    setMessage(messageId, 'err', 'Backend is not configured.');
    return;
  }

  const eyebrow = document.getElementById('popularCategoriesEyebrow').value.trim();
  const title = document.getElementById('popularCategoriesTitle').value.trim();
  if(!eyebrow || !title){
    setMessage(messageId, 'err', 'Eyebrow and title are required.');
    return;
  }

  const cards = [1,2,3,4,5].map((idx)=>({
    title: document.getElementById(`popularCategory${idx}Title`).value.trim(),
    text: document.getElementById(`popularCategory${idx}Text`).value.trim(),
    link: document.getElementById(`popularCategory${idx}Link`).value.trim(),
    image: document.getElementById(`popularCategory${idx}Image`).value.trim()
  })).filter((card)=> card.title || card.text || card.link || card.image);

  const button = document.getElementById('savePopularCategoriesBtn');
  button.disabled = true;
  button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

  try{
    const existing = await supabaseClient
      .from('site_settings')
      .select('settings')
      .eq('id', 'storefront')
      .maybeSingle();

    const currentSettings = existing?.data?.settings || {};
    const mergedSettings = {
      ...currentSettings,
      eyebrow: currentSettings.eyebrow || DEFAULT_SITE_SETTINGS.eyebrow,
      title: currentSettings.title || DEFAULT_SITE_SETTINGS.title,
      description: currentSettings.description || DEFAULT_SITE_SETTINGS.description,
      popularCategories: {
        eyebrow,
        title,
        cards
      }
    };

    const { error } = await supabaseClient.from('site_settings').upsert({
      id: 'storefront',
      settings: mergedSettings,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if(error) throw error;
    setMessage(messageId, 'ok', 'Popular Categories updated. Refresh the storefront to see the change.');
    logAdminActionSafe('update_popular_categories', 'site_settings', 'storefront', mergedSettings.popularCategories);
  }catch(error){
    const message = /row-level security|rls|permission/i.test(error.message || '')
      ? 'Supabase blocked this update. Set your user app_metadata role to admin, manager, or staff, then sign in again.'
      : `Could not save Popular Categories: ${error.message}`;
    setMessage(messageId, 'err', message);
  }finally{
    button.disabled = false;
    button.innerHTML = '<i class="fa-solid fa-check"></i> Update Popular Categories';
  }
});

function setRequiredError(fieldId, show, text){
  const field = document.getElementById(fieldId);
  if(!field) return;
  const wrap = field.closest('.field') || document.getElementById('f'+fieldId.charAt(0).toUpperCase()+fieldId.slice(1));
  if(!wrap) return;
  wrap.classList.toggle('invalid', show);
  const err = wrap.querySelector('.error-text');
  if(err && text) err.textContent = text;
}

async function logAdminAction(action, entityType, entityId, details = null){
  if(!BACKEND_CONFIGURED || !supabaseClient) return;
  const actor = currentSession?.user || null;
  const payload = {
    action,
    entity_type: entityType,
    entity_id: entityId ? String(entityId) : null,
    actor_user_id: actor?.id || null,
    actor_email: actor?.email || null,
    details: details || {}
  };
  const { error } = await supabaseClient.from('admin_audit_logs').insert(payload);
  if(error) throw error;
}

function logAdminActionSafe(action, entityType, entityId, details = null){
  logAdminAction(action, entityType, entityId, details).catch((err)=>{
    console.warn('Audit log insert failed:', err?.message || err);
  });
}

function isAllowed(action){
  if(currentUserRole === 'admin') return true;
  if(currentUserRole === 'manager') return true;
  if(currentUserRole === 'staff') return ['view','edit_product','edit_offer'].includes(action);
  return ['view'].includes(action);
}

const localProductImages = [
  { match: /hinge/i, image: '../index_24/gallery-images/New folder/6a54faa400a4143030ab1dd8_SOFT CLOSING CONCEALED HINGES F-BEND - 4 HOLES B.png' },
  { match: /bonded washer|self screw/i, image: '../index_24/gallery-images/New folder/6971c655936289dea74eecbe_696de03240705a9f7442635b_Self20Screw20robustline20Head20Bonded%20Washer.webp' },
  { match: /self drilling|buggle head/i, image: '../index_24/gallery-images/New folder/6a69f7d6b2e2c15d5be3c3cf_SELF_DRILLING_SCREW_main_img.jpg' },
  { match: /chipboard screw|mdf screw/i, image: '../index_24/gallery-images/New folder/6a6a265375b653a08d9ddc87_Self Drilling Screw CSK.jpg' },
  { match: /circular saw/i, image: '../index_24/gallery-images/New folder/6a6c51f9327b3047920208a9_Circular Saw-p-2000.webp' },
  { match: /chisel/i, image: '../index_24/gallery-images/New folder/6a1fe38950cb4e7040ca05ce_4 pcs set.png' },
  { match: /silicone gun|caulking gun/i, image: '../index_24/gallery-images/New folder/6a2aca0a3e79d680ddfedf66_silicone-gun orange.webp' },
  { match: /combination plier|long nose plier|plier/i, image: '../index_24/gallery-images/New folder/6a855139ff9aec26af992e0f_Combination Plier.webp' },
  { match: /planer/i, image: '../index_24/gallery-images/New folder/6a213a6ec468fdeaf63adde7_A39 Half Planer (2).png' },
  { match: /hasp|staple/i, image: '../index_24/gallery-images/New folder/6a3e9fc0e49449c817fd6aea_Heavy Hasp & Staple Black 1.png' }
];
function resolveProductImage(product, fallback){
  const text = `${product?.name || ''} ${product?.slug || ''}`;
  return localProductImages.find(item => item.match.test(text))?.image || fallback || '';
}

function resolveRole(session){
  return String(session?.user?.app_metadata?.role || 'staff').toLowerCase();
}

function formatSessionExpiry(session){
  const exp = session?.expires_at;
  if(!exp) return '�';
  return new Date(exp * 1000).toLocaleString();
}

function updateProfile(session){
  const email = session?.user?.email || 'staff@frontline.co.ke';
  const first = (email[0] || 'S').toUpperCase();
  const role = resolveRole(session);
  currentUserRole = role;
  document.getElementById('whoami').textContent = email;
  document.getElementById('profileEmail').textContent = email;
  document.getElementById('profileRole').textContent = `Role: ${role}`;
  document.getElementById('roleBadge').textContent = `Role: ${role}`;
  document.getElementById('profileInitial').textContent = first;
  document.getElementById('profileAvatar').textContent = first;
  document.getElementById('lastLogin').textContent = new Date().toLocaleString();
  document.getElementById('sessionExpiry').textContent = formatSessionExpiry(session);
}

function applyRolePermissions(){
  const productReadOnly = !isAllowed('edit_product');
  document.querySelectorAll('#productForm input, #productForm select, #productForm textarea, #productForm button').forEach(el=>{
    if(el.id === 'cancelEditBtn') return;
    el.disabled = productReadOnly;
  });
  if(productReadOnly){
    document.getElementById('saveBtn').classList.add('hidden');
  }else{
    document.getElementById('saveBtn').classList.remove('hidden');
  }

  const offersReadOnly = !isAllowed('edit_offer');
  document.querySelectorAll('#offerForm input, #offerForm select, #offerForm textarea, #offerForm button').forEach(el=>{
    if(el.id === 'cancelOfferEditBtn') return;
    el.disabled = offersReadOnly;
  });
  if(offersReadOnly){
    document.getElementById('saveOfferBtn').classList.add('hidden');
    showToast('err','Read-only role: offer editing is disabled.');
  }else{
    document.getElementById('saveOfferBtn').classList.remove('hidden');
  }

  const deleteLeadsBtn = document.getElementById('deleteFilteredLeadsBtn');
  if(deleteLeadsBtn){
    deleteLeadsBtn.classList.toggle('hidden', !isAllowed('delete_lead'));
  }
}

function setTheme(theme){
  document.body.classList.toggle('theme-dark', theme === 'dark');
  localStorage.setItem('frontline_theme', theme);
  const dark = theme === 'dark';
  document.getElementById('quickTheme').checked = dark;
  document.getElementById('themeBtn').innerHTML = dark ? '<i class="fa-regular fa-sun"></i>' : '<i class="fa-regular fa-moon"></i>';
}

function initTheme(){
  const saved = localStorage.getItem('frontline_theme') || 'light';
  setTheme(saved);
}

function statusBadge(status){
  if(status === 'In Stock') return '<span class="badge badge-ok">In Stock</span>';
  if(status === 'Low Stock') return '<span class="badge badge-warn">Low Stock</span>';
  return '<span class="badge badge-soon">Pre-Order</span>';
}

function parsePrice(v){ return Number(v || 0) || 0; }

function escapeHtml(v){
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(v){
  return escapeHtml(v).replace(/`/g, '&#96;');
}

function safeImageUrl(url){
  const raw = String(url || '').trim();
  if(!raw) return '';
  if(/^data:image\//i.test(raw)) return raw;
  try{
    const parsed = new URL(raw, window.location.href);
    if(parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.href;
  }catch(_err){
    return '';
  }
  return '';
}

function parseKesPrice(v){
  if(v === null || v === undefined) return 0;
  const numeric = String(v).replace(/[^0-9.]/g, '');
  return Number(numeric || 0) || 0;
}

function extractArrayLiteral(source, marker){
  const markerIndex = source.indexOf(marker);
  if(markerIndex === -1) return null;

  const start = source.indexOf('[', markerIndex);
  if(start === -1) return null;

  let depth = 0;
  let inString = false;
  let stringQuote = '';
  let escaped = false;

  for(let i = start; i < source.length; i++){
    const ch = source[i];

    if(inString){
      if(escaped){
        escaped = false;
      }else if(ch === '\\'){
        escaped = true;
      }else if(ch === stringQuote){
        inString = false;
      }
      continue;
    }

    if(ch === '"' || ch === "'"){
      inString = true;
      stringQuote = ch;
      continue;
    }

    if(ch === '['){
      depth++;
    }else if(ch === ']'){
      depth--;
      if(depth === 0){
        return source.slice(start, i + 1);
      }
    }
  }

  return null;
}

function mapIndexProductsToPayload(productsArray, cordlessArray){
  const payload = [];

  for(const p of productsArray || []){
    if(!Array.isArray(p) || p.length < 10) continue;
    payload.push({
      name: String(p[3] || '').trim(),
      slug: String(p[7] || '').trim(),
      brand_display: String(p[1] || '').trim(),
      brand_key: String(p[0] || '').trim().toLowerCase(),
      model_type: String(p[2] || '').trim(),
      category: String(p[4] || '').trim(),
      price: parseKesPrice(p[6]),
      availability: String(p[8] || 'In Stock').trim() || 'In Stock',
      description: String(p[5] || '').trim(),
      image_url: resolveProductImage({name: p[3], slug: p[7]}, String(p[9] || '').trim()),
      is_top_product: false
    });
  }

  for(const p of cordlessArray || []){
    if(!Array.isArray(p) || p.length < 7) continue;
    payload.push({
      name: String(p[2] || '').trim(),
      slug: String(p[5] || '').trim(),
      brand_display: String(p[1] || '').trim(),
      brand_key: String(p[0] || '').trim().toLowerCase(),
      model_type: String(p[2] || '').trim(),
      category: String(p[3] || '').trim(),
      price: 0,
      availability: 'In Stock',
      description: String(p[4] || '').trim(),
      image_url: resolveProductImage({name: p[2], slug: p[5]}, String(p[6] || '').trim())
    });
  }

  return payload.filter(p => p.name && p.slug && p.category);
}

function setImportStatus(text, tone){
  const el = document.getElementById('importStatus');
  if(!el) return;
  el.className = `import-status${tone ? ' ' + tone : ''}`;
  el.textContent = text;
}

function pickIndexHtmlFile(){
  return new Promise((resolve, reject)=>{
    const input = document.getElementById('indexImportFile');
    if(!input){
      reject(new Error('Import file input not found.'));
      return;
    }

    input.value = '';
    input.onchange = ()=>{
      const file = input.files && input.files[0];
      if(!file){
        reject(new Error('No file selected.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = ()=> resolve(String(reader.result || ''));
      reader.onerror = ()=> reject(new Error('Could not read selected file.'));
      reader.readAsText(file);
    };
    input.click();
  });
}

async function readIndexSourceForImport(){
  try{
    setImportStatus('Reading storefront products...', '');
    const response = await fetchWithTimeout('../index_24/index_24.js', { cache: 'no-store' }, 10000);
    if(response.ok){
      return await response.text();
    }
  }catch(err){
    // Fall back to manual file picker when fetch is blocked on local file:// pages.
  }

  showToast('err','Auto-read blocked by browser. Select index_24.js manually to continue import.');
  setImportStatus('Waiting for file selection...', '');
  return await pickIndexHtmlFile();
}

async function importProductsFromIndex(){
  if(!BACKEND_CONFIGURED || !supabaseClient){
    showToast('err','Backend not configured yet.');
    return;
  }

  if(!isAllowed('edit_product')){
    showToast('err','You do not have permission to import products.');
    return;
  }

  const proceed = await confirmAction(
    'Import products from index_24.js',
    'This will add new products and update existing ones by slug. Continue?',
    { okText:'Import', okTone:'primary' }
  );
  if(!proceed) return;

  const btn = document.getElementById('importIndexBtn');
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Importing...';
  setImportStatus('Starting import...', '');

  try{
    const source = await readIndexSourceForImport();
    setImportStatus('Parsing products...', '');
    const productsLiteral =
      extractArrayLiteral(source, 'let products =') ||
      extractArrayLiteral(source, 'const products =');
    const cordlessLiteral =
      extractArrayLiteral(source, 'let cordlessProducts =') ||
      extractArrayLiteral(source, 'const cordlessProducts =');

    if(!productsLiteral){
      throw new Error('Could not find products array in index_24.js.');
    }

    const productsArray = Function('"use strict"; return (' + productsLiteral + ');')();
    const cordlessArray = cordlessLiteral ? Function('"use strict"; return (' + cordlessLiteral + ');')() : [];

    const mapped = mapIndexProductsToPayload(productsArray, cordlessArray);
    if(!mapped.length){
      throw new Error('No valid products found to import.');
    }
    setImportStatus(`Parsed ${mapped.length} records`, '');

    const dedupedMap = new Map();
    mapped.forEach(item => dedupedMap.set(item.slug, item));
    const deduped = [...dedupedMap.values()];
    setImportStatus(`Comparing ${deduped.length} slugs...`, '');

    const { data: existingRows, error: existingErr } = await supabaseClient
      .from('products')
      .select('id,slug');
    if(existingErr) throw existingErr;

    const bySlug = new Map((existingRows || []).map(r => [r.slug, r.id]));
    const toInsert = [];
    const toUpdate = [];

    deduped.forEach(item => {
      const id = bySlug.get(item.slug);
      if(id){
        toUpdate.push({ id, ...item });
      }else{
        toInsert.push(item);
      }
    });

    setImportStatus(`Saving ${toInsert.length} new, ${toUpdate.length} updates...`, '');

    if(toInsert.length){
      const { error } = await supabaseClient.from('products').insert(toInsert);
      if(error) throw error;
    }

    for(const row of toUpdate){
      const { id, ...payload } = row;
      const { error } = await supabaseClient.from('products').update(payload).eq('id', id);
      if(error) throw error;
    }

    showToast('ok', `Imported ${deduped.length} products (${toInsert.length} new, ${toUpdate.length} updated).`);
    setImportStatus(`Done: ${deduped.length} imported`, 'ok');
    loadProducts();
  }catch(err){
    showToast('err', err.message || 'Import failed.');
    setImportStatus('Import failed', 'err');
  }finally{
    btn.disabled = false;
    btn.innerHTML = original;
  }
}

function skeletonRows(colspan = 6, count = 5){
  return Array.from({length:count}).map(()=>`<tr class="skeleton-row"><td colspan="${colspan}"><div class="skeleton"></div></td></tr>`).join('');
}

function setUploadStatus(mode, text){
  const wrap = document.getElementById('uploadStatus');
  if(!wrap) return;
  if(!mode){
    wrap.className = 'upload-status';
    wrap.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span id="uploadStatusText"></span>';
    return;
  }
  wrap.className = `upload-status show${mode === 'done' ? ' done' : ''}`;
  wrap.innerHTML = mode === 'done'
    ? '<i class="fa-solid fa-circle-check"></i><span id="uploadStatusText"></span>'
    : '<i class="fa-solid fa-spinner fa-spin"></i><span id="uploadStatusText"></span>';
  document.getElementById('uploadStatusText').textContent = text;
}

function setOfferUploadStatus(mode, text){
  const wrap = document.getElementById('offerUploadStatus');
  if(!wrap) return;
  if(!mode){
    wrap.className = 'upload-status';
    wrap.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span id="offerUploadStatusText"></span>';
    return;
  }
  wrap.className = `upload-status show${mode === 'done' ? ' done' : ''}`;
  wrap.innerHTML = mode === 'done'
    ? '<i class="fa-solid fa-circle-check"></i><span id="offerUploadStatusText"></span>'
    : '<i class="fa-solid fa-spinner fa-spin"></i><span id="offerUploadStatusText"></span>';
  document.getElementById('offerUploadStatusText').textContent = text;
}

async function optimizeImageFile(file){
  if(!file || !file.type.startsWith('image/') || !window.createImageBitmap){
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if(!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const quality = outputType === 'image/png' ? undefined : 0.82;
  const blob = await new Promise((resolve, reject)=>{
    canvas.toBlob(result => result ? resolve(result) : reject(new Error('Could not process selected image.')), outputType, quality);
  });

  if(blob.size >= file.size){
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'product-image';
  const ext = outputType === 'image/png' ? 'png' : 'jpg';
  return new File([blob], `${baseName}.${ext}`, { type: outputType });
}

function showBoot(show, text){
  const boot = document.getElementById('bootScreen');
  const label = document.getElementById('bootText');
  if(text) label.textContent = text;
  boot.classList.toggle('hidden', !show);
}

function showLogin(){
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  showBoot(false);
}

function updateAnalytics(){
  const totalProducts = allProducts.length;
  const inStock = allProducts.filter(p=>p.availability === 'In Stock').length;
  const lowStock = allProducts.filter(p=>p.availability === 'Low Stock').length;
  const preOrder = allProducts.filter(p=>p.availability === 'Pre-Order').length;
  const leadsCount = allLeads.length;
  const categories = new Set(allProducts.map(p => (p.category || '').trim()).filter(Boolean)).size;

  const setText = (id, value)=>{
    const el = document.getElementById(id);
    if(el) el.textContent = value;
  };

  setText('statTotalProducts', totalProducts);
  setText('statInStock', inStock);
  setText('statLowStock', lowStock);
  setText('statPreOrder', preOrder);
  setText('statCategories', categories);
  setText('statEnquiries', leadsCount);
  setText('prodCountSide', totalProducts);
  setText('notifCount', Math.min(12, leadsCount + 2));
}

/* ---------- modal confirm ---------- */
let confirmResolve = null;
function confirmAction(title, text, options = {}){
  const { okText = 'Delete', okTone = 'danger' } = options;
  const modal = document.getElementById('confirmModal');
  const okBtn = document.getElementById('confirmOk');
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmText').textContent = text;
  okBtn.textContent = okText;
  okBtn.className = okTone === 'primary' ? 'btn btn-primary' : 'btn btn-danger';
  modal.classList.add('show');
  return new Promise(resolve=>{ confirmResolve = resolve; });
}
function closeConfirm(val){
  document.getElementById('confirmModal').classList.remove('show');
  const okBtn = document.getElementById('confirmOk');
  okBtn.textContent = 'Delete';
  okBtn.className = 'btn btn-danger';
  if(confirmResolve){ confirmResolve(val); confirmResolve = null; }
}
document.getElementById('confirmCancel').addEventListener('click', ()=> closeConfirm(false));
document.getElementById('confirmOk').addEventListener('click', ()=> closeConfirm(true));
document.getElementById('confirmModal').addEventListener('click', (e)=>{ if(e.target.id === 'confirmModal') closeConfirm(false); });

/* ---------- auth ---------- */
async function checkSession(){
  initTheme();
  showBoot(true, 'Checking your session...');

  if(!BACKEND_CONFIGURED){
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('configBanner').classList.remove('hidden');
    document.getElementById('prodTableBody').innerHTML = skeletonRows(6);
    document.getElementById('offersTableBody').innerHTML = skeletonRows(6);
    document.getElementById('leadsTableBody').innerHTML = skeletonRows(7);
    showBoot(false);
    showToast('err','Backend not configured.');
    return;
  }

  if(SUPABASE_LOAD_ERROR){
    showLogin();
    setMessage('loginMsg','err', SUPABASE_LOAD_ERROR);
    return;
  }

  try{
    const { data, error } = await supabaseClient.auth.getSession();
    if(error) throw error;
    if(data.session){
      currentSession = data.session;
      showDashboard(data.session);
      return;
    }
    showLogin();
  }catch(err){
    if(isJwtError(err)) await clearInvalidSession();
    showLogin();
    setMessage('loginMsg', 'err', getAuthErrorMessage(err));
  }
}

function isJwtError(error){
  return /invalid jwt|jwt expired|token is expired|refresh token/i.test(error?.message || '');
}

function getAuthErrorMessage(error){
  if(isJwtError(error)) return 'Your session expired. Please sign in again.';
  return 'Could not reach Supabase: ' + (error?.message || 'Unknown authentication error.');
}

async function clearInvalidSession(){
  try{
    await supabaseClient?.auth.signOut({ scope: 'local' });
  }catch(signOutError){
    console.warn('Could not clear the expired local session:', signOutError?.message || signOutError);
  }
  currentSession = null;
}

function showDashboard(session){
  currentSession = session;
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  showBoot(false);
  updateProfile(session);
  applyRolePermissions();
  applySiteSettings();
  loadSiteSettings();
  loadProducts();
  loadOffers();
  loadLeads();
}

function registerAuthStateListener(){
  if(!BACKEND_CONFIGURED || !supabaseClient) return;
  authSubscription?.unsubscribe();
  const { data } = supabaseClient.auth.onAuthStateChange((event, session)=>{
    if(event === 'SIGNED_OUT'){
      showToast('err','Session ended. Please sign in again.');
      setTimeout(()=> window.location.reload(), 700);
      return;
    }
    if(!session) return;
    currentSession = session;
    updateProfile(session);
  });
  authSubscription = data.subscription;
}

document.getElementById('loginForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  clearMessage('loginMsg');

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  setRequiredError('loginEmail', !email || !email.includes('@'));
  setRequiredError('loginPassword', !password);
  if(!email || !password || !email.includes('@')) return;

  if(!BACKEND_CONFIGURED){
    setMessage('loginMsg','err','Backend not configured.');
    return;
  }

  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing In...';

  try{
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if(error){ setMessage('loginMsg','err', error.message); return; }
    if(!data.session){
      setMessage('loginMsg', 'err', 'Sign-in succeeded but no session was returned. Please try again.');
      return;
    }
    showDashboard(data.session);
    showToast('ok','Signed in successfully.');
  }catch(err){
    setMessage('loginMsg','err', 'Something went wrong: ' + err.message);
  }finally{
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In';
  }
});

document.getElementById('logoutBtn').addEventListener('click', async ()=>{
  if(BACKEND_CONFIGURED && supabaseClient){
    await supabaseClient.auth.signOut();
  }
  window.location.reload();
});

/* ---------- navigation ---------- */
function switchTab(tab){
  document.querySelectorAll('.tab-btn').forEach(b=> b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.nav-btn[data-tab]').forEach(b=> b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p=> p.classList.toggle('active', p.id === 'tab-'+tab));
  const labels = { products:'Products', offers:'Offers & Deals', leads:'Enquiries' };
  document.getElementById('crumbCurrent').textContent = labels[tab] || 'Products';
}

document.querySelectorAll('.tab-btn').forEach(btn=> btn.addEventListener('click', ()=> switchTab(btn.dataset.tab)));
document.querySelectorAll('.nav-btn[data-tab]').forEach(btn=> btn.addEventListener('click', ()=> switchTab(btn.dataset.tab)));

const closeSidebar = ()=> document.body.classList.remove('sidebar-open');
const toggleSidebar = ()=> document.body.classList.toggle('sidebar-open');

document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
document.getElementById('sidebarScrim').addEventListener('click', closeSidebar);
document.querySelectorAll('.nav-btn[data-tab]').forEach(btn=> btn.addEventListener('click', ()=>{
  if(window.innerWidth <= 960) closeSidebar();
}));
window.addEventListener('resize', ()=>{
  if(window.innerWidth > 960) closeSidebar();
});
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape') closeSidebar();
});

document.getElementById('themeBtn').addEventListener('click', ()=> setTheme(document.body.classList.contains('theme-dark') ? 'light' : 'dark'));
document.getElementById('quickTheme').addEventListener('change', (e)=> setTheme(e.target.checked ? 'dark' : 'light'));
document.getElementById('notifBtn').addEventListener('click', ()=> showToast('ok','No critical notifications right now.'));

/* ---------- form helpers ---------- */
document.getElementById('pCategory').addEventListener('change', (e)=>{
  document.getElementById('pCategoryOther').classList.toggle('hidden', e.target.value !== '__other__');
});

document.getElementById('pName').addEventListener('input', (e)=>{
  const slugField = document.getElementById('pSlug');
  if(slugField.dataset.touched) return;
  slugField.value = e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-+|-+$)/g,'');
});
document.getElementById('pSlug').addEventListener('input', (e)=>{ e.target.dataset.touched = '1'; });

document.getElementById('pPhoto').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  if(!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)){
    e.target.value = '';
    editingPhotoFile = null;
    setUploadStatus(null);
    showToast('err','Use JPG, PNG, or WebP images only.');
    return;
  }
  if(file.size > 10 * 1024 * 1024){
    e.target.value = '';
    editingPhotoFile = null;
    setUploadStatus(null);
    showToast('err','Image is too large. Use an image under 10MB.');
    return;
  }
  editingPhotoFile = file;
  setUploadStatus('loading', `Selected ${file.name}`);
  const reader = new FileReader();
  reader.onload = ()=>{
    document.getElementById('photoPreview').innerHTML = `<img src="${reader.result}" alt="preview">`;
    setUploadStatus('done', 'Image ready for upload.');
  };
  reader.readAsDataURL(file);
});

function bindPopularCategoryUpload(inputId, previewId, textId){
  const inputEl = document.getElementById(inputId);
  const previewEl = document.getElementById(previewId);
  const textEl = document.getElementById(textId);
  if(!inputEl || !previewEl || !textEl) return;

  inputEl.addEventListener('change', (e)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    if(!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)){
      e.target.value = '';
      showToast('err', 'Use JPG, PNG, or WebP images only.');
      return;
    }
    if(file.size > 10 * 1024 * 1024){
      e.target.value = '';
      showToast('err', 'Image is too large. Use an image under 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = ()=>{
      previewEl.innerHTML = `<img src="${reader.result}" alt="preview">`;
      textEl.value = reader.result;
      const select = document.getElementById(`${textId.replace('Image','')}ImageSelect`);
      if(select) select.value = '';
    };
    reader.readAsDataURL(file);
  });

  textEl.addEventListener('input', ()=>{
    const value = textEl.value.trim();
    const imgUrl = safeImageUrl(value);
    previewEl.innerHTML = imgUrl ? `<img src="${escapeAttr(imgUrl)}" alt="preview">` : '<i class="fa-solid fa-image"></i>';
  });
}

function bindPopularCategoryImageSelect(selectId, imageId, previewId){
  const selectEl = document.getElementById(selectId);
  const imageEl = document.getElementById(imageId);
  const previewEl = document.getElementById(previewId);
  if(!selectEl || !imageEl || !previewEl) return;

  selectEl.addEventListener('change', ()=>{
    const value = selectEl.value.trim();
    imageEl.value = value;
    const imgUrl = safeImageUrl(value);
    previewEl.innerHTML = imgUrl ? `<img src="${escapeAttr(imgUrl)}" alt="preview">` : '<i class="fa-solid fa-image"></i>';
  });
}

async function savePopularCategoryCard(index){
  if(!supabaseClient || !BACKEND_CONFIGURED){
    showToast('err', 'Backend is not configured.');
    return;
  }

  const eyebrow = document.getElementById('popularCategoriesEyebrow')?.value.trim() || DEFAULT_SITE_SETTINGS.popularCategories.eyebrow;
  const title = document.getElementById('popularCategoriesTitle')?.value.trim() || DEFAULT_SITE_SETTINGS.popularCategories.title;

  const cards = [1,2,3,4,5].map((idx)=>({
    title: document.getElementById(`popularCategory${idx}Title`)?.value.trim() || '',
    text: document.getElementById(`popularCategory${idx}Text`)?.value.trim() || '',
    link: document.getElementById(`popularCategory${idx}Link`)?.value.trim() || '',
    image: document.getElementById(`popularCategory${idx}Image`)?.value.trim() || ''
  }));

  try{
    const existing = await supabaseClient
      .from('site_settings')
      .select('settings')
      .eq('id', 'storefront')
      .maybeSingle();

    const currentSettings = existing?.data?.settings || {};
    const mergedSettings = {
      ...currentSettings,
      eyebrow: currentSettings.eyebrow || DEFAULT_SITE_SETTINGS.eyebrow,
      title: currentSettings.title || DEFAULT_SITE_SETTINGS.title,
      description: currentSettings.description || DEFAULT_SITE_SETTINGS.description,
      popularCategories: {
        eyebrow,
        title,
        cards
      }
    };

    const { error } = await supabaseClient.from('site_settings').upsert({
      id: 'storefront',
      settings: mergedSettings,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    if(error) throw error;
    showToast('ok', `Card ${index} saved.`);
    logAdminActionSafe('update_popular_category_card', 'site_settings', 'storefront', { cardIndex: index, data: mergedSettings.popularCategories.cards[index - 1] });
  }catch(error){
    const message = /row-level security|rls|permission/i.test(error.message || '')
      ? 'Supabase blocked this update. Set your user app_metadata role to admin, manager, or staff, then sign in again.'
      : `Could not save card ${index}: ${error.message}`;
    showToast('err', message);
  }
}

function bindPopularCategoryActionButtons(){
  document.querySelectorAll('[data-popular-card-save]').forEach((button)=>{
    button.addEventListener('click', async ()=>{
      const idx = Number(button.dataset.popularCardSave);
      await savePopularCategoryCard(idx);
    });
  });

  document.querySelectorAll('[data-popular-image-update]').forEach((button)=>{
    button.addEventListener('click', async ()=>{
      const idx = Number(button.dataset.popularImageUpdate);
      const imageInput = document.getElementById(`popularCategory${idx}Image`);
      if(!imageInput) return;
      const value = imageInput.value.trim();
      const preview = document.getElementById(`popularCategory${idx}Preview`);
      if(!value){
        showToast('err', 'Choose an image first.');
        return;
      }
      const imgUrl = safeImageUrl(value);
      if(preview) preview.innerHTML = imgUrl ? `<img src="${escapeAttr(imgUrl)}" alt="preview">` : '<i class="fa-solid fa-image"></i>';
      await savePopularCategoryCard(idx);
    });
  });

  document.querySelectorAll('[data-popular-image-clear]').forEach((button)=>{
    button.addEventListener('click', async ()=>{
      const idx = Number(button.dataset.popularImageClear);
      const imageInput = document.getElementById(`popularCategory${idx}Image`);
      const preview = document.getElementById(`popularCategory${idx}Preview`);
      const select = document.getElementById(`popularCategory${idx}ImageSelect`);
      if(imageInput) imageInput.value = '';
      if(select) select.value = '';
      if(preview) preview.innerHTML = '<i class="fa-solid fa-image"></i>';
      await savePopularCategoryCard(idx);
    });
  });

  document.querySelectorAll('[data-popular-image-reset]').forEach((button)=>{
    button.addEventListener('click', async ()=>{
      const idx = Number(button.dataset.popularImageReset);
      const defaultImage = DEFAULT_SITE_SETTINGS.popularCategories.cards?.[idx - 1]?.image || '';
      const imageInput = document.getElementById(`popularCategory${idx}Image`);
      const preview = document.getElementById(`popularCategory${idx}Preview`);
      const select = document.getElementById(`popularCategory${idx}ImageSelect`);
      if(imageInput) imageInput.value = defaultImage;
      if(select) select.value = defaultImage;
      const imgUrl = safeImageUrl(defaultImage);
      if(preview) preview.innerHTML = imgUrl ? `<img src="${escapeAttr(imgUrl)}" alt="preview">` : '<i class="fa-solid fa-image"></i>';
      await savePopularCategoryCard(idx);
    });
  });
}

function refreshPopularCategoryImageOptions(){
  const productOptions = allProducts
    .filter(p => (p.image_url || '').trim())
    .map(p => `<option value="${escapeAttr(p.image_url)}">${escapeHtml(p.name || 'Product')}${p.category ? ' — ' + escapeHtml(p.category) : ''}</option>`)
    .join('');

  [1,2,3,4,5].forEach((idx)=>{
    const select = document.getElementById(`popularCategory${idx}ImageSelect`);
    const imageField = document.getElementById(`popularCategory${idx}Image`);
    if(!select || !imageField) return;
    const current = imageField.value.trim();
    select.innerHTML = '<option value="">Use existing product image...</option>' + productOptions;
    if(current){
      const exists = [...select.options].some(opt => opt.value === current);
      select.value = exists ? current : '';
    } else {
      select.value = '';
    }
  });
}

[1,2,3,4,5].forEach((idx)=>{
  bindPopularCategoryUpload(`popularCategory${idx}Upload`, `popularCategory${idx}Preview`, `popularCategory${idx}Image`);
  bindPopularCategoryImageSelect(`popularCategory${idx}ImageSelect`, `popularCategory${idx}Image`, `popularCategory${idx}Preview`);
});
bindPopularCategoryActionButtons();

document.getElementById('oPhoto').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  if(!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)){
    e.target.value = '';
    editingOfferPhotoFile = null;
    setOfferUploadStatus(null);
    showToast('err','Use JPG, PNG, or WebP images only.');
    return;
  }
  if(file.size > 10 * 1024 * 1024){
    e.target.value = '';
    editingOfferPhotoFile = null;
    setOfferUploadStatus(null);
    showToast('err','Image is too large. Use an image under 10MB.');
    return;
  }
  editingOfferPhotoFile = file;
  setOfferUploadStatus('loading', `Selected ${file.name}`);
  const reader = new FileReader();
  reader.onload = ()=>{
    document.getElementById('offerPhotoPreview').innerHTML = `<img src="${reader.result}" alt="preview">`;
    setOfferUploadStatus('done', 'Image ready for upload.');
  };
  reader.readAsDataURL(file);
});

function validateProductForm(){
  let ok = true;
  const name = document.getElementById('pName').value.trim();
  const slug = document.getElementById('pSlug').value.trim();
  const brandDisplay = document.getElementById('pBrandDisplay').value.trim();
  const brandKey = document.getElementById('pBrandKey').value.trim();
  const category = document.getElementById('pCategory').value;
  const price = Number(document.getElementById('pPrice').value || 0);

  const slugOk = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

  setRequiredError('pName', !name);
  setRequiredError('pSlug', !slug || !slugOk, 'Slug must use lowercase letters, numbers, and hyphens only.');
  setRequiredError('pBrandDisplay', !brandDisplay);
  setRequiredError('pBrandKey', !brandKey);
  setRequiredError('pCategory', !category);
  setRequiredError('pPrice', price < 0, 'Price cannot be negative.');

  if(!name || !slugOk || !brandDisplay || !brandKey || !category || price < 0) ok = false;
  if(category === '__other__' && !document.getElementById('pCategoryOther').value.trim()){
    showToast('err','Please type a custom category name.');
    ok = false;
  }

  return ok;
}

/* ---------- products ---------- */
async function loadProducts(){
  const tbody = document.getElementById('prodTableBody');
  tbody.innerHTML = skeletonRows(6);

  if(!BACKEND_CONFIGURED || !supabaseClient) return;

  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .order('created_at', { ascending:false })
    .limit(1000);
  if(error){
    showToast('err', 'Failed to load products: ' + error.message);
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">Could not load products.</div></td></tr>`;
    return;
  }
  allProducts = data || [];
  state.products.page = 1;
  renderProducts();
  renderTopProductPicker();
  refreshPopularCategoryImageOptions();
  updateAnalytics();
}

function renderTopProductPicker(){
  const picker = document.getElementById('topProductPicker');
  const count = document.getElementById('topProductCount');
  if(!picker || !count) return;

  const selected = allProducts.filter(p=>p.is_top_product).length;
  count.textContent = `${selected} selected`;
  if(!allProducts.length){
    picker.innerHTML = '<p class="muted">Add products first, then choose your top sellers here.</p>';
    return;
  }

  const categories = [...new Set(allProducts.map(p=>p.category || 'Uncategorised'))].sort();
  picker.innerHTML = categories.map(category=>{
    const products = allProducts.filter(p=>(p.category || 'Uncategorised') === category);
    return `<div class="top-product-group">
      <h5>${escapeHtml(category)}</h5>
      ${products.map(p=>`<label class="top-product-option">
        <input type="checkbox" data-top-product="${escapeAttr(p.id)}" ${p.is_top_product ? 'checked' : ''} ${isAllowed('edit_product') ? '' : 'disabled'}>
        <span class="top-product-option-body">
          <span class="top-product-image-wrap"><img src="${escapeAttr(safeImageUrl(resolveProductImage(p, p.image_url)))}" alt="" data-top-image-preview="${escapeAttr(p.id)}" onerror="this.style.display='none'"></span>
          <span>${escapeHtml(p.name || 'Unnamed product')} <small>${escapeHtml(p.brand_display || '')}</small></span>
          <span class="top-product-image-action">
            <input type="file" accept="image/jpeg,image/png,image/webp" data-top-image="${escapeAttr(p.id)}" ${isAllowed('edit_product') ? '' : 'disabled'}>
          </span>
        </span>
      </label>`).join('')}
    </div>`;
  }).join('');

  picker.querySelectorAll('[data-top-product]').forEach(input=>{
    input.addEventListener('change', ()=> setTopProduct(input.dataset.topProduct, input.checked, input));
  });
  picker.querySelectorAll('[data-top-image]').forEach(input=>{
    input.addEventListener('change', ()=> uploadTopProductImage(input.dataset.topImage, input));
  });
}

async function uploadTopProductImage(id, input){
  const file = input.files?.[0];
  if(!file) return;
  if(!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type) || file.size > 10 * 1024 * 1024){
    input.value = '';
    showToast('err','Use a JPG, PNG, or WebP image under 10MB.');
    return;
  }
  if(!BACKEND_CONFIGURED || !supabaseClient || !isAllowed('edit_product')) return;

  input.disabled = true;
  try{
    const optimizedFile = await optimizeImageFile(file);
    const ext = optimizedFile.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
    let imageUrl = '';
    for(const bucketName of ['product-photos', 'product-photo']){
      const { error } = await supabaseClient.storage.from(bucketName).upload(path, optimizedFile, {cacheControl:'3600', upsert:false});
      if(!error){
        imageUrl = supabaseClient.storage.from(bucketName).getPublicUrl(path).data.publicUrl;
        break;
      }
    }
    if(!imageUrl) throw new Error('Could not upload image to the configured Storage bucket.');

    const { error } = await supabaseClient.from('products').update({image_url: imageUrl}).eq('id', id);
    if(error) throw error;
    const product = allProducts.find(p=>p.id===id);
    if(product) product.image_url = imageUrl;
    const preview = document.querySelector(`[data-top-image-preview="${CSS.escape(id)}"]`);
    if(preview){ preview.src = imageUrl; preview.style.display = 'block'; }
    showToast('ok','Top product image updated.');
  }catch(err){
    showToast('err', err.message || 'Could not update product image.');
  }finally{
    input.disabled = false;
    input.value = '';
  }
}

async function setTopProduct(id, isTopProduct, input){
  if(!isAllowed('edit_product') || !BACKEND_CONFIGURED || !supabaseClient) return;
  input.disabled = true;
  const product = allProducts.find(p=>p.id===id);
  const previous = product?.is_top_product;
  if(product) product.is_top_product = isTopProduct;
  document.getElementById('topProductCount').textContent = `${allProducts.filter(p=>p.is_top_product).length} selected`;

  const { error } = await supabaseClient.from('products').update({is_top_product: isTopProduct}).eq('id', id);
  if(error){
    if(product) product.is_top_product = previous;
    input.checked = Boolean(previous);
    showToast('err', 'Could not update top-selling selection. Run top_products_migration.sql first.');
  }else{
    showToast('ok', isTopProduct ? 'Added to Top Products.' : 'Removed from Top Products.');
  }
  input.disabled = false;
}

function getFilteredProducts(){
  const s = state.products;
  let list = [...allProducts];
  const q = s.search.toLowerCase();
  if(q){
    list = list.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.brand_display || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }
  if(s.availability){
    list = list.filter(p => p.availability === s.availability);
  }

  if(s.colSort.col){
    const dir = s.colSort.dir;
    list.sort((a,b)=>{
      if(s.colSort.col === 'name') return (a.name||'').localeCompare(b.name||'') * dir;
      if(s.colSort.col === 'price') return (parsePrice(a.price)-parsePrice(b.price)) * dir;
      return 0;
    });
    return list;
  }

  switch(s.sort){
    case 'name_asc': list.sort((a,b)=>(a.name||'').localeCompare(b.name||'')); break;
    case 'price_desc': list.sort((a,b)=>parsePrice(b.price)-parsePrice(a.price)); break;
    case 'price_asc': list.sort((a,b)=>parsePrice(a.price)-parsePrice(b.price)); break;
    default: break;
  }
  return list;
}

function renderProducts(){
  const list = getFilteredProducts();
  const tbody = document.getElementById('prodTableBody');
  const s = state.products;
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / s.pageSize));
  if(s.page > pages) s.page = pages;
  const start = (s.page - 1) * s.pageSize;
  const pageList = list.slice(start, start + s.pageSize);

  document.getElementById('prodCount').textContent = `${total} product${total===1?'':'s'}`;
  document.getElementById('prodPageInfo').textContent = `Page ${s.page} of ${pages}`;
  document.getElementById('prodPrevBtn').disabled = s.page <= 1;
  document.getElementById('prodNextBtn').disabled = s.page >= pages;

  if(!pageList.length){
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-box-open"></i>No products found.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = pageList.map(p=>{
    const imageUrl = safeImageUrl(resolveProductImage(p, p.image_url));
    const safeName = escapeHtml(p.name || '');
    const safeBrand = escapeHtml(p.brand_display || '');
    const safeCategory = escapeHtml(p.category || '');
    const safeId = escapeAttr(p.id || '');
    const priceNum = parsePrice(p.price);
    return `
    <tr>
      <td><img class="row-thumb" src="${escapeAttr(imageUrl)}" alt="${escapeAttr(p.name || '')}" onerror="this.style.visibility='hidden'"></td>
      <td><b>${safeName}</b><br><span class="muted" style="font-size:.74rem;">${safeBrand}</span></td>
      <td>${safeCategory}</td>
      <td>${priceNum > 0 ? 'KES ' + priceNum.toLocaleString() : '<span class="muted">Ask price</span>'}</td>
      <td>${statusBadge(p.availability)}</td>
      <td class="row-actions">
        ${isAllowed('edit_product') ? `<button data-edit="${safeId}" title="Edit"><i class="fa-solid fa-pen"></i></button>` : ''}
        ${isAllowed('delete_product') ? `<button data-delete="${safeId}" title="Delete"><i class="fa-solid fa-trash"></i></button>` : ''}
      </td>
    </tr>
  `;
  }).join('');

  tbody.querySelectorAll('[data-edit]').forEach(b=> b.addEventListener('click', ()=> startEdit(b.dataset.edit)));
  tbody.querySelectorAll('[data-delete]').forEach(b=> b.addEventListener('click', ()=> deleteProduct(b.dataset.delete)));
}

function startEdit(id){
  const p = allProducts.find(x=>x.id===id);
  if(!p) return;
  document.getElementById('formTitle').textContent = 'Edit Product';
  document.getElementById('pId').value = p.id;
  document.getElementById('pName').value = p.name || '';
  document.getElementById('pSlug').value = p.slug || '';
  document.getElementById('pSlug').dataset.touched = '1';
  document.getElementById('pBrandDisplay').value = p.brand_display || '';
  document.getElementById('pBrandKey').value = p.brand_key || '';
  document.getElementById('pModelType').value = p.model_type || '';
  document.getElementById('pPrice').value = p.price || 0;
  document.getElementById('pAvailability').value = p.availability || 'In Stock';
  document.getElementById('pColors').value = p.colors || '';
  document.getElementById('pSizes').value = p.sizes || '';
  document.getElementById('pSizePrices').value = p.size_prices || '';
  document.getElementById('pDescription').value = p.description || '';
  document.getElementById('pTopProduct').checked = Boolean(p.is_top_product);

  const catSelect = document.getElementById('pCategory');
  const known = [...catSelect.options].map(o=>o.value);
  if(known.includes(p.category)){
    catSelect.value = p.category;
    document.getElementById('pCategoryOther').classList.add('hidden');
  }else{
    catSelect.value = '__other__';
    document.getElementById('pCategoryOther').classList.remove('hidden');
    document.getElementById('pCategoryOther').value = p.category || '';
  }

  const safeProductPreviewUrl = safeImageUrl(resolveProductImage(p, p.image_url));
  document.getElementById('photoPreview').innerHTML = safeProductPreviewUrl ? `<img src="${escapeAttr(safeProductPreviewUrl)}" alt="current">` : '<i class="fa-solid fa-image"></i>';
  editingPhotoFile = null;
  setUploadStatus(null);
  document.getElementById('cancelEditBtn').classList.remove('hidden');
  window.scrollTo({top:0, behavior:'smooth'});
}

function resetForm(){
  document.getElementById('productForm').reset();
  document.getElementById('pId').value = '';
  document.getElementById('pSlug').dataset.touched = '';
  document.getElementById('formTitle').textContent = 'Add Product';
  document.getElementById('photoPreview').innerHTML = '<i class="fa-solid fa-image"></i>';
  document.getElementById('pCategoryOther').classList.add('hidden');
  document.getElementById('pColors').value = '';
  document.getElementById('pSizes').value = '';
  document.getElementById('pSizePrices').value = '';
  document.getElementById('cancelEditBtn').classList.add('hidden');
  document.getElementById('pPhoto').value = '';
  editingPhotoFile = null;
  setUploadStatus(null);
  clearMessage('formMsg');
}

document.getElementById('cancelEditBtn').addEventListener('click', resetForm);

async function deleteProduct(id){
  if(!isAllowed('delete_product')) return;
  const ok = await confirmAction('Delete product','This action cannot be undone. Delete this product?');
  if(!ok) return;

  const { error } = await supabaseClient.from('products').delete().eq('id', id);
  if(error){ showToast('err', 'Could not delete: ' + error.message); return; }
  showToast('ok', 'Product deleted.');
  logAdminActionSafe('delete_product', 'products', id, { source: 'admin_ui' });
  loadProducts();
}

document.getElementById('productForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  clearMessage('formMsg');
  if(!validateProductForm()) return;

  if(!isAllowed('edit_product')){
    showToast('err','You do not have permission to save products.');
    return;
  }

  if(!BACKEND_CONFIGURED){
    setMessage('formMsg','err','Backend not configured yet.');
    return;
  }

  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

  try{
    const id = document.getElementById('pId').value;
    const category = document.getElementById('pCategory').value === '__other__'
      ? document.getElementById('pCategoryOther').value.trim()
      : document.getElementById('pCategory').value;

    let imageUrl = null;
    const existing = id ? allProducts.find(p=>p.id===id) : null;
    if(existing) imageUrl = existing.image_url;

    if(editingPhotoFile){
      setUploadStatus('loading', 'Optimizing image...');
      const optimizedFile = await optimizeImageFile(editingPhotoFile);
      setUploadStatus('loading', 'Uploading image...');
      const ext = optimizedFile.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
      const bucketCandidates = ['product-photos', 'product-photo'];
      let uploaded = false;
      for(const bucketName of bucketCandidates){
        const { error: upErr } = await supabaseClient.storage.from(bucketName).upload(path, optimizedFile, { cacheControl:'3600', upsert:false });
        if(!upErr){
          const { data: pub } = supabaseClient.storage.from(bucketName).getPublicUrl(path);
          imageUrl = pub.publicUrl;
          uploaded = true;
          break;
        }
      }
      if(!uploaded) throw new Error('Could not upload image to the configured Storage bucket.');
      setUploadStatus('done', 'Image uploaded successfully.');
    }

    const payload = {
      name: document.getElementById('pName').value.trim(),
      slug: document.getElementById('pSlug').value.trim(),
      brand_display: document.getElementById('pBrandDisplay').value.trim(),
      brand_key: document.getElementById('pBrandKey').value.trim().toLowerCase(),
      model_type: document.getElementById('pModelType').value.trim(),
      category,
      price: Number(document.getElementById('pPrice').value) || 0,
      availability: document.getElementById('pAvailability').value,
      colors: document.getElementById('pColors').value.trim(),
      sizes: document.getElementById('pSizes').value.trim(),
      size_prices: document.getElementById('pSizePrices').value.trim(),
      description: document.getElementById('pDescription').value.trim(),
      image_url: imageUrl || '',
      is_top_product: document.getElementById('pTopProduct').checked
    };

    if(id){
      const { error } = await supabaseClient.from('products').update(payload).eq('id', id);
      if(error) throw error;
      showToast('ok','Product updated.');
      logAdminActionSafe('update_product', 'products', id, {
        source: 'admin_ui',
        slug: payload.slug,
        name: payload.name,
        availability: payload.availability
      });
    }else{
      const { data, error } = await supabaseClient.from('products').insert(payload).select('id').single();
      if(error) throw error;
      showToast('ok','Product created.');
      logAdminActionSafe('create_product', 'products', data?.id || null, {
        source: 'admin_ui',
        slug: payload.slug,
        name: payload.name,
        availability: payload.availability
      });
    }

    setMessage('formMsg','ok','Saved successfully.');
    resetForm();
    loadProducts();
  }catch(err){
    const raw = err?.message || 'Something went wrong.';
    let friendly = raw;

    if(/bucket|not found|does not exist/i.test(raw)){
      friendly = 'Upload bucket issue: create a public Storage bucket named "product-photos" in Supabase.';
    }else if(/row-level security|permission|not allowed|violates/i.test(raw)){
      friendly = 'Permission blocked by Supabase policy. Allow this signed-in role to upload to product-photos and insert/update products.';
    }

    setMessage('formMsg','err', friendly);
    showToast('err', friendly);
    setUploadStatus(null);
  }finally{
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Product';
  }
});

/* ---------- offers ---------- */
function normalizeOfferPriceText(offer){
  const val = (offer?.price_text || '').toString().trim();
  if(!val) return '';
  return val;
}

let offersTableMissingNotified = false;

function isOffersTableMissingError(error){
  const msg = String(error?.message || '').toLowerCase();
  const details = String(error?.details || '').toLowerCase();
  const hint = String(error?.hint || '').toLowerCase();
  return (
    msg.includes("could not find the table 'public.offers'") ||
    msg.includes('relation "offers" does not exist') ||
    details.includes("could not find the table 'public.offers'") ||
    hint.includes('schema cache')
  );
}

async function loadOffers(){
  const tbody = document.getElementById('offersTableBody');
  tbody.innerHTML = skeletonRows(6);

  if(!BACKEND_CONFIGURED || !supabaseClient) return;

  const { data, error } = await supabaseClient
    .from('offers')
    .select('*')
    .order('sort_order', { ascending:true })
    .order('created_at', { ascending:false })
    .limit(1000);

  if(error){
    if(isOffersTableMissingError(error)){
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">Offers table is missing. Run <b>admin2/create_offers_table.sql</b> in Supabase SQL Editor, then refresh this page.</div></td></tr>`;
      if(!offersTableMissingNotified){
        showToast('err', 'Offers table missing. Run admin2/create_offers_table.sql in Supabase SQL Editor.');
        offersTableMissingNotified = true;
      }
      return;
    }

    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">Could not load offers. Ensure the <b>offers</b> table exists and is readable.</div></td></tr>`;
    showToast('err', 'Failed to load offers: ' + error.message);
    return;
  }

  allOffers = data || [];
  state.offers.page = 1;
  renderOffers();
}

function getFilteredOffers(){
  const s = state.offers;
  let list = [...allOffers];
  const q = s.search.toLowerCase();

  if(q){
    list = list.filter(o =>
      (o.title || '').toLowerCase().includes(q) ||
      normalizeOfferPriceText(o).toLowerCase().includes(q)
    );
  }

  if(s.active === 'active') list = list.filter(o => !!o.is_active);
  if(s.active === 'inactive') list = list.filter(o => !o.is_active);

  switch(s.sort){
    case 'title_asc':
      list.sort((a,b)=>(a.title || '').localeCompare(b.title || ''));
      break;
    case 'created_desc':
      list.sort((a,b)=>new Date(b.created_at || 0) - new Date(a.created_at || 0));
      break;
    default:
      list.sort((a,b)=>{
        const sa = Number(a.sort_order || 0);
        const sb = Number(b.sort_order || 0);
        if(sa !== sb) return sa - sb;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
      break;
  }

  return list;
}

function renderOffers(){
  const list = getFilteredOffers();
  const tbody = document.getElementById('offersTableBody');
  const total = list.length;

  document.getElementById('offersCount').textContent = `${total} offer${total===1?'':'s'}`;
  document.getElementById('offersBadge').textContent = total;

  if(!list.length){
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-tag"></i>No offers found.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(o=>{
    const priceText = normalizeOfferPriceText(o);
    const safeTitle = escapeHtml(o.title || '');
    const safeOfferId = escapeAttr(o.id || '');
    const safeImage = safeImageUrl(o.image_url);
    return `
      <tr>
        <td><img class="row-thumb" src="${escapeAttr(safeImage)}" alt="${escapeAttr(o.title || '')}" onerror="this.style.visibility='hidden'"></td>
        <td><b>${safeTitle}</b></td>
        <td>${priceText ? `KES ${escapeHtml(priceText)} +VAT` : '<span class="muted">Ask price</span>'}</td>
        <td>${o.is_active ? '<span class="badge badge-ok">Active</span>' : '<span class="badge badge-warn">Inactive</span>'}</td>
        <td>${Number(o.sort_order || 0)}</td>
        <td class="row-actions">
          ${isAllowed('edit_offer') ? `<button data-offer-edit="${safeOfferId}" title="Edit"><i class="fa-solid fa-pen"></i></button>` : ''}
          ${isAllowed('delete_offer') ? `<button data-offer-delete="${safeOfferId}" title="Delete"><i class="fa-solid fa-trash"></i></button>` : ''}
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('[data-offer-edit]').forEach(b=> b.addEventListener('click', ()=> startOfferEdit(b.dataset.offerEdit)));
  tbody.querySelectorAll('[data-offer-delete]').forEach(b=> b.addEventListener('click', ()=> deleteOffer(b.dataset.offerDelete)));
}

function startOfferEdit(id){
  const offer = allOffers.find(x=>x.id===id);
  if(!offer) return;

  document.getElementById('offerFormTitle').textContent = 'Edit Offer / Deal';
  document.getElementById('oId').value = offer.id;
  document.getElementById('oTitle').value = offer.title || '';
  document.getElementById('oPriceText').value = normalizeOfferPriceText(offer);
  document.getElementById('oPriceNumber').value = '';
  document.getElementById('oWhatsappText').value = offer.whatsapp_text || '';
  document.getElementById('oSortOrder').value = Number(offer.sort_order || 0);
  document.getElementById('oIsActive').checked = !!offer.is_active;
  const safeOfferPreviewUrl = safeImageUrl(offer.image_url);
  document.getElementById('offerPhotoPreview').innerHTML = safeOfferPreviewUrl ? `<img src="${escapeAttr(safeOfferPreviewUrl)}" alt="current">` : '<i class="fa-solid fa-image"></i>';
  document.getElementById('cancelOfferEditBtn').classList.remove('hidden');
  editingOfferPhotoFile = null;
  document.getElementById('oPhoto').value = '';
  setOfferUploadStatus(null);
  clearMessage('offerFormMsg');
  switchTab('offers');
  window.scrollTo({ top:0, behavior:'smooth' });
}

function resetOfferForm(){
  document.getElementById('offerForm').reset();
  document.getElementById('oId').value = '';
  document.getElementById('offerFormTitle').textContent = 'Add Offer / Deal';
  document.getElementById('offerPhotoPreview').innerHTML = '<i class="fa-solid fa-image"></i>';
  document.getElementById('cancelOfferEditBtn').classList.add('hidden');
  document.getElementById('oPhoto').value = '';
  document.getElementById('oSortOrder').value = '0';
  document.getElementById('oIsActive').checked = true;
  editingOfferPhotoFile = null;
  setOfferUploadStatus(null);
  clearMessage('offerFormMsg');
  setRequiredError('oTitle', false);
}

document.getElementById('cancelOfferEditBtn').addEventListener('click', resetOfferForm);

async function deleteOffer(id){
  if(!isAllowed('delete_offer')) return;
  const ok = await confirmAction('Delete offer', 'This action cannot be undone. Delete this offer?');
  if(!ok) return;

  const { error } = await supabaseClient.from('offers').delete().eq('id', id);
  if(error){
    showToast('err', 'Could not delete offer: ' + error.message);
    return;
  }
  showToast('ok', 'Offer deleted.');
  logAdminActionSafe('delete_offer', 'offers', id, { source: 'admin_ui' });
  loadOffers();
}

document.getElementById('offerForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  clearMessage('offerFormMsg');

  const title = document.getElementById('oTitle').value.trim();
  setRequiredError('oTitle', !title);
  if(!title) return;

  if(!isAllowed('edit_offer')){
    showToast('err', 'You do not have permission to save offers.');
    return;
  }

  const saveBtn = document.getElementById('saveOfferBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

  try{
    const id = document.getElementById('oId').value;
    const current = id ? allOffers.find(o=>o.id===id) : null;
    let imageUrl = current?.image_url || '';

    if(editingOfferPhotoFile){
      setOfferUploadStatus('loading', 'Optimizing image...');
      const optimizedFile = await optimizeImageFile(editingOfferPhotoFile);
      setOfferUploadStatus('loading', 'Uploading image...');
      const ext = (optimizedFile.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `offers/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
      const bucketCandidates = ['offer-photos', 'offers', 'product-photos', 'product-photo'];
      let uploaded = false;
      for(const bucketName of bucketCandidates){
        const { error: upErr } = await supabaseClient.storage.from(bucketName).upload(path, optimizedFile, { cacheControl:'3600', upsert:false });
        if(!upErr){
          const { data: pub } = supabaseClient.storage.from(bucketName).getPublicUrl(path);
          imageUrl = pub.publicUrl;
          uploaded = true;
          break;
        }
      }
      if(!uploaded) throw new Error('Could not upload image to an offer storage bucket.');
      setOfferUploadStatus('done', 'Image uploaded successfully.');
    }

    const directPriceText = document.getElementById('oPriceText').value.trim();
    const numericPrice = Number(document.getElementById('oPriceNumber').value || 0);
    const normalizedPriceText = directPriceText || (numericPrice > 0 ? String(numericPrice) : '');

    const payload = {
      title,
      price_text: normalizedPriceText,
      image_url: imageUrl,
      whatsapp_text: document.getElementById('oWhatsappText').value.trim(),
      sort_order: Number(document.getElementById('oSortOrder').value || 0),
      is_active: document.getElementById('oIsActive').checked
    };

    if(id){
      const { error } = await supabaseClient.from('offers').update(payload).eq('id', id);
      if(error) throw error;
      showToast('ok', 'Offer updated.');
      logAdminActionSafe('update_offer', 'offers', id, {
        source: 'admin_ui',
        title: payload.title,
        is_active: payload.is_active,
        sort_order: payload.sort_order
      });
    }else{
      const { data, error } = await supabaseClient.from('offers').insert(payload).select('id').single();
      if(error) throw error;
      showToast('ok', 'Offer created.');
      logAdminActionSafe('create_offer', 'offers', data?.id || null, {
        source: 'admin_ui',
        title: payload.title,
        is_active: payload.is_active,
        sort_order: payload.sort_order
      });
    }

    setMessage('offerFormMsg', 'ok', 'Saved successfully.');
    resetOfferForm();
    loadOffers();
  }catch(err){
    const raw = err?.message || 'Something went wrong while saving offer.';
    let friendly = raw;
    if(/relation|table|offers/i.test(raw)){
      friendly = 'Offers table is missing or not accessible. Create a Supabase table named "offers" and allow read/write for your role.';
    }else if(/row-level security|permission|not allowed|violates/i.test(raw)){
      friendly = 'Permission blocked by Supabase policy. Allow this signed-in role to insert/update offers and upload offer images.';
    }else if(/bucket|storage|upload/i.test(raw)){
      friendly = 'Offer image upload failed. Create a public Storage bucket like "offer-photos" and permit uploads.';
    }
    setMessage('offerFormMsg', 'err', friendly);
    showToast('err', friendly);
    setOfferUploadStatus(null);
  }finally{
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Offer';
  }
});

/* ---------- leads ---------- */
async function loadLeads(){
  const tbody = document.getElementById('leadsTableBody');
  tbody.innerHTML = skeletonRows(7);

  if(!BACKEND_CONFIGURED || !supabaseClient) return;

  const { data, error } = await supabaseClient.from('leads').select('*').order('created_at', { ascending:false });
  if(error){
    showToast('err', 'Failed to load enquiries: ' + error.message);
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">Could not load enquiries.</div></td></tr>`;
    return;
  }

  allLeads = data || [];
  state.leads.page = 1;
  renderLeads();
  updateAnalytics();
}

function getFilteredLeads(){
  const s = state.leads;
  let list = [...allLeads];
  const q = s.search.toLowerCase();
  if(q){
    list = list.filter(l =>
      (l.name || '').toLowerCase().includes(q) ||
      (l.email || '').toLowerCase().includes(q) ||
      (l.phone || '').toLowerCase().includes(q) ||
      (l.message || '').toLowerCase().includes(q)
    );
  }

  if(s.source){
    list = list.filter(l => (l.source === 'newsletter' ? 'Newsletter' : 'Contact Form') === s.source);
  }

  switch(s.sort){
    case 'date_asc': list.sort((a,b)=> new Date(a.created_at) - new Date(b.created_at)); break;
    case 'name_asc': list.sort((a,b)=> (a.name || '').localeCompare(b.name || '')); break;
    default: list.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
  }

  return list;
}

function renderLeads(){
  const list = getFilteredLeads();
  const tbody = document.getElementById('leadsTableBody');
  const s = state.leads;
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / s.pageSize));
  if(s.page > pages) s.page = pages;
  const start = (s.page - 1) * s.pageSize;
  const pageList = list.slice(start, start + s.pageSize);

  document.getElementById('leadsBadge').textContent = total;
  document.getElementById('leadsPageInfo').textContent = `Page ${s.page} of ${pages}`;
  document.getElementById('leadsPrevBtn').disabled = s.page <= 1;
  document.getElementById('leadsNextBtn').disabled = s.page >= pages;

  if(!pageList.length){
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-inbox"></i>No enquiries found.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = pageList.map(l=>{
    const safeLeadId = escapeAttr(l.id || '');
    return `
    <tr>
      <td>${escapeHtml(new Date(l.created_at).toLocaleString())}</td>
      <td>${l.source === 'newsletter' ? '<span class="badge badge-soon">Newsletter</span>' : '<span class="badge badge-ok">Contact Form</span>'}</td>
      <td>${escapeHtml(l.name || '�')}</td>
      <td>${escapeHtml(l.phone || '�')}</td>
      <td>${escapeHtml(l.email || '�')}</td>
      <td style="max-width:280px; white-space:normal;">${escapeHtml(l.message || '�')}</td>
      <td class="row-actions">
        ${isAllowed('delete_lead') ? `<button data-lead-delete="${safeLeadId}" title="Delete"><i class="fa-solid fa-trash"></i></button>` : ''}
      </td>
    </tr>
  `;
  }).join('');

  tbody.querySelectorAll('[data-lead-delete]').forEach(btn=> btn.addEventListener('click', async ()=>{
    const ok = await confirmAction('Delete enquiry','Delete this enquiry?');
    if(!ok) return;
    await supabaseClient.from('leads').delete().eq('id', btn.dataset.leadDelete);
    showToast('ok','Enquiry deleted.');
    logAdminActionSafe('delete_lead', 'leads', btn.dataset.leadDelete, { source: 'admin_ui' });
    loadLeads();
  }));

  window._leadsCache = list;
}

async function deleteLeadIds(ids){
  const batchSize = 100;
  for(let i = 0; i < ids.length; i += batchSize){
    const chunk = ids.slice(i, i + batchSize);
    const { error } = await supabaseClient.from('leads').delete().in('id', chunk);
    if(error) throw error;
  }
}

async function deleteFilteredLeads(){
  if(!isAllowed('delete_lead')){
    showToast('err', 'You do not have permission to delete enquiries.');
    return;
  }

  const list = getFilteredLeads();
  if(!list.length){
    showToast('err', 'No enquiries to delete for current filters.');
    return;
  }

  const total = list.length;
  const label = total === 1 ? 'enquiry' : 'enquiries';
  const ok = await confirmAction(
    'Delete enquiries',
    `Delete ${total} ${label} from current results? This action cannot be undone.`
  );
  if(!ok) return;

  try{
    const ids = list.map(l => l.id);
    await deleteLeadIds(ids);
    showToast('ok', `${total} ${label} deleted.`);
    logAdminActionSafe('bulk_delete_leads', 'leads', null, {
      source: 'admin_ui',
      deleted_count: total,
      ids
    });
    loadLeads();
  }catch(error){
    showToast('err', 'Could not delete enquiries: ' + error.message);
  }
}

/* ---------- table controls ---------- */
document.getElementById('prodSearch').addEventListener('input', (e)=>{ state.products.search = e.target.value; state.products.page = 1; renderProducts(); });
document.getElementById('prodFilterAvailability').addEventListener('change', (e)=>{ state.products.availability = e.target.value; state.products.page = 1; renderProducts(); });
document.getElementById('prodSort').addEventListener('change', (e)=>{ state.products.sort = e.target.value; state.products.colSort = {col:'',dir:1}; state.products.page = 1; renderProducts(); });
document.getElementById('prodPrevBtn').addEventListener('click', ()=>{ state.products.page--; renderProducts(); });
document.getElementById('prodNextBtn').addEventListener('click', ()=>{ state.products.page++; renderProducts(); });

document.getElementById('offersSearch').addEventListener('input', (e)=>{ state.offers.search = e.target.value; renderOffers(); });
document.getElementById('offersFilterActive').addEventListener('change', (e)=>{ state.offers.active = e.target.value; renderOffers(); });
document.getElementById('offersSort').addEventListener('change', (e)=>{ state.offers.sort = e.target.value; renderOffers(); });

document.querySelectorAll('#prodTable thead .sortable').forEach(th=> th.addEventListener('click', ()=>{
  const col = th.dataset.col;
  if(state.products.colSort.col === col){
    state.products.colSort.dir *= -1;
  }else{
    state.products.colSort = {col, dir:1};
  }
  renderProducts();
}));

document.getElementById('leadsSearch').addEventListener('input', (e)=>{ state.leads.search = e.target.value; state.leads.page = 1; renderLeads(); });
document.getElementById('leadsFilterSource').addEventListener('change', (e)=>{ state.leads.source = e.target.value; state.leads.page = 1; renderLeads(); });
document.getElementById('leadsSort').addEventListener('change', (e)=>{ state.leads.sort = e.target.value; state.leads.page = 1; renderLeads(); });
document.getElementById('leadsPrevBtn').addEventListener('click', ()=>{ state.leads.page--; renderLeads(); });
document.getElementById('leadsNextBtn').addEventListener('click', ()=>{ state.leads.page++; renderLeads(); });

document.getElementById('refreshLeadsBtn').addEventListener('click', loadLeads);
document.getElementById('importIndexBtn').addEventListener('click', importProductsFromIndex);
document.getElementById('exportLeadsBtn').addEventListener('click', ()=>{
  const list = window._leadsCache || [];
  if(!list.length){ showToast('err','No enquiries to export yet.'); return; }
  const rows = [['Date','Source','Name','Phone','Email','Message'], ...list.map(l=>[
    new Date(l.created_at).toLocaleString(), l.source, l.name||'', l.phone||'', l.email||'', (l.message||'').replace(/\n/g,' ')
  ])];
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `frontline-enquiries-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  showToast('ok','CSV exported.');
});
document.getElementById('deleteFilteredLeadsBtn').addEventListener('click', deleteFilteredLeads);

async function initAdminApp(){
  await loadRuntimeConfig();
  initSupabaseClient();
  registerAuthStateListener();
  checkSession();
}

initAdminApp();