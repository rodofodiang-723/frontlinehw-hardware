/* ===================== DATA ===================== */
const IMG = (seed,w=800,h=600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;


const deals = [
 ["Moment Bathroom Door Lock with Handle (Silver)", "1,000", "assets/optimized/inline-011.jpg"],
 ["Union Lever Lockset (Satin Nickel)", "3,000", "assets/optimized/inline-012.jpg"],
 ["Moment Bathroom Door Lock with Handle (Antique Bronze)", "1,000", "assets/optimized/inline-013.jpg"],
 ["Total P20S Cordless Drill Set 2.0Ah", null, "assets/optimized/inline-014.jpg"],
 ["Total P20S Cordless Circular Saw", null, "assets/optimized/inline-015.jpg"],
 ["Pattex Polyurethane Marine Adhesive (PUR Wood Glue)", "1,000", "assets/optimized/inline-016.jpg"],
 ["Union Lever Lockset (Black)", "3,000", "assets/optimized/inline-017.jpg"],
 ["Total P20S Cordless Drill (12V, Tool Only)", null, "assets/optimized/inline-018.jpg"],
 ["Total P20S 4-Pole Cordless Angle Grinder 115mm", null, "assets/optimized/inline-019.jpg"]
];

const categories = [
 "Power Tools","Hand Tools","Plumbing Supplies","Electrical Materials","Paint Supplies","Building Materials",
 "Cordless Tools","Air Pressure Tools & Compressors","Cleaning Tools",
 "Measuring & Detection Tools","Welding Equipment","Ladders","Bathroom Accessories",
 "Kitchen Accessories","Cabinet Fittings","Door Locks & Security","Curtain Fittings",
 "Safety Gear","Fasteners","Water Systems"
];

const brands = [
  {name:"Black & Decker", slug:"black_decker"},
  {name:"Ponal", slug:"ponal"},
  {name:"Fevicol", slug:"fevicol"},
  {name:"Makita", slug:"makita"},
  {name:"Power Eagle", slug:"power_eagle"},
  {name:"Stanley", slug:"stanley"},
  {name:"Dremel", slug:"dremel"},
  {name:"Tolsen", slug:"tolsen"},
  {name:"Hilti", slug:"hilti"},
  {name:"CAT", slug:"cat"},
  {name:"DeWalt", slug:"dewalt"},
  {name:"Union", slug:"union"},
  {name:"Soma Fix", slug:"somafix"},
  {name:"Ryobi", slug:"ryobi"},
  {name:"DCA", slug:"dca"},
  {name:"Husqvarna", slug:"husqvarna"},
  {name:"Irwin Tools", slug:"irwin"},
  {name:"Yale", slug:"yale"},
  {name:"INGCO", slug:"ingco"},
  {name:"Anant", slug:"anant"},
  {name:"5-Line", slug:"sline"},
  {name:"Moment", slug:"moment"},
  {name:"Fealty", slug:"fealty"},
  {name:"Oxford", slug:"oxford"},
  {name:"Seweco", slug:"seweco"},
  {name:"Total", slug:"total"}
];

/* ===================== BUILD: HOME PAGE SECTIONS ===================== */
const _yearEl = document.getElementById('year');
if(_yearEl) _yearEl.textContent = new Date().getFullYear();

document.getElementById('shareSiteBtn')?.addEventListener('click', async ()=>{
  const shareData = {
    title: document.title,
    text: 'Frontline Hardware Nairobi - tools, building materials, paints, locks and construction supplies.',
    url: window.location.href.split('#')[0]
  };
  const statusEl = document.getElementById('shareStatus');
  try{
    if(typeof navigator.share === 'function'){
      await navigator.share(shareData);
      if(statusEl) statusEl.textContent = 'Thanks for sharing Frontline Hardware.';
      return;
    }
    await navigator.clipboard.writeText(shareData.url);
    if(statusEl) statusEl.textContent = 'Website link copied. You can paste it into any social app.';
  }catch(error){
    if(error?.name !== 'AbortError' && statusEl) statusEl.textContent = 'Sharing was cancelled.';
  }
});

// Default Frequently Asked Questions (used when no external `site-config.json` or runtime data provides `window.faqs`)
if(!Array.isArray(window.faqs)){
  window.faqs = [
    ['How long does delivery take?', 'Delivery within Nairobi typically takes 1–2 business days. For out-of-town deliveries please allow 3–5 business days depending on location.'],
    ['Do you offer installation services?', 'Yes — we provide design, measurement and installation for fitted furniture and wardrobes. Contact us via WhatsApp to arrange a site visit and quote.'],
    ['What payment methods do you accept?', 'We accept M-Pesa, bank transfers and card payments in-store. For bulk/site orders we can invoice qualified customers.'],
    ['Can I request a bulk or trade discount?', 'Yes — use the Get a Trade Quote button or WhatsApp us with your requirements and quantities and we will prepare a tailored quote.'],
    ['What is your returns policy?', 'Returns are accepted within 7 days for unopened items. Custom or made-to-order products are non-refundable — contact support to discuss any issues.'],
    ['Do you provide warranty on tools?', 'Most branded tools include manufacturer warranty. Warranty terms vary by brand — contact us with the product model for details.']
  ];
}

function slugifyCat(c){ return c.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-+|-+$)/g,''); }
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
    if(parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'file:') return parsed.href;
  }catch(_err){
    return '';
  }
  return '';
}
function safeLinkUrl(url){
  const raw = String(url || '').trim();
  if(!raw) return '';
  try{
    const parsed = new URL(raw, window.location.href);
    if(parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
    if(parsed.origin === window.location.origin) return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return parsed.href;
  }catch(_err){
    return '';
  }
}
function resolveProductImage(product, fallback){
  return fallback || '';
}
function sanitizeText(value, maxLen=120){
  const clean = String(value || '').replace(/\s+/g, ' ').trim();
  return clean.length > maxLen ? clean.slice(0, maxLen) : clean;
}
// Helper: enable loop only when there are enough slides to actually loop
function shouldEnableLoop(swiperSelector, minSlides = 2){
  try{
    const container = document.querySelector(swiperSelector);
    if(!container) return false;
    const count = container.querySelectorAll('.swiper-slide').length;
    return count >= Math.max(1, minSlides);
  }catch(err){ return false; }
}
function goToCategory(cat){
  location.hash = '#cat-' + slugifyCat(cat);
  routeFromHash();
}

// offers & deals
let dealsSwiper = null;
function renderDeals(dealRows){
  document.getElementById('dealsGrid').innerHTML = dealRows.map((d)=>{
    const safeTitle = String(d[0] || '').trim();
    const safeImage = safeImageUrl(d[2]);
    const cleanPrice = (d[1] || '').toString().trim();
    const priceText = cleanPrice ? `KES ${cleanPrice} +VAT` : 'Ask for price';
    const waText = (d[3] || '').toString().trim() || (
      cleanPrice
        ? `Hi Frontline Hardware, I want to order: ${safeTitle} (KES ${cleanPrice} +VAT)`
        : `Hi Frontline Hardware, I want to order: ${safeTitle}. Please confirm price and availability.`
    );
    return `
 <div class="swiper-slide">
   <a class="deal-card" href="https://wa.me/254727791535?text=${encodeURIComponent(waText)}" target="_blank" rel="noopener" aria-label="Order ${escapeAttr(safeTitle)} on WhatsApp">
     <div class="duo-wrap"><img src="${escapeAttr(safeImage)}" loading="lazy" alt="${escapeAttr(safeTitle)}"></div>
     <span class="deal-tag">${escapeHtml(priceText)}</span>
     <div class="deal-body"><h3>${escapeHtml(safeTitle)}</h3><span class="deal-cta"><i class="fa-brands fa-whatsapp"></i> Order on WhatsApp <i class="fa-solid fa-arrow-right"></i></span></div>
   </a>
 </div>`;
  }).join('');

  if(dealsSwiper){
    dealsSwiper.destroy(true, true);
  }
  // Require at least 4 slides for the large-breakpoint layout to enable loop
  const dealsLoop = shouldEnableLoop('.deals-swiper', 4);
  dealsSwiper = new Swiper('.deals-swiper', {
    slidesPerView:1.3, spaceBetween:18, loop: dealsLoop,
    pagination:{ el:'.deals-swiper .swiper-pagination', clickable:true },
    autoplay:{ delay:2800, disableOnInteraction:false },
    breakpoints:{ 560:{slidesPerView:2.2, spaceBetween:18}, 900:{slidesPerView:3.2, spaceBetween:20}, 1200:{slidesPerView:4.2, spaceBetween:22} }
  });
}
renderDeals(deals);

// brands (duplicated for seamless marquee)
const brandLogoData = {
  black_decker: "assets/optimized/inline-020.jpg",
  ponal: "assets/optimized/inline-021.jpg",
  fevicol: "assets/optimized/inline-022.jpg",
  makita: "assets/optimized/inline-023.jpg",
  power_eagle: "assets/optimized/inline-024.jpg",
  stanley: "assets/optimized/inline-025.jpg",
  dremel: "assets/optimized/inline-026.jpg",
  tolsen: "assets/optimized/inline-027.jpg",
  hilti: "assets/optimized/inline-028.jpg",
  cat: "assets/optimized/inline-029.jpg",
  dewalt: "assets/optimized/inline-030.jpg",
  union: "assets/optimized/inline-031.jpg",
  somafix: "assets/optimized/inline-032.jpg",
  ryobi: "assets/optimized/inline-033.jpg",
  dca: "assets/optimized/inline-034.jpg",
  husqvarna: "assets/optimized/inline-035.jpg",
  irwin: "assets/optimized/inline-036.jpg",
  yale: "assets/optimized/inline-037.jpg",
  ingco: "assets/optimized/inline-038.jpg",
  anant: "assets/optimized/inline-039.jpg"
};
const brandHtml = brands.map((b)=>{
  const logoSrc = safeImageUrl(brandLogoData[b.slug] || '');
  if(!logoSrc) return '';
  return `<div class="brand-item"><img src="${escapeAttr(logoSrc)}" loading="lazy" alt="${escapeAttr(b.name)}"></div>`;
}).join('');

const brandTrack = document.getElementById('brandTrack');
const brandTrack2 = document.getElementById('brandTrack2');
if(brandTrack) brandTrack.innerHTML = brandHtml + brandHtml;
if(brandTrack2) brandTrack2.innerHTML = brandHtml + brandHtml;


// products + filters

// gallery with multiple images per service
const gallery = [
 {id: "interior_design", title: "Interior Design", images: [
   "gallery-images/pexels-artbovich-6444240.jpg",
   "gallery-images/pexels-cottonbro-5089159.jpg",
   "gallery-images/pexels-essentia-media-2154502099-33529500.jpg",
   "gallery-images/pexels-ian-panelo-4567378.jpg",
   "gallery-images/pexels-kseniachernaya-5691518.jpg",
   "gallery-images/pexels-kseniachernaya-5691535.jpg"
 ]},
 {id: "renovation_remodeling", title: "Renovation & Remodeling", images: [
   "gallery-images/pexels-quintingellar-313773.jpg",
   "gallery-images/pexels-tima-miroshnichenko-6790759.jpg",
   "gallery-images/pexels-tima-miroshnichenko-6790048.jpg",
   "gallery-images/pexels-ron-lach-8817852.jpg",
   "gallery-images/pexels-ian-panelo-4567378.jpg",
   "gallery-images/pexels-kseniachernaya-5691518.jpg",
   "gallery-images/pexels-kseniachernaya-5691535.jpg",
   "gallery-images/pexels-marcelo-gonzalez-1141370437-37681628.jpg"
 ]},
 {id: "construction_fitouts", title: "Construction & Fit-Outs", images: [
   "gallery-images/pexels-tima-miroshnichenko-6790048.jpg",
   "gallery-images/pexels-tima-miroshnichenko-6790759.jpg",
   "gallery-images/pexels-ron-lach-8817852.jpg",
   "gallery-images/pexels-marcelo-gonzalez-1141370437-37681628.jpg",
   "gallery-images/pexels-quintingellar-313773.jpg"
 ]},
 {id: "professional_installation", title: "Professional Installation", images: [
   "gallery-images/pexels-essentia-media-2154502099-33685863.jpg",
   "gallery-images/pexels-pinar-demir-1585909256-34117279.jpg",
   "gallery-images/pexels-the-ghazi-2152398165-32177982.jpg",
   "gallery-images/pexels-thembaforfun-20433513.jpg",
   "gallery-images/pexels-valentin-ivantsov-2154772556-36035073.jpg"
 ]}
];

// Images embedded in gallery array above

function renderGallerySlides(galleryRows){
  const grid = document.getElementById('galleryGrid');
  if(!grid) return;

  grid.innerHTML = galleryRows.slice(0, 4).map((service, index)=>{
    const isInteriorDesign = index === 0;
    const images = service.images || [];
    const title = service.title || 'Service';
    const descriptions = [
      'Fluted panels, boards, and finishes brought together for a considered interior scheme.',
      'A practical renovation palette built around durable materials and clean finishing details.',
      'Construction and fit-out materials selected for dependable progress from first fix to final finish.',
      'A coordinated installation approach that takes a project from measurement through final fitting.'
    ];
    const serviceActions = `
      <div class="service-card-actions" data-service-actions>
        <a href="#contact" class="btn btn-primary btn-sm">Book a Site Visit</a>
        <a href="#gallery" class="btn btn-outline-dark btn-sm" data-open-project-gallery>View Case Study</a>
      </div>`;
    
    if(isInteriorDesign && images.length > 1) {
      // Create carousel for interior design
      return `
 <div class="swiper-slide">
 <article class="service-card" data-service-index="${index}">
   <div class="service-card-media interior-design-carousel">
     <div class="swiper interior-carousel-swiper" data-carousel-id="interior-carousel">
       <div class="swiper-wrapper">
         ${images.map((img, imageIndex) => `<div class="swiper-slide"><img src="${escapeAttr(encodeURI(img))}" loading="${imageIndex === 0 ? 'eager' : 'lazy'}" decoding="async" alt="${escapeAttr(title)}"></div>`).join('')}
       </div>
       <div class="swiper-pagination interior-carousel-pagination"></div>
     </div>
   </div>
  <div class="service-card-body"><span class="service-number">${String(index + 1).padStart(2, '0')}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(descriptions[index] || '')}</p>${serviceActions}</div>
 </article>
 </div>
`;
    } else {
      // Single image for other services
      return `
 <div class="swiper-slide">
 <article class="service-card" data-service-index="${index}">
  <div class="service-card-media"><img src="${escapeAttr(images[0] || '')}" loading="lazy" decoding="async" alt="${escapeAttr(title)}"></div>
  <div class="service-card-body"><span class="service-number">${String(index + 1).padStart(2, '0')}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(descriptions[index] || '')}</p>${serviceActions}</div>
 </article>
 </div>
`;
    }
  }).join('');

  grid.onclick = (event) => {
    const projectsLink = event.target.closest('[data-open-project-gallery]');
    if(projectsLink){
      event.preventDefault();
      event.stopPropagation();
      const card = projectsLink.closest('.service-card');
      const service = galleryRows[Number(card?.dataset.serviceIndex)];
      const modal = document.getElementById('interiorGalleryModal');
      const galleryGrid = document.getElementById('interiorGalleryGrid');
      const galleryTitle = document.getElementById('interiorGalleryTitle');
      if(modal && galleryGrid && service){
        galleryGrid.innerHTML = (service.images || []).map((image, imageIndex) => `<img src="${escapeAttr(encodeURI(image))}" loading="lazy" decoding="async" alt="${escapeAttr(service.title || 'Project')} ${imageIndex + 1}">`).join('');
        if(galleryTitle) galleryTitle.textContent = `${service.title || 'Project'} Projects`;
        modal.hidden = false;
        modal.classList.add('open');
      }
      return;
    }
  };

  const galleryModal = document.getElementById('interiorGalleryModal');
  const closeGalleryModal = () => {
    if(!galleryModal) return;
    galleryModal.classList.remove('open');
    galleryModal.hidden = true;
  };
  document.getElementById('interiorGalleryClose')?.addEventListener('click', closeGalleryModal);
  galleryModal?.addEventListener('click', (event) => {
    if(event.target === galleryModal) closeGalleryModal();
  });

  // Initialize interior design carousel
  setTimeout(() => {
    const interiorCarousel = document.querySelector('.interior-carousel-swiper');
    if(interiorCarousel && window.Swiper) {
      new Swiper('.interior-carousel-swiper', {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        pagination: { el: '.interior-carousel-pagination', clickable: true },
        autoplay: { delay: 4000, disableOnInteraction: false }
      });
    }
  }, 100);

  if(window.serviceSwiper && typeof window.serviceSwiper.destroy === 'function'){
    window.serviceSwiper.destroy(true, true);
  }
  window.serviceSwiper = new Swiper('.service-swiper', {
    slidesPerView:1,
    spaceBetween:18,
    loop:galleryRows.length > 1,
    preventClicks:false,
    preventClicksPropagation:false,
    pagination:{ el:'.service-pagination', clickable:true },
    navigation:{ nextEl:'.service-swiper-next', prevEl:'.service-swiper-prev' },
    autoplay:{ delay:3000, disableOnInteraction:false },
    keyboard:{ enabled:true }
  });
}

const heroBackgroundImages = [
  'gallery-images/Never underestimate the power of this compact lineup__.jfif',
  'gallery-images/Laminate_ all you need to know about decorative laminate _ Oberflex.jfif',
  'gallery-images/download.jfif',
  'gallery-images/Fluted wall panel and marble sheet.jfif',
  'gallery-images/pexels-ian-panelo-4567378.jpg'
];

function applyHeroBackgroundImage(imageUrls){
  const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
  const safeUrls = urls.map(safeImageUrl).filter(Boolean);
  if(!safeUrls.length) return;
  document.querySelectorAll('#heroSlider .hero-slide img').forEach((slideImage, index)=>{
    slideImage.src = safeUrls[index % safeUrls.length];
    slideImage.alt = 'Frontline hero image';
  });
}

applyHeroBackgroundImage(heroBackgroundImages);

function applyProjectGalleryConfig(items){
  const runtimeRows = [];
  const runtimeMap = {};

  items.forEach((item, idx)=>{
    const title = sanitizeText(item?.title || '', 120);
    const imageUrl = safeImageUrl(item?.imageUrl || '');
    if(!title || !imageUrl) return;
    const key = `runtime_gallery_${idx + 1}`;
    runtimeRows.push([key, title]);
    runtimeMap[key] = imageUrl;
  });

  if(runtimeRows.length){
    renderGallerySlides(runtimeRows, runtimeMap);
  }
}

renderGallerySlides(gallery);

// Render testimonials safely — handle missing/invalid `testimonials` data
const testiWrapper = document.getElementById('testiWrapper');
function renderTestimonials(sourceData){
  if(!testiWrapper) return;
  let testiData = sourceData || window.testimonials;
  if(!Array.isArray(testiData) || !testiData.length){
    testiWrapper.innerHTML = '<div class="reviews-empty">Verified Google reviews will appear here after the Google Business Profile is connected.</div>';
    return;
  }
  testiWrapper.innerHTML = testiData.map((t)=>{
    const stars = '★'.repeat(Math.max(0, Math.min(5, Number(t[3] || t[3] === 0 ? t[3] : 5)))) + '☆'.repeat(Math.max(0, 5 - (Number(t[3]) || 5)));
    const personName = String(t[1] || 'Customer');
    const quote = String(t[2] || '');
    return `
 <div class="swiper-slide">
   <div class="testi-card">
     <div class="stars">${stars}</div>
     <p class="testi-quote">${escapeHtml(quote)}</p>
     <div class="testi-person">
       <img src="${IMG('person-'+personName.replace(/\s/g,''),80,80)}" loading="lazy" alt="${escapeAttr(personName)}">
       <div><b>${escapeHtml(personName)}</b><span>${escapeHtml(t[0] || '')}</span></div>
     </div>
   </div>
 </div>`;
  }).join('');
}
renderTestimonials();

// Ensure testimonial swiper loop only enabled when enough slides
// Testimonials show up to 3 per view on wide screens — require 3 slides for loop
let testiSwiper = null;
function initTestiSwiper(){
  const testiLoop = shouldEnableLoop('.testi-swiper', 3);
  if(testiSwiper && typeof testiSwiper.destroy === 'function'){
    testiSwiper.destroy(true, true);
  }
  testiSwiper = new Swiper('.testi-swiper', {
    slidesPerView:1, spaceBetween:20, loop: testiLoop,
    pagination:{ el:'.swiper-pagination', clickable:true },
    breakpoints:{ 768:{slidesPerView:2}, 1100:{slidesPerView:3} }
  });
}
initTestiSwiper();

let easySellSwiper = null;
function initEasySellSwiper(){
  const easySellSelector = '.easy-sell-swiper';
  if(!document.querySelector(easySellSelector)) return;
  if(easySellSwiper && typeof easySellSwiper.destroy === 'function'){
    easySellSwiper.destroy(true, true);
  }
  const easySellLoop = shouldEnableLoop(easySellSelector, 2);
  easySellSwiper = new Swiper(easySellSelector, {
    slidesPerView:1.1, spaceBetween:18, loop: easySellLoop,
    autoplay:{ delay:3100, disableOnInteraction:false },
    pagination:{ el:'.easy-sell-pagination', clickable:true },
    breakpoints:{ 560:{slidesPerView:2.1, spaceBetween:18}, 900:{slidesPerView:3.1, spaceBetween:20}, 1200:{slidesPerView:4, spaceBetween:22} }
  });
}

document.addEventListener('click', (event) => {
  const toggleButton = event.target.closest('[data-card-toggle]');
  if (!toggleButton) return;

  const card = toggleButton.closest('.easy-card');
  if (!card) return;

  const details = card.querySelector('.card-details');
  if (!details) return;

  const isOpen = details.style.display === 'block';
  details.style.display = isOpen ? 'none' : 'block';
  toggleButton.textContent = isOpen ? 'View Details' : 'Hide Details';
});

function renderLiveTopProducts(rows){
  const wrapper = document.querySelector('.easy-sell-swiper .swiper-wrapper');
  if(!wrapper || !Array.isArray(rows) || !rows.length) return;

  wrapper.innerHTML = rows.map(p=>{
    const name = String(p.name || '').trim();
    const image = resolveLiveProductImage(p);
    const price = Number(p.price || 0);
    const priceText = price > 0 ? `KES ${price.toLocaleString()}` : 'Price on request';
    const details = String(p.description || '').trim();
    const waText = `Hi Frontline Hardware, I want to buy: ${name}${price > 0 ? ` (KES ${price.toLocaleString()})` : ''}`;
    return `<article class="swiper-slide easy-card">
      <img src="${escapeAttr(image || 'google-preview-icon.svg')}" alt="${escapeAttr(name)}" loading="lazy">
      <h4>${escapeHtml(name)}</h4>
      <div class="price">${escapeHtml(priceText)}</div>
      <div class="card-details" style="display:none; margin-top:10px; padding:10px; background:#f5f5f5; border-radius:4px; font-size:.9em;">
        <p>${escapeHtml(details || 'Product details available on request.')}</p>
      </div>
      <div class="card-cta">
        <button class="btn btn-primary btn-sm" type="button" data-top-details>View Details</button>
        <a href="https://wa.me/254727791535?text=${encodeURIComponent(waText)}" target="_blank" rel="noopener" class="btn btn-wa btn-sm"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
      </div>
    </article>`;
  }).join('');

  wrapper.querySelectorAll('[data-top-details]').forEach(button=>{
    button.addEventListener('click', ()=>{
      const details = button.closest('.easy-card').querySelector('.card-details');
      const open = details.style.display === 'block';
      details.style.display = open ? 'none' : 'block';
      button.textContent = open ? 'View Details' : 'Hide Details';
    });
  });
  initEasySellSwiper();
}

function resolveLiveProductImage(product){
  const direct = safeImageUrl(product?.image_url);
  if(direct) return direct;
  const slug = String(product?.slug || '').trim();
  const name = String(product?.name || '').trim().toLowerCase();
  const fallback = products.find(item => item[7] === slug || String(item[3] || '').trim().toLowerCase() === name);
  return safeImageUrl(fallback?.[9]) || '';
}

initEasySellSwiper();

// faq
const faqWrap = document.getElementById('faqWrap');
if(faqWrap){
  if(Array.isArray(window.faqs)){
    faqWrap.innerHTML = window.faqs.map((f,i)=>`
 <div class="faq-item" data-i="${i}">
  <button type="button" class="faq-q">${f[0]} <i class="fa-solid fa-plus"></i></button>
   <div class="faq-a"><p>${f[1]}</p></div>
 </div>
`).join('');
    document.querySelectorAll('.faq-item').forEach(item=>{
      item.querySelector('.faq-q').addEventListener('click', ()=>{
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i=>{ i.classList.remove('open'); i.querySelector('.faq-a').style.maxHeight=null; });
        if(!wasOpen){ item.classList.add('open'); const a=item.querySelector('.faq-a'); a.style.maxHeight = a.scrollHeight+'px'; }
      });
    });
  }else{
    console.warn('`faqs` is missing or not an array — FAQs not rendered.');
    faqWrap.innerHTML = '<p>No FAQs available.</p>';
  }
}

window.addEventListener('error', (event)=>{
  console.error('Unhandled script error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event)=>{
  console.error('Unhandled async error:', event.reason);
});

// Simple AI-style support bot for the storefront.
(function(){
  const launchBtn = document.getElementById('chatbotLaunch');
  const panel = document.getElementById('chatbotPanel');
  const closeBtn = document.getElementById('chatbotClose');
  const form = document.getElementById('chatbotForm');
  const input = document.getElementById('chatbotInput');
  const messages = document.getElementById('chatbotMessages');
  const cancelBtn = document.getElementById('chatbotCancel');
  const suggestions = document.querySelectorAll('[data-bot-suggest]');

  if(!launchBtn || !panel || !form || !input || !messages){ return; }

  const knowledge = [
    { keywords: ['hello','hi','hey','good morning','good afternoon'], answer: 'Hello! I can help with product categories, current availability, pricing, delivery, and bulk orders for Frontline Hardware.' },
    { keywords: ['power tool','drill','saw','grinder','impact','cordless'], answer: 'Our power-tools range includes cordless drills, angle grinders, circular saws, and other site tools. Availability and prices change with stock, so send the exact tool, brand, and quantity on WhatsApp for confirmation.' },
    { keywords: ['lock','security','door lock','door security','union','lever','mortice','cylinder'], answer: 'We carry Union and other door hardware, including lever sets, mortice locks, cylinder locks, and locksets. Tell me the door type and the lock style you need.' },
    { keywords: ['paint','thinner','sealer','finishes','wood finish','nc sanding'], answer: 'We carry paints, thinners, sealers, and wood finishes. Tell me the surface, indoor or outdoor use, and finish you want so the team can recommend a suitable option.' },
    { keywords: ['glue','adhesive','contact adhesive','wood glue','pattex','ponal'], answer: 'We carry contact adhesive and wood-glue options, including Conta, Pattex, and Ponal. Share the materials being bonded and the quantity you need.' },
    { keywords: ['board','hdf','laminate','marble sheet','wall panel'], answer: 'We supply boards, decorative laminates, marble sheets, and wall-panel materials. Send the required size, colour or finish, and quantity for availability and pricing.' },
    { keywords: ['delivery','shipping','transport'], answer: 'Delivery within Nairobi typically takes 1–2 business days. Out-of-town delivery usually takes 3–5 business days depending on location. Send your area, item list, and preferred date so we can confirm the cost and timing.' },
    { keywords: ['price','cost','pricing','quote','budget'], answer: 'Prices depend on the product, size, brand, and current stock. Send the exact item and quantity on WhatsApp for a current quote.' },
    { keywords: ['hours','open','when','time','sunday','saturday'], answer: 'Frontline Hardware is open Monday to Saturday, 7:30am–6:30pm. We are closed on Sundays.' },
    { keywords: ['bulk','site','contractor','trade','building materials'], answer: 'For a bulk or trade quote, send your material list, quantities, project location, and required date on WhatsApp. We can prepare a tailored quote and help coordinate delivery.' },
    { keywords: ['payment','pay','mpesa','m-pesa','bank transfer','card'], answer: 'We accept M-Pesa, bank transfers, and card payments in-store. Qualified customers can be invoiced for bulk or site orders.' },
    { keywords: ['return','refund','exchange'], answer: 'Returns are accepted within 7 days for unopened items. Custom or made-to-order products are non-refundable. Contact the team if you have a product issue.' },
    { keywords: ['warranty','guarantee'], answer: 'Most branded tools include a manufacturer warranty. Terms vary by product, so send the model name for confirmation.' },
    { keywords: ['location','address','where','gikomba','kamkunji','chiriku'], answer: 'We are at Chiriku Lane, Kamkunji Road, Nairobi. Use the Contact section for directions or call +254 727 791 535.' },
    { keywords: ['safety','helmet','gloves','gear','protective'], answer: 'We carry safety gear, work gloves, and protective accessories for construction and site work. Tell me the type of work and quantity needed.' },
    { keywords: ['thanks','thank you','bye'], answer: 'You are welcome. Send us a WhatsApp message whenever you need a quote or product recommendation.' }
  ];
  let replyTimer = null;

  const createMessage = (role, text) => {
    const row = document.createElement('div');
    row.className = role === 'user' ? 'user-message' : 'bot-message';

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = role === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;

    if(role === 'user'){
      row.appendChild(bubble);
      row.appendChild(avatar);
    } else {
      row.appendChild(avatar);
      row.appendChild(bubble);
    }

    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  };

  function buildReply(query){
    const text = String(query || '').trim();
    if(!text){ return 'Please type your question so I can help you.'; }

    const lower = text.toLowerCase().replace(/[?!.;,]/g, ' ');

    if (/(price|cost|pricing|quote|budget)/.test(lower) && /(product|item|drill|tool|lock|paint|glue|adhesive|board|material)/.test(lower)) {
      return 'Prices depend on the product, size, brand, and current stock. Send the exact item and quantity on WhatsApp for a current quote.';
    }

    const matches = knowledge
      .map(item => ({ item, score: item.keywords.reduce((score, keyword) => score + (lower.includes(keyword) ? keyword.length : 0), 0) }))
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score);
    if (matches.length) return matches[0].item.answer;

    if (/(order|buy|want to purchase|shop|available|availability|stock)/.test(lower)) {
      return 'We can help with product selection and WhatsApp ordering. Share the product name, quantity, and your location and we will send the best option.';
    }

    if (/(paint|lock|tool|material|safety|gloves|glue|adhesive|board|laminate)/.test(lower)) {
      return 'We stock a wide range of hardware products. Tell me the exact item, size, brand, or quantity and I can guide you to the best match.';
    }

    if (/(nairobi|kenya)/.test(lower)) {
      return 'We are based in Nairobi and arrange delivery within Nairobi. Out-of-town delivery may be available; send your location and item list so the team can confirm.';
    }

    return 'I can help with product recommendations, pricing, delivery, and bulk orders. Try asking about power tools, paints, door locks, or delivery times.';
  }

  function togglePanel(forceOpen){
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !panel.classList.contains('open');
    panel.classList.toggle('open', shouldOpen);
    launchBtn.setAttribute('aria-expanded', String(shouldOpen));
    if(shouldOpen){ input.focus(); }
  }

  function finishConversation(){
    if(replyTimer){
      clearTimeout(replyTimer);
      replyTimer = null;
    }
    input.value = '';
    togglePanel(false);
  }

  launchBtn.addEventListener('click', ()=> togglePanel());
  closeBtn.addEventListener('click', ()=> togglePanel(false));
  if(cancelBtn){ cancelBtn.addEventListener('click', finishConversation); }

  suggestions.forEach(button => {
    button.addEventListener('click', ()=> {
      const value = button.dataset.botSuggest || button.textContent.trim();
      input.value = value;
      input.focus();
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  });

  form.addEventListener('submit', (event)=>{
    event.preventDefault();
    const value = input.value.trim();
    if(!value){ return; }

    createMessage('user', value);
    input.value = '';

    const reply = buildReply(value);
    replyTimer = setTimeout(()=> {
      replyTimer = null;
      createMessage('bot', reply);
      if(/(order|buy|quote|bulk|price|delivery|available|availability|stock)/i.test(value)) {
        const quickLink = document.createElement('div');
        quickLink.className = 'bot-message';
        quickLink.innerHTML = '<div class="avatar"><i class="fa-brands fa-whatsapp"></i></div><div class="message-bubble"><a href="https://wa.me/254727791535?text=' + encodeURIComponent('Hi Frontline Hardware, my enquiry is: ' + value) + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline;">Send this enquiry on WhatsApp</a></div>';
        messages.appendChild(quickLink);
        messages.scrollTop = messages.scrollHeight;
      }
    }, 250);
  });
})();

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000){
  const controller = new AbortController();
  const timeout = setTimeout(()=> controller.abort(), timeoutMs);
  try{
    return await fetch(url, { ...options, signal: controller.signal });
  }finally{
    clearTimeout(timeout);
  }
}

// Update the hero rating badge and JSON-LD structured data
function applySiteRating({ ratingValue, reviewCount, bestRating = 5 } = {}){
  try{
    const num = (ratingValue == null) ? null : Number(ratingValue);
    const count = (reviewCount == null) ? null : Number(reviewCount);
    const best = (bestRating == null) ? 5 : Number(bestRating) || 5;

    // remember site best rating for per-review normalization
    try{ window._siteBestRating = best; }catch(e){}
    // Update hero elements if present
    const ratingEl = document.querySelector('.hero .rating-num');
    const textEls = document.querySelectorAll('.hero .rating-text');
    const starsEl = document.querySelector('.hero .g-stars');
    if(ratingEl && (num != null && !Number.isNaN(num))){
      // Show both the original numeric scale (e.g. "90/100") and the normalized 5-star equivalent.
      const originalDisplay = (best && best !== 5) ? `${String(num)}/${String(best)}` : String(num);
      const normalized = best ? Math.max(0, Math.min(5, (num / best) * 5)) : num;
      ratingEl.innerHTML = `${originalDisplay} <small class="rating-normal">(${normalized.toFixed(1)}/5)</small>`;
    }
    if(textEls && count != null && !Number.isNaN(count)){
      textEls.forEach(el=> el.innerHTML = `Based on <b>${String(count)}</b> reviews`);
    }
    if(starsEl && num != null && !Number.isNaN(num)){
      // Normalize any incoming rating to a 5-star scale for display
      const normalized = Math.max(0, Math.min(5, (num / (best || 5)) * 5));
      starsEl.innerHTML = `<span role="img" aria-label="${normalized.toFixed(1)} out of 5 stars">${renderStars(normalized,5,'')}</span>`;
      starsEl.style.color = 'var(--yellow)';
      starsEl.setAttribute('aria-hidden','false');
    }

    // Update JSON-LD AggregateRating inside the HardwareStore script (if present)
    const ld = document.querySelector('script[type="application/ld+json"]');
    if(ld){
      try{
        const data = JSON.parse(ld.textContent || '{}');
        if(data && data['@type'] && data['@type'].toLowerCase().includes('hardwarestore')){
          data.aggregateRating = {
            '@type':'AggregateRating',
            ratingValue: num != null && !Number.isNaN(num) ? String(num) : undefined,
            reviewCount: count != null && !Number.isNaN(count) ? String(count) : undefined,
            bestRating: String(best || 5),
            worstRating: '1'
          };
          ld.textContent = JSON.stringify(data, null, 2);
        }
      }catch(e){ console.warn('Could not update JSON-LD rating:', e); }
    }
  }catch(err){ console.warn('applySiteRating error', err); }
}

// If page defines window.siteConfig or window.rating before JS runs, apply immediately
try{
  if(window.siteConfig && (window.siteConfig.content?.aggregateRating || window.siteConfig.content?.rating)){
    const a = window.siteConfig.content.aggregateRating || window.siteConfig.content.rating || {};
    applySiteRating({ ratingValue: a.ratingValue || a.value, reviewCount: a.reviewCount || a.count, bestRating: a.bestRating });
  }else if(window.rating){
    applySiteRating(window.rating);
  }
}catch(e){/* silent */}


let SUPABASE_URL = "https://bgnykjzxnknyvefytnjj.supabase.co";
let SUPABASE_ANON_KEY = "sb_publishable_VSzgwX0q4NsjFezuua_dCQ_Br1bE9EE";

function isValidSupabaseConfig(url, key){
  const validUrl = /^https:\/\/bgnykjzxnknyvefytnjj\.supabase\.co$/i.test(String(url || '').trim());
  const value = String(key || '').trim();
  const validKey = value.startsWith('sb_publishable_') || value.startsWith('eyJ');
  return validUrl && validKey && !/service_role|secret|password/i.test(value);
}

function initCookieConsent(){
  const banner = document.getElementById('cookieBanner');
  const accept = document.getElementById('cookieAccept');
  const reject = document.getElementById('cookieReject');
  if(!banner || !accept || !reject) return;

  const consentCookie = document.cookie.split('; ').find((entry)=>entry.startsWith('frontline_cookie_consent='));
  if(consentCookie) return;

  banner.hidden = false;
  const saveConsent = (value)=>{
    document.cookie = `frontline_cookie_consent=${value}; Max-Age=31536000; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    banner.hidden = true;
  };
  accept.addEventListener('click', ()=>saveConsent('accepted'));
  reject.addEventListener('click', ()=>saveConsent('rejected'));
}

initCookieConsent();
let BACKEND_CONFIGURED = !SUPABASE_URL.includes("PASTE_YOUR") && !SUPABASE_ANON_KEY.includes("PASTE_YOUR");
let LIVE_DEALS_ENABLED = true;
let LIVE_PRODUCTS_ENABLED = true;

function updateBackendConfiguredFlag(){
  BACKEND_CONFIGURED = !SUPABASE_URL.includes("PASTE_YOUR") && !SUPABASE_ANON_KEY.includes("PASTE_YOUR");
}

async function loadRuntimeConfig(){
  try{
    // Browsers block fetch() for local file:// pages; avoid noisy security errors.
    if(window.location.protocol === 'file:'){
      console.info('Runtime config fetch skipped on file://. Use a local web server to load site-config.json.');
      updateBackendConfiguredFlag();
      return;
    }

    const res = await fetchWithTimeout('site-config.json', { cache:'no-store' }, 8000);
    if(!res.ok) return;
    const cfg = await res.json();
    const configuredUrl = cfg?.supabase?.url ? String(cfg.supabase.url).trim() : SUPABASE_URL;
    const configuredKey = cfg?.supabase?.anonKey ? String(cfg.supabase.anonKey).trim() : SUPABASE_ANON_KEY;
    if(isValidSupabaseConfig(configuredUrl, configuredKey)){
      SUPABASE_URL = configuredUrl;
      SUPABASE_ANON_KEY = configuredKey;
    }else{
      console.warn('Rejected invalid Supabase runtime configuration.');
    }
    LIVE_DEALS_ENABLED = cfg?.features?.loadLiveDeals !== false;
    LIVE_PRODUCTS_ENABLED = cfg?.features?.loadLiveProducts !== false;

    try{
      const settingsRes = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/site_settings?id=eq.storefront&select=settings`, {
        method: 'GET',
        headers: { apikey: SUPABASE_ANON_KEY, Accept: 'application/json' },
        cache: 'no-store'
      }, 8000);
      if(settingsRes.ok){
        const settingsRows = await settingsRes.json();
        const settings = settingsRows?.[0]?.settings;
        if(settings){
          const eyebrow = document.querySelector('.easy-sell .eyebrow');
          const title = document.querySelector('.easy-sell h2');
          const description = document.querySelector('.easy-sell .lede');
          if(eyebrow && settings.eyebrow) eyebrow.textContent = settings.eyebrow;
          if(title && settings.title) title.textContent = settings.title;
          if(description && settings.description) description.textContent = settings.description;

          const popular = settings.popularCategories || {};
          const popularEyebrow = document.querySelector('#popular-categories-title')?.closest('.section-head')?.querySelector('.eyebrow');
          const popularTitle = document.getElementById('popular-categories-title');
          if(popularEyebrow && popular.eyebrow) popularEyebrow.textContent = popular.eyebrow;
          if(popularTitle && popular.title) popularTitle.textContent = popular.title;

          const cards = Array.isArray(popular.cards) && popular.cards.length ? popular.cards : [];
          const cardNodes = document.querySelectorAll('.section-alt .easy-card');
          cardNodes.forEach((card, idx) => {
            const item = cards[idx] || {};
            const safeLink = safeLinkUrl(item.link);
            const link = card.querySelector('a');
            const heading = card.querySelector('h4');
            const paragraph = card.querySelector('p');
            const image = card.querySelector('img');

            if(item.title && heading) heading.innerHTML = safeLink ? `<a href="${escapeAttr(safeLink)}">${escapeHtml(item.title)}</a>` : escapeHtml(item.title);
            if(item.text && paragraph) paragraph.textContent = item.text;
            if(safeLink && link) link.setAttribute('href', safeLink);
            const safeImage = safeImageUrl(item.image);
            if(safeImage && image) image.src = safeImage;
            if(item.image && image) image.alt = item.title || image.alt || 'Category image';
          });
        }
      }
    }catch(err){
      console.info('Optional storefront settings unavailable; using static defaults.');
    }

    // Optional: manage homepage visuals from site-config.json.
    if(Array.isArray(cfg?.content?.projectGallery) && cfg.content.projectGallery.length){
      applyProjectGalleryConfig(cfg.content.projectGallery);
    }

    // Apply rating data from runtime config if provided
    if(cfg?.content?.aggregateRating || cfg?.content?.rating || cfg?.content?.reviews){
      const ar = cfg.content.aggregateRating || cfg.content.rating || {};
      const ratingValue = ar.ratingValue || ar.value || ar.score || null;
      const reviewCount = ar.reviewCount || ar.count || ar.reviews || null;
      if(ratingValue != null || reviewCount != null){
        applySiteRating({ ratingValue, reviewCount, bestRating: ar.bestRating || 5 });
      }
      // Merge runtime reviews into the page-level fallbacks so the reviews modal
      // and testimonials render with live data when available.
      if(Array.isArray(cfg.content.reviews) && cfg.content.reviews.length){
        try{
          window.testimonials = cfg.content.reviews;
          window.reviews = cfg.content.reviews;
        }catch(_e){/* ignore */}
      }
    }

    // Live Google reviews (pulled straight from the business's Google listing)
    if(cfg?.content?.googleReviews?.placeId && cfg?.content?.googleReviews?.apiKey){
      const gr = cfg.content.googleReviews;
      const placeId = String(gr.placeId).trim();
      const apiKey = String(gr.apiKey).trim();
      const looksConfigured = placeId && apiKey
        && !/YOUR_GOOGLE_PLACE_ID/i.test(placeId)
        && !/YOUR_GOOGLE_PLACES_API_KEY/i.test(apiKey);
      if(looksConfigured){
        fetchGoogleReviews(placeId, apiKey);
      }else{
        console.info('Google Reviews not configured yet — add a real Place ID and API key to site-config.json (content.googleReviews).');
      }
    }

    updateBackendConfiguredFlag();
  }catch(err){
    console.warn('Could not load runtime config, using JS defaults:', err);
  }
}

/**
 * Pulls the live rating + up to 5 most relevant reviews straight from the
 * business's real Google listing (Places API, New) and wires them into the
 * existing rating badge, JSON-LD, testimonial carousel and reviews modal.
 * Note: Google's API only ever returns up to 5 reviews per place — that is
 * a hard limit set by Google, not something this site can change. The total
 * "based on X reviews" count and star rating, however, are the real live figures.
 */
async function fetchGoogleReviews(placeId, apiKey){
  try{
    const fields = 'rating,userRatingCount,reviews,googleMapsUri';
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=${fields}&key=${encodeURIComponent(apiKey)}`;
    const res = await fetchWithTimeout(url, { headers:{ 'Accept':'application/json' } }, 10000);
    if(!res.ok){
      console.warn('Google Places request failed:', res.status, await res.text().catch(()=> ''));
      return;
    }
    const data = await res.json();

    // Update the star badge, "Based on X reviews" text, and JSON-LD aggregateRating
    if(data.rating != null || data.userRatingCount != null){
      applySiteRating({ ratingValue: data.rating, reviewCount: data.userRatingCount, bestRating: 5 });
    }

    // Point "read our reviews" / directions-style links at the real listing
    if(data.googleMapsUri){
      document.querySelectorAll('.hero .trust-inline, .g-reviews-link').forEach(a=>{
        a.setAttribute('href', data.googleMapsUri);
      });
    }

    const liveReviews = Array.isArray(data.reviews) ? data.reviews : [];
    if(liveReviews.length){
      // Shape for the testimonial carousel: [role/label, name, quote, rating]
      const testiShaped = liveReviews.map(r=>[
        r.relativePublishTimeDescription || 'Google review',
        r.authorAttribution?.displayName || 'Google user',
        (r.text?.text || r.originalText?.text || '').trim(),
        r.rating != null ? Number(r.rating) : 5
      ]);
      // Shape for the reviews modal: {name, text, rating, date}
      const modalShaped = liveReviews.map(r=>({
        name: r.authorAttribution?.displayName || 'Google user',
        text: (r.text?.text || r.originalText?.text || '').trim(),
        rating: r.rating != null ? Number(r.rating) : 5,
        date: r.relativePublishTimeDescription || ''
      }));

      window.testimonials = testiShaped;
      window.reviews = modalShaped;

      renderTestimonials(testiShaped);
      initTestiSwiper();
      populateReviews(modalShaped);
    }
  }catch(err){
    console.warn('Could not load live Google reviews, keeping existing content:', err);
  }
}

async function loadLiveDeals(){
  if(!LIVE_DEALS_ENABLED) return;
  if(!BACKEND_CONFIGURED) return;
  try{
    const res = await fetchWithTimeout(
      `${SUPABASE_URL}/rest/v1/offers?select=title,price_text,image_url,whatsapp_text,is_active,sort_order,created_at&is_active=eq.true&order=sort_order.asc,created_at.desc&limit=200`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
      12000
    );
    if(!res.ok) throw new Error('Request failed: ' + res.status);

    const rows = await res.json();
    if(!Array.isArray(rows) || !rows.length) return;

    const liveDeals = rows
      .filter(r => (r.title || '').trim() && (r.image_url || '').trim())
      .map(r => [
        r.title || '',
        (r.price_text || '').toString().trim(),
        r.image_url || '',
        (r.whatsapp_text || '').toString().trim()
      ]);

    if(liveDeals.length){
      renderDeals(liveDeals);
    }
  }catch(err){
    console.warn('Could not load live offers, showing built-in deals instead:', err);
  }
}

async function loadLiveProducts(){
  if(!LIVE_PRODUCTS_ENABLED) return;
  if(!BACKEND_CONFIGURED) return; // no backend set up yet — built-in list stays in place
  try{
    const res = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc&limit=1000`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    }, 12000);
    if(!res.ok) throw new Error('Request failed: ' + res.status);
    const rows = await res.json();
    if(!Array.isArray(rows) || !rows.length) return; // nothing added via the admin dashboard yet — keep built-in list
    const liveProducts = rows.map(r => [
      r.brand_key || '', r.brand_display || '', r.model_type || '', r.name || '',
      r.category || '', r.description || '', Number(r.price||0).toLocaleString(),
      r.slug || '', r.availability || 'In Stock', r.image_url || '', r.colors || '', r.sizes || '', r.size_prices || ''
    ]);
    // merge with the built-in catalogue rather than replacing it — a live product
    // with a matching slug overrides the built-in one; everything else is additive
    const liveSlugs = new Set(liveProducts.map(p => p[7]));
    products = [...liveProducts, ...products.filter(p => !liveSlugs.has(p[7]))];
    refreshProductFilterUI();

    const topProducts = rows
      .filter(r => r.is_top_product && (r.name || '').trim())
      .slice(0, 12);
    if(topProducts.length) renderLiveTopProducts(topProducts);
  }catch(err){
    console.warn('Could not load live products, showing built-in list instead:', err);
  }
}

let products = [
 ["sline", "5-LINE", "Lever Lockset", "5-Line Hardware Lever Lockset", "Door Locks & Security", "Strong steel construction with brass-plated finish, smooth precision locking mechanism, key lock function.", "1700", "5line-lever-lockset", "In Stock","assets/optimized/inline-040.jpg"],
 ["moment", "MOMENT", "Bathroom Door Lock", "Moment Bathroom Door Lock with Handle (Silver)", "Door Locks & Security", "High quality classical door handle with smooth locking mechanism, easy to install with all fittings included.", "1000", "moment-bathroom-lock-silver", "In Stock","assets/optimized/inline-011.jpg"],
 ["fealty", "FEALTY", "Door Lock", "Fealty Door Lock with Indicator", "Door Locks & Security", "Made from high quality stainless steel, easy-to-read vacant/occupied indicator, comes with all screws and fittings.", "800", "fealty-door-lock-indicator", "In Stock","assets/optimized/inline-041.jpg"],
 ["union", "UNION", "Lever Lockset", "Union Lever Lockset (Antique Brass)", "Door Locks & Security", "ASSA ABLOY quality, made from high quality materials for maximum strength, precision smooth locking mechanism.", "2700", "union-lever-lockset-brass-a", "In Stock","assets/optimized/inline-042.jpg"],
 ["union", "UNION", "Lever Lockset", "Union Lever Lockset (Black)", "Door Locks & Security", "ASSA ABLOY quality, made from high quality materials for maximum strength, precision smooth locking mechanism.", "3000", "union-lever-lockset-black", "In Stock","assets/optimized/inline-017.jpg"],
 ["oxford", "OXFORD", "Steel Hinge", "Oxford Steel Hinge", "Cabinet Fittings", "Made from high quality steel for long lasting performance, precision engineered for smooth quiet movement, rust resistant finish.", "200", "oxford-steel-hinge", "In Stock","assets/optimized/inline-043.jpg"],
 ["union", "UNION", "Lever Lockset", "Union Lever Lockset (Antique Brass)", "Door Locks & Security", "ASSA ABLOY quality, made from high quality materials for maximum strength, precision smooth locking mechanism.", "2700", "union-lever-lockset-brass-b", "In Stock","assets/optimized/inline-044.jpg"],
 ["seweco", "SEWECO", "Wood Finish", "Seweco Wood Finishes - Clear", "Paint Supplies", "Premium quality clear finish that enhances the natural beauty of wood, durable protection against wear, moisture and scratches, smooth easy application.", "3300", "seweco-wood-finish-clear", "In Stock","assets/optimized/inline-045.jpg"],
 ["moment", "MOMENT", "Bathroom Door Lock", "Moment Bathroom Door Lock with Handle (Antique Bronze)", "Door Locks & Security", "High quality classical door handle with smooth locking mechanism, easy to install with all fittings included.", "1000", "moment-bathroom-lock-bronze", "In Stock","assets/optimized/inline-013.jpg"],
 ["union", "UNION", "Lever Lockset", "Union Lever Lockset (Satin Nickel)", "Door Locks & Security", "ASSA ABLOY quality, made from high quality materials for maximum strength, precision smooth locking mechanism.", "3000", "union-lever-lockset-nickel", "In Stock","assets/optimized/inline-012.jpg"],
 ["stanley","STANLEY","Tape Measure","Stanley Tylon Tape Measure 3M/10FT","Measuring & Detection Tools","Tylon-coated blade for longer life, compact durable case with pocket clip.","800","stanley-tape-measure","In Stock","assets/optimized/inline-046.jpg"],
 ["knicker","KNICKER","Chipboard Screws","Chipboard Screws 25mm x 4 (200pcs)","Fasteners","Sharp, durable point for easy driving with a strong grip on wood and boards.","300","chipboard-screws-knicker-25mm","In Stock","assets/optimized/inline-047.jpg"],
 ["momeni","MOMENI","MDF Screws","MDF Screws Yellow Zinc 4x50 (200pcs)","Fasteners","Sharp tip for smooth drilling, firm hold on wood and MDF, bulk value pack.","350","mdf-screws-momeni","In Stock","assets/optimized/inline-048.jpg"],
 ["knicker","KNICKER","Chipboard Screws","Chipboard Screws KN-165216 (~20mm)","Fasteners","Deep sharp thread for strong holding power, packed for convenience.","350","chipboard-screws-knicker-kn165216","In Stock","assets/optimized/inline-049.jpg"],
 ["patita","PATITA","Self Drilling Screws","Self Drilling Screws 3.9 x 38 (200pcs)","Fasteners","Sharp point for easy drilling, firm and secure long-lasting joints.","350","self-drilling-screws-patita","In Stock","assets/optimized/inline-050.jpg"],
 ["knicker","KNICKER","Self Drilling Screws","Self Drilling Screws 3.9 x 38 (200pcs)","Fasteners","Sharp point for smooth drilling, strong and secure long-lasting joints.","350","self-drilling-screws-knicker","In Stock","assets/optimized/inline-051.jpg"],
 ["dca","DCA","Jig Saw","DCA Jig Saw AMQ65K","Power Tools","600W motor for strong cutting performance, ergonomic handle for precise, comfortable cuts.","8,000","dca-jig-saw","In Stock","assets/optimized/inline-052.jpg"],
 ["deli","DELI","Impact Drill","Deli Impact Drill DCI80 650W","Power Tools","650W impact drilling with comfort grip, complete with case and bit set.","4,500","deli-impact-drill","In Stock","assets/optimized/inline-053.jpg"],
 ["total","TOTAL","Tool Box","TOTAL Tool Box","Hand Tools","Durable, spacious storage built for professionals with secure locking latches.","4,500","total-tool-box","In Stock","assets/optimized/inline-054.jpg"],
 ["keywin","KEYWIN","Electric Drill","Keywin 10mm Electric Drill KW-Z103","Power Tools","2-mode operation with forward/reverse rotation and a 10mm chuck for precise results.","2,000","keywin-electric-drill","In Stock","assets/optimized/inline-055.jpg"],
 ["deli","DELI","Aspirator Blower","Deli Aspirator Blower 500W","Power Tools","500W motor delivers strong, consistent airflow for blowing dust and cleaning work areas.","3,500","deli-aspirator-blower","In Stock","assets/optimized/inline-056.jpg"],
 ["stanley","STANLEY","Hand Plane","Stanley Hand Plane 245mm (9¾\")","Hand Tools","Precise, smooth finishing with a durable body and comfortable ergonomic grip.","9,000","stanley-hand-plane","Low Stock","assets/optimized/inline-057.jpg"],
 ["dca","DCA","Wood Router","DCA Wood Router AMR02-12","Power Tools","High-performance motor for smooth routing with ergonomic handles for precise control.","12,000","dca-wood-router","Low Stock","assets/optimized/inline-058.jpg"],
 ["generic","FRONTLINE","Work Gloves","Leather Work Gloves (Large)","Safety Gear","Premium leather with a soft inner lining for all-day comfort and reinforced stitching.","350","leather-work-gloves","In Stock","assets/optimized/inline-059.jpg"],
 ["bosch","BOSCH","Bit Set","Bosch Screwdriver Bit Set PH2 65mm (10pcs)","Power Tools","Premium steel bits with precision-engineered tips for a perfect screw fit every time.","1,900","bosch-bit-set","In Stock","assets/optimized/inline-060.jpg"],
 ["deli","DELI","Heat Gun","Deli Heat Gun 2000W","Power Tools","Fast heat with adjustable temperature settings and overheat-protected durable design.","2,950","deli-heat-gun","In Stock","assets/optimized/inline-061.jpg"],
 ["deli","DELI","Flame Gun","Deli Flame Gun DL451300","Power Tools","Strong, steady adjustable flame built with durable materials for reliable performance.","1,500","deli-flame-gun","In Stock","assets/optimized/inline-062.jpg"],
 ["ingco","INGCO","Miter Box Saw","INGCO Miter Box Saw Set 12\" (300mm)","Hand Tools","Sharp, precise 65Mn blade with miter box guide and a comfort grip handle.","1,200","ingco-miter-box-saw","In Stock","assets/optimized/inline-063.jpg"],
 ["frontline","FRONTLINE","MDF Board","MDF Boards - Premium Finishes","Building Materials","Strong, smooth and versatile boards in a wide range of finishes for furniture and cabinetry.","3,400","mdf-boards","In Stock","assets/optimized/inline-064.jpg"],
 ["total","TOTAL","Impact Drill","TOTAL Impact Drill 680W Professional","Power Tools","Powerful 680W performance for versatile, durable everyday drilling.","5,000","total-impact-drill-680w","In Stock","assets/optimized/inline-065.jpg"],
 ["deli","DELI","Combination Square","Deli Combination Square DL7300Y","Measuring & Detection Tools","300mm/1ft accurate marking and layout tool with a built-in scriber.","1,000","deli-combination-square","In Stock","assets/optimized/inline-066.jpg"],
 ["bosch","BOSCH","Impact Drill","Bosch Impact Drill GSB 600 Professional","Power Tools","Powerful 600W motor for versatile drilling, from an authorized Bosch store.","5,500","bosch-impact-drill-gsb600","In Stock","assets/optimized/inline-067.jpg"],
 ["ingco","INGCO","Impact Drill","INGCO Impact Drill 600W Professional","Power Tools","Powerful, durable 600W performance for versatile drilling jobs.","5,000","ingco-impact-drill-600w","In Stock","assets/optimized/inline-068.jpg"],
 ["anant","ANANT","Wood Plane","Anant Wood Plane (Size A4)","Hand Tools","Sharp blade for smooth, accurate planing with a durable metal body since 1940.","3,500","anant-wood-plane","In Stock","assets/optimized/inline-069.jpg"],
 ["total","TOTAL","Polishing Pad","TOTAL Polishing Pad 180mm","Power Tools","M14 thread fit for smooth, high-performance polishing at up to 4,000/min.","800","total-polishing-pad","In Stock","assets/optimized/inline-070.jpg"],
];

let cordlessProducts = [
 ["total", "TOTAL", "Total P20S Cordless Circular Saw (20V, Tool Only)", "Cordless Tools", "High speed cutting for different applications, lightweight comfortable grip, durable build.", "total-p20s-cordless-circular-saw","assets/optimized/inline-071.jpg"],
 ["bosch", "BOSCH", "Bosch GSB 18V-50 Cordless Drill (18V Professional)", "Cordless Tools", "High performance motor for heavy-duty tasks, 18V Li-Ion battery for extended runtime, compact durable design. Comes complete with case, battery and charger.", "bosch-18v-cordless-drill","assets/optimized/inline-072.jpg"],
 ["ingco", "INGCO", "INGCO Cordless Jig Saw (20V Brushless, 2.0Ah)", "Cordless Tools", "Powerful brushless motor for high performance and longer tool life, precise smooth cutting on wood and plywood, compact ergonomic grip. Complete set with blades, battery and charger.", "ingco-20v-brushless-jigsaw","assets/optimized/inline-073.jpg"],
 ["total", "TOTAL", "Total P20S Cordless Drill (12V, Tool Only)", "Cordless Tools", "High performance motor for drilling and fastening, 15+1 adjustable torque settings for precise control, durable long-lasting build.", "total-p20s-cordless-drill-12v","assets/optimized/inline-018.jpg"],
 ["ingco", "INGCO", "INGCO Cordless Drill (20V Brushless, 2.0Ah)", "Cordless Tools", "High performance brushless motor for more power and longer life, strong 20V lithium battery for reliable performance, compact ergonomic design. Complete with battery.", "ingco-20v-brushless-drill","assets/optimized/inline-074.jpg"],
 ["ingco", "INGCO", "INGCO Cordless Circular Saw (20V Brushless)", "Cordless Tools", "Powerful brushless motor for smooth efficient cutting, durable industrial-quality build, comfortable grip for better control.", "ingco-20v-brushless-circular-saw","assets/optimized/inline-075.jpg"],
 ["total", "TOTAL", "Total P20S Cordless Glue Gun (20V, Tool Only)", "Cordless Tools", "Heats up quickly for efficient use, smooth precision glue flow for accurate application, compact lightweight comfortable grip.", "total-p20s-cordless-glue-gun","assets/optimized/inline-076.jpg"],
 ["total", "TOTAL", "Total P20S Cordless Jigsaw (20V, Tool Only)", "Cordless Tools", "High speed cutting for various materials, adjustable base for precise accurate cuts, durable long-lasting build.", "total-p20s-cordless-jigsaw","assets/optimized/inline-077.jpg"],
 ["total", "TOTAL", "Total P20S 4-Pole Cordless Angle Grinder 115mm (20V, Tool Only)", "Cordless Tools", "Powerful 4-pole motor for higher efficiency and longer life, compact ergonomic grip for better control, durable build for heavy-duty performance.", "total-p20s-cordless-angle-grinder","assets/optimized/inline-019.jpg"],
 ["total", "TOTAL", "Total P20S Cordless Blower (20V, Tool Only)", "Cordless Tools", "High air volume for efficient cleaning, lightweight comfortable grip, durable long-lasting build.", "total-p20s-cordless-blower","assets/optimized/inline-078.jpg"],
 ["bosch", "BOSCH", "Bosch POF 1400 ACE Router", "Cordless Tools", "Powerful motor for consistent performance, precise smooth routing control, durable design built for long lasting use.", "bosch-pof-1400-ace-router","assets/optimized/inline-079.jpg"],
 ["total", "TOTAL", "Total S12 Cordless Drill Set (12V, Tool Only)", "Cordless Tools", "High torque motor for drilling and fastening, compact ergonomic grip for better control, includes carry bag and bit set.", "total-s12-cordless-drill-set","assets/optimized/inline-080.jpg"],
 ["bosch", "BOSCH", "Bosch PEX 220 A Random Orbit Sander", "Cordless Tools", "Powerful motor for efficient smooth sanding, integrated dust collection for a cleaner work environment, comfortable grip for easy handling.", "bosch-pex-220a-orbit-sander","assets/optimized/inline-081.jpg"],
 ["bosch", "BOSCH", "Bosch GST 12V-70 Cordless Jig Saw (12V Professional)", "Cordless Tools", "High-performance motor delivers smooth precise cutting, 12V lithium battery for excellent runtime and mobility, ergonomic design with variable speed control. Comes complete with case, battery and charger.", "bosch-12v-cordless-jigsaw","assets/optimized/inline-082.jpg"],
 ["total", "TOTAL", "Total Jig Saw \u2013 Various Models", "Cordless Tools", "Powerful motor for efficient cutting, accurate smooth precise cuts, durable build for long lasting use. Several models available in stock.", "total-jig-saw-various-models","assets/optimized/inline-083.jpg"],
 ["total", "TOTAL", "Total P20S Cordless Palm Sander (20V, Tool Only)", "Cordless Tools", "High performance motor for efficient smooth sanding, compact lightweight ergonomic design, durable long-lasting build.", "total-p20s-cordless-palm-sander","assets/optimized/inline-084.jpg"],
 ["total", "TOTAL", "Total P20S Cordless Drill Set 2.0Ah (20V, with Impact Function)", "Cordless Tools", "High torque motor with impact function for heavy-duty tasks, includes 2x 2.0Ah batteries and carry case.", "total-p20s-cordless-drill-2ah","assets/optimized/inline-085.jpg"]
];
function productCardHtml(p, idx){
  const availClass = p[8]==='In Stock' ? 'ok' : (p[8]==='Low Stock' ? 'low' : 'pre');
  const productName = p[3] || p[2] || 'Product image';
  const safeName = escapeHtml(productName);
  const safeSlug = escapeAttr(p[7] || '');
  const safeImage = safeImageUrl(resolveProductImage(p, p[9]));
  const safeBrandCat = escapeHtml(`${p[1] || ''} · ${p[4] || ''}`);
  const safeDesc = escapeHtml(p[5] || '');
  const numericPrice = Number(String(p[6] || '').replace(/,/g, ''));
  const safePrice = numericPrice > 0 ? `KES ${escapeHtml(Number.isFinite(numericPrice) ? numericPrice.toLocaleString() : p[6])}` : 'Price on request';
  const safeAvailability = escapeHtml(p[8] || 'Pre-Order');
  return `
   <div class="prod-card">
     <div class="prod-media">
       <span class="prod-tag avail-${availClass}">${safeAvailability}</span>
      <button type="button" class="wish-heart" data-wish="${safeSlug}" aria-label="Save ${escapeAttr(productName)} to wishlist"><i class="fa-solid fa-heart"></i></button>
      <img src="${escapeAttr(safeImage)}" loading="lazy" alt="${escapeAttr(productName)}">
     </div>
     <div class="prod-body">
       <span class="prod-brand">${safeBrandCat}</span>
       <h3 class="prod-name">${safeName}</h3>
       <div class="prod-stars"><span class="star-icons"><i class="fa-regular fa-star"></i><i class="fa-regular fa-star"></i><i class="fa-regular fa-star"></i><i class="fa-regular fa-star"></i><i class="fa-regular fa-star"></i></span><span>No reviews yet</span></div>
       <p class="prod-desc">${safeDesc}</p>
      <div class="prod-price">${safePrice}${numericPrice > 0 ? ' <span>excl. VAT</span>' : ''}</div>
       <div class="prod-actions">
         <button type="button" class="btn btn-outline-dark btn-sm" data-view-index="${idx}">View Product</button>
         <button type="button" class="btn btn-outline-dark btn-sm" data-cart-add="${safeSlug}" aria-label="Add ${escapeAttr(productName)} to quote list"><i class="fa-solid fa-cart-plus"></i></button>
         <a href="https://wa.me/254727791535?text=${encodeURIComponent('Hi Frontline Hardware, I want to buy: '+p[3]+' (KES '+p[6]+')')}" class="btn btn-wa btn-sm" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Buy</a>
       </div>
     </div>
   </div>`;
}

/* ===================== PRODUCTS (grouped by category) ===================== */
let lastRenderedList = products;
function renderProducts(list){
  lastRenderedList = list;
  const container = document.getElementById('prodGroups');
  const count = document.getElementById('pfCount');
  count.textContent = `${list.length} product${list.length===1?'':'s'} found`;
  if(!list.length){
    container.innerHTML = `<div class="prod-empty"><i class="fa-solid fa-box-open" style="font-size:1.6rem; margin-bottom:10px; display:block;"></i>No products match those filters. Try clearing one.</div>`;
    renderCatNav([]);
    return;
  }
  // group, preserving the master category order, then any extra categories found
  const orderedCats = [...categories, ...new Set(list.map(p=>p[4]))].filter((c,i,arr)=>arr.indexOf(c)===i);
  const groups = orderedCats.map(cat => [cat, list.filter(p=>p[4]===cat)]).filter(([,items])=>items.length);
  container.innerHTML = groups.map(([cat, items])=>{
    const id = 'cat-' + slugifyCat(cat);
    return `<div class="cat-group" id="${id}">
      <div class="cat-group-head"><h3>${escapeHtml(cat)}</h3><span>${items.length} item${items.length===1?'':'s'}</span></div>
      <div class="prod-grid">${items.map(p=>productCardHtml(p, list.indexOf(p))).join('')}</div>
    </div>`;
  }).join('');
  container.querySelectorAll('[data-view-index]').forEach(btn=>{
    btn.addEventListener('click', ()=> openProductModal(lastRenderedList[Number(btn.dataset.viewIndex)]));
  });
  container.querySelectorAll('[data-wish]').forEach(btn=>{
    if(wishlist.has(btn.dataset.wish)) btn.classList.add('active');
    btn.addEventListener('click', ()=> toggleWishlist(btn.dataset.wish));
  });
  container.querySelectorAll('[data-cart-add]').forEach(btn=>{
    btn.addEventListener('click', ()=> addToCart(btn.dataset.cartAdd));
  });
  renderCatNav(groups.map(([cat])=>cat));
}

function renderCatNav(cats){
  const chips = cats.map(c=>`<a href="#cat-${slugifyCat(c)}">${escapeHtml(c)}</a>`).join('');
  document.getElementById('catNavScroll').innerHTML = chips;
  document.getElementById('heroQuickNav').innerHTML = chips;
}

function openProductModal(p){
  const modal = document.getElementById('productModal');
  if(!modal) return;
  const pmOptions = document.getElementById('pmOptions');
  const optionValues = (value) => String(value || '').split(',').map(item => item.trim()).filter(Boolean);
  const colors = optionValues(p[10]);
  const sizes = optionValues(p[11]);
  const sizePrices = new Map(optionValues(p[12]).map(pair => {
    const separator = pair.lastIndexOf(':');
    if(separator <= 0) return ['', 0];
    const size = pair.slice(0, separator).replace(/^\s*(?:ksh|kes)\s*/i, '').trim();
    const price = Number(pair.slice(separator + 1).replace(/^\s*(?:ksh|kes)\s*/i, '').replace(/,/g, '').trim());
    return [size, price];
  }).filter(([size, price]) => size && Number.isFinite(price) && price >= 0));
  if(pmOptions){
    pmOptions.innerHTML = [
      colors.length ? `<label for="pmColor">Color</label><select id="pmColor"><option value="">Choose a color</option>${colors.map(color => `<option>${escapeHtml(color)}</option>`).join('')}</select>` : '',
      sizes.length ? `<label for="pmSize">Size</label><select id="pmSize"><option value="">Choose a size</option>${sizes.map(size => `<option>${escapeHtml(size)}</option>`).join('')}</select>` : ''
    ].join('');
  }
  const pmColor = document.getElementById('pmColor');
  const pmSize = document.getElementById('pmSize');
  const basePrice = Number(String(p[6] || '').replace(/,/g, '')) || 0;
  const formatPrice = (price) => price > 0 ? `KES ${price.toLocaleString()} excl. VAT` : 'Price on request';
  const updateProductWhatsApp = ()=>{
    const color = pmColor?.value || 'Not specified';
    const size = pmSize?.value || 'Not specified';
    const selectedPrice = sizePrices.has(size) ? sizePrices.get(size) : basePrice;
    const message = `Hi Frontline Hardware, I want to buy: ${p[3]} (${selectedPrice ? `KES ${selectedPrice.toLocaleString()}` : p[6]}). Color: ${color}. Size: ${size}.`;
    const pmWa = document.getElementById('pmWa');
    if(pmWa) pmWa.href = `https://wa.me/254727791535?text=${encodeURIComponent(message)}`;
    const pmPrice = document.getElementById('pmPrice');
    if(pmPrice) pmPrice.textContent = formatPrice(selectedPrice);
  };
  if(pmColor) pmColor.onchange = updateProductWhatsApp;
  if(pmSize) pmSize.onchange = updateProductWhatsApp;
  const pmTitle = document.getElementById('pmTitle'); if(pmTitle) pmTitle.textContent = p[3];
  const pmMeta = document.getElementById('pmMeta'); if(pmMeta) pmMeta.textContent = `${p[1]} · ${p[4]} · ${p[8]}`;
  const pmDesc = document.getElementById('pmDesc'); if(pmDesc) pmDesc.textContent = p[5];
  const pmPrice = document.getElementById('pmPrice'); if(pmPrice) pmPrice.textContent = formatPrice(basePrice);
  const pmImg = document.getElementById('pmImg'); if(pmImg){ pmImg.src = safeImageUrl(p[9]); pmImg.alt = p[3]; }
  updateProductWhatsApp();
  const cartAddBtn = document.getElementById('pmCartAdd');
  if(cartAddBtn) cartAddBtn.onclick = ()=> addToCart(p[7], sizePrices.has(pmSize?.value) ? sizePrices.get(pmSize.value) : basePrice, pmSize?.value || '', pmColor?.value || '');
  const wishBtn = document.getElementById('pmWishToggle');
  if(wishBtn){
    const syncWishBtn = ()=>{
      const active = wishlist.has(p[7]);
      wishBtn.innerHTML = active ? '<i class="fa-solid fa-heart" style="color:#e0245e;"></i> Saved' : '<i class="fa-regular fa-heart"></i> Save';
    };
    syncWishBtn();
    wishBtn.onclick = ()=>{ toggleWishlist(p[7]); syncWishBtn(); };
  }
  modal.classList.add('open');
  const pmCloseEl = document.getElementById('pmClose'); if(pmCloseEl) pmCloseEl.focus();
}
document.getElementById('pmClose')?.addEventListener('click', ()=> document.getElementById('productModal')?.classList.remove('open'));
document.getElementById('productModal')?.addEventListener('click', (e)=>{ if(e.target.id==='productModal') e.currentTarget.classList.remove('open'); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') document.getElementById('productModal')?.classList.remove('open'); });

/* ===================== WISHLIST + QUOTE CART ===================== */
function loadStore(key){
  try{ return JSON.parse(localStorage.getItem(key)) || []; }catch(e){ return []; }
}
function saveStore(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }

let wishlist = new Set(loadStore('fh_wishlist'));
let cartStore = loadStore('fh_cart');
let cart = Array.isArray(cartStore) ? {} : cartStore; // { slug: qty }

function findProduct(slug){ return products.find(p=>p[7]===slug) || cordlessProducts.find(p=>p[5]===slug); }

function updateBadges(){
  const wCount = wishlist.size;
  const cCount = Object.values(cart).reduce((total, item)=>total + (typeof item === 'number' ? item : Number(item?.qty || 0)),0);
  const wEl = document.getElementById('wishlistCount');
  const cEl = document.getElementById('cartCount');
  if(wEl) wEl.textContent = wCount;
  if(cEl) cEl.textContent = cCount;
}
function toggleWishlist(slug){
  if(wishlist.has(slug)) wishlist.delete(slug); else wishlist.add(slug);
  saveStore('fh_wishlist', [...wishlist]);
  updateBadges();
  document.querySelectorAll(`[data-wish="${slug}"]`).forEach(b=> b.classList.toggle('active', wishlist.has(slug)));
  renderWishlistDrawer();
}
function addToCart(slug, price, size = '', color = ''){
  const existing = cart[slug];
  const currentQty = typeof existing === 'number' ? existing : Number(existing?.qty || 0);
  cart[slug] = { qty: currentQty + 1, price: Number(price) || 0, size, color };
  saveStore('fh_cart', cart);
  updateBadges();
  renderCartDrawer();
  openDrawer('cartDrawer');
}
function setCartQty(slug, qty){
  if(qty <= 0){ delete cart[slug]; }
  else {
    const existing = cart[slug];
    cart[slug] = typeof existing === 'number' ? {qty, price:0, size:'', color:''} : {...existing, qty};
  }
  saveStore('fh_cart', cart);
  updateBadges();
  renderCartDrawer();
}
function renderWishlistDrawer(){
  const body = document.getElementById('wishlistBody');
  const items = [...wishlist].map(findProduct).filter(Boolean);
  if(!items.length){
    body.innerHTML = `<div class="drawer-empty"><i class="fa-regular fa-heart"></i>Your wishlist is empty.<br>Tap the heart on any product to save it here.</div>`;
    return;
  }
  body.innerHTML = items.map(p=>`
    <div class="drawer-item">
      <img src="${escapeAttr(safeImageUrl(p[9]||p[6]))}" alt="${escapeAttr(p[3]||p[2]||'Product')}">
      <div class="drawer-item-body"><b>${escapeHtml(p[3]||p[2]||'')}</b>${p[6]&&!isNaN(Number(String(p[6]).replace(/,/g,'')))?`<span>KES ${escapeHtml(p[6])}</span>`:''}</div>
      <button type="button" data-wish-remove="${escapeAttr(p[7]||p[5]||'')}" aria-label="Remove from wishlist"><i class="fa-solid fa-xmark"></i></button>
    </div>`).join('');
  body.querySelectorAll('[data-wish-remove]').forEach(b=> b.addEventListener('click', ()=> toggleWishlist(b.dataset.wishRemove)));
}
function renderCartDrawer(){
  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');
  const slugs = Object.keys(cart);
  if(!slugs.length){
    body.innerHTML = `<div class="drawer-empty"><i class="fa-solid fa-cart-shopping"></i>Your quote list is empty.<br>Add products to request a bulk quote.</div>`;
    foot.style.display = 'none';
    return;
  }
  let total = 0;
  body.innerHTML = slugs.map(slug=>{
    const p = findProduct(slug);
    if(!p) return '';
    const item = typeof cart[slug] === 'number' ? {qty:cart[slug], price:0, size:'', color:''} : cart[slug];
    const qty = Number(item.qty || 0);
    const priceNum = Number(item.price) || Number(String(p[6]).replace(/,/g,'')) || 0;
    const lineTotal = priceNum * qty;
    total += lineTotal;
    return `
    <div class="drawer-item">
      <img src="${escapeAttr(safeImageUrl(p[9]))}" alt="${escapeAttr(p[3] || 'Product')}">
      <div class="drawer-item-body"><b>${escapeHtml(p[3] || '')}</b><span>${priceNum ? `KES ${priceNum.toLocaleString()}` : 'Price on request'} each${item.size ? ` · ${escapeHtml(item.size)}` : ''}${item.color ? ` · ${escapeHtml(item.color)}` : ''}</span>
        <div class="qty-row">
          <button type="button" data-qty-minus="${slug}" aria-label="Decrease quantity">−</button>
          <span>${qty}</span>
          <button type="button" data-qty-plus="${slug}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button type="button" data-cart-remove="${slug}" aria-label="Remove from quote list"><i class="fa-solid fa-xmark"></i></button>
    </div>`;
  }).join('');
  foot.style.display = '';
  document.getElementById('cartTotal').textContent = `KES ${total.toLocaleString()}`;
  const waLines = slugs.map(slug=>{ const p=findProduct(slug); const item=typeof cart[slug]==='number'?{qty:cart[slug],price:0,size:'',color:''}:cart[slug]; const price=Number(item.price)||Number(String(p?.[6]||'').replace(/,/g,''))||0; return p ? `• ${p[3]} x${item.qty} (${price ? `KES ${price.toLocaleString()}` : 'Price on request'} each${item.size ? `, size ${item.size}` : ''}${item.color ? `, color ${item.color}` : ''})` : ''; }).filter(Boolean).join('\n');
  document.getElementById('cartWaBtn').href = `https://wa.me/254727791535?text=${encodeURIComponent('Hi Frontline Hardware, I would like a quote for:\n'+waLines)}`;
  body.querySelectorAll('[data-qty-minus]').forEach(b=> b.addEventListener('click', ()=> {
    const item = cart[b.dataset.qtyMinus];
    const qty = typeof item === 'number' ? item : Number(item?.qty || 0);
    setCartQty(b.dataset.qtyMinus, qty - 1);
  }));
  body.querySelectorAll('[data-qty-plus]').forEach(b=> b.addEventListener('click', ()=> {
    const item = cart[b.dataset.qtyPlus];
    const qty = typeof item === 'number' ? item : Number(item?.qty || 0);
    setCartQty(b.dataset.qtyPlus, qty + 1);
  }));
  body.querySelectorAll('[data-cart-remove]').forEach(b=> b.addEventListener('click', ()=> setCartQty(b.dataset.cartRemove, 0)));
}
function openDrawer(id){
  document.getElementById(id).classList.add('open');
  document.getElementById('drawerOverlay').classList.add('open');
}
function closeDrawers(){
  document.querySelectorAll('.drawer').forEach(d=> d.classList.remove('open'));
  document.getElementById('drawerOverlay').classList.remove('open');
}
document.getElementById('wishlistToggle')?.addEventListener('click', ()=>{ renderWishlistDrawer(); openDrawer('wishlistDrawer'); });
document.getElementById('cartToggle')?.addEventListener('click', ()=>{ renderCartDrawer(); openDrawer('cartDrawer'); });
document.getElementById('wishlistClose')?.addEventListener('click', closeDrawers);
document.getElementById('cartClose')?.addEventListener('click', closeDrawers);
document.getElementById('drawerOverlay')?.addEventListener('click', closeDrawers);
document.getElementById('cartClearBtn')?.addEventListener('click', ()=>{ cart = {}; saveStore('fh_cart', cart); updateBadges(); renderCartDrawer(); });
updateBadges();

/* ===================== CORDLESS TOOLS (WhatsApp price on request) ===================== */
function renderCordless(){
  const grid = document.getElementById('cordlessGrid');
  grid.innerHTML = cordlessProducts.map(p=>{
    const safeName = escapeHtml(p[2] || '');
    const safeBrandType = escapeHtml(`${p[1] || ''} · ${p[3] || ''}`);
    const safeDesc = escapeHtml(p[4] || '');
    const safeImage = safeImageUrl(p[6]);
    return `
   <div class="prod-card">
     <div class="prod-media">
       <img src="${escapeAttr(safeImage)}" loading="lazy" alt="${escapeAttr(p[2] || '')}">
     </div>
     <div class="prod-body">
       <span class="prod-brand">${safeBrandType}</span>
       <h3 class="prod-name">${safeName}</h3>
       <p class="prod-desc">${safeDesc}</p>
       <div class="prod-actions">
         <a href="https://wa.me/254727791535?text=${encodeURIComponent('Hi Frontline Hardware, please could you tell me the current price for: '+p[2])}" class="btn btn-wa btn-sm" target="_blank" rel="noopener" style="flex:1;"><i class="fa-brands fa-whatsapp"></i> Ask Price on WhatsApp</a>
       </div>
     </div>
   </div>`;
  }).join('');
}

/* ========== Reviews modal functionality ========== */
function escapeHtmlSafe(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]); }

function renderStars(normalized, maxStars = 5, className = ''){
  const n = Math.max(0, Math.min(maxStars, Number(normalized) || 0));
  const full = Math.floor(n);
  const half = (n - full) >= 0.5 ? 1 : 0;
  const empty = Math.max(0, maxStars - full - half);
  return ''.padStart(full, '★').split('').map(()=>`<i class="fa-solid fa-star ${className}" aria-hidden="true"></i>`).join('')
    + (half ? `<i class="fa-solid fa-star-half-stroke ${className}" aria-hidden="true"></i>` : '')
    + ''.padStart(empty, '☆').split('').map(()=>`<i class="fa-regular fa-star ${className}" aria-hidden="true"></i>`).join('');
}

function populateReviews(reviewsArray){
  const list = document.getElementById('reviewsList');
  if(!list) return;
  const arr = Array.isArray(reviewsArray) ? reviewsArray : (window.reviews || window.testimonials || []);
  if(!arr.length){ list.innerHTML = '<div class="reviews-empty">No reviews available.</div>'; return; }
    list.innerHTML = arr.map(r=>{
    // support different shapes: {name,text,rating,date} or arrays used in testimonials
    const name = r.name || r.author || (Array.isArray(r) && r[0]) || 'Customer';
    const text = r.text || r.comment || (Array.isArray(r) && r[1]) || '';
    const rating = (r.rating || r.stars || (Array.isArray(r) && r[2]));
    const ratingNum = (rating == null || rating === '') ? null : Number(rating);
    const siteBest = (window._siteBestRating == null) ? 5 : Number(window._siteBestRating) || 5;
    let ratingText = '';
    let starsHtml = '';
    if(ratingNum != null && !Number.isNaN(ratingNum)){
      if(siteBest && siteBest !== 5){ ratingText = `${ratingNum}/${siteBest}`; }
      else { ratingText = String(ratingNum); }
      const normalized = siteBest ? Math.max(0, Math.min(5, (ratingNum / siteBest) * 5)) : ratingNum;
      starsHtml = `<span class="review-stars" role="img" aria-label="${normalized.toFixed(1)} out of 5 stars">${renderStars(normalized, 5, 'small-star')}</span>`;
    }
    const when = r.date || '';
    return `<div class="review-item"><div class="review-head"><strong>${escapeHtmlSafe(name)}</strong><span class="review-rating">${escapeHtmlSafe(ratingText)} ${starsHtml}</span></div><div class="review-body">${escapeHtmlSafe(text)}</div><div class="review-date">${escapeHtmlSafe(when)}</div></div>`;
  }).join('');
}

let _reviewsLastFocus = null;
function openReviewsModal(sourceElement){
  const modal = document.getElementById('reviewsModal');
  if(!modal) return;
  _reviewsLastFocus = document.activeElement;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  const closeBtn = document.getElementById('reviewsClose');
  if(closeBtn) closeBtn.focus();
}

function closeReviewsModal(){
  const modal = document.getElementById('reviewsModal');
  if(!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  try{ if(_reviewsLastFocus && _reviewsLastFocus.focus) _reviewsLastFocus.focus(); }catch(e){}
}

// Bind modal controls
document.getElementById('floatReviews')?.addEventListener('click', ()=> openReviewsModal());
document.querySelector('.hero .trust-inline')?.addEventListener('click', (e)=>{ e.preventDefault(); openReviewsModal(e.currentTarget); });
document.getElementById('reviewsClose')?.addEventListener('click', closeReviewsModal);
document.getElementById('reviewsModal')?.addEventListener('click', (e)=>{ if(e.target.id==='reviewsModal') closeReviewsModal(); });
document.addEventListener('keydown', (e)=>{
  const activeTag = document.activeElement && document.activeElement.tagName;
  if(e.key === 't' && !activeTag?.match(/INPUT|TEXTAREA|SELECT/)){
    openReviewsModal();
  }
  if(e.key === 'Escape'){
    closeReviewsModal();
  }
});

// If runtime provided reviews already, populate; otherwise use existing window.reviews/testimonials
try{ populateReviews(window.reviews || window.testimonials || []); }catch(e){ console.warn('populateReviews error', e); }
renderCordless();

/* ===================== FILTERS ===================== */
function applyFilters(){
  const q = document.getElementById('pfSearch').value.toLowerCase();
  const brand = document.getElementById('pfBrand').value;
  const cat = document.getElementById('pfCategory').value;
  const priceRange = document.getElementById('pfPrice').value;
  let filtered = products.filter(p=>{
    const matchesQ = !q || p[3].toLowerCase().includes(q) || p[1].toLowerCase().includes(q) || p[4].toLowerCase().includes(q);
    const matchesBrand = !brand || p[1]===brand;
    const matchesCat = !cat || p[4]===cat;
    let matchesPrice = true;
    if(priceRange){
      const [lo,hi] = priceRange.split('-').map(Number);
      const val = Number(p[6].replace(/,/g,''));
      matchesPrice = val >= lo && val <= hi;
    }
    return matchesQ && matchesBrand && matchesCat && matchesPrice;
  });
  renderProducts(filtered);
}
function refreshProductFilterUI(){
  const pfBrand = document.getElementById('pfBrand');
  const pfCategory = document.getElementById('pfCategory');
  const brandSet = [...new Set(products.map(p=>p[1]))];
  const catSet = [...new Set(products.map(p=>p[4]).filter(Boolean))];
  const orderedCats = [
    ...categories,
    ...catSet.filter(c => !categories.includes(c))
  ];
  pfBrand.innerHTML = '<option value="">All Brands</option>' + brandSet.map(b=>`<option value="${escapeAttr(b)}">${escapeHtml(b)}</option>`).join('');
  pfCategory.innerHTML = '<option value="">All Categories</option>' + orderedCats.map(c=>`<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`).join('');
  renderProducts(products);
}
['pfSearch','pfBrand','pfCategory','pfPrice'].forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener('input', applyFilters); });
function showAllCategories(){
  const categoryInput = document.getElementById('pfCategory');
  if(categoryInput) categoryInput.value = '';
  applyFilters();
  renderCatNav(categories);
  location.hash = '#products';
  const _productsEl = document.getElementById('products'); if(_productsEl) _productsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
document.getElementById('showAllCatsBtn')?.addEventListener('click', showAllCategories);
refreshProductFilterUI();
renderMobileCategoryLinks();
async function initLiveContent(){
  await loadRuntimeConfig();
  await loadLiveDeals();
  await loadLiveProducts();
}
initLiveContent();

/* ===================== INTERACTIONS ===================== */
// loader
window.addEventListener('load', ()=>{
  try{
    const loaderEl = document.getElementById('loader');
    if(!loaderEl){
      return;
    }
    setTimeout(()=>{
      loaderEl.classList.add('hide');
    }, 700);
  }catch(err){
    console.warn('Could not hide the page loader.', err);
  }
});

// tabs
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add('active');
  });
});

// theme toggle (persisted across visits + respects OS preference on first visit)
function initializeThemeToggle(){
  const themeBtn = document.getElementById('themeToggle');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('frontline-theme');
  const initialTheme = savedTheme || 'light';
  
  if(themeBtn){
    root.setAttribute('data-theme', initialTheme);
    themeBtn.innerHTML = initialTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    themeBtn.addEventListener('click', ()=>{
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('frontline-theme', next);
      themeBtn.innerHTML = next === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    });
  }
}

// Wait for DOM to be ready
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initializeThemeToggle);
} else {
  initializeThemeToggle();
}

// header search overlay — filters the on-page catalogue and switches to the Products view
const searchOverlay = document.getElementById('searchOverlay');
const searchInputEl = document.getElementById('searchInput');
const searchResultsEl = document.getElementById('searchResults');
document.getElementById('searchToggle')?.addEventListener('click', ()=>{ searchOverlay.classList.add('open'); searchInputEl.focus(); });
document.getElementById('searchClose')?.addEventListener('click', ()=> searchOverlay.classList.remove('open'));
function goToProducts(hash){
  location.hash = hash;
  routeFromHash();
  searchOverlay.classList.remove('open');
}
function runHeaderSearch(){
  const q = searchInputEl.value.trim().toLowerCase();
  if(!q){ searchResultsEl.innerHTML = `<p class="search-empty">Press Enter to search the full catalogue.</p>`; return; }
  const matches = products.filter(p => p[3].toLowerCase().includes(q) || p[1].toLowerCase().includes(q) || p[4].toLowerCase().includes(q)).slice(0,6);
  searchResultsEl.innerHTML = matches.length
    ? matches.map(p=>`<button type="button" class="search-result" data-name="${escapeAttr(p[3])}">${escapeHtml(p[3])} <span>${escapeHtml(p[1])} · ${escapeHtml(p[4])}</span></button>`).join('')
    : `<p class="search-empty">No products match "${escapeHtml(searchInputEl.value)}".</p>`;
  searchResultsEl.querySelectorAll('.search-result').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById('pfSearch').value = btn.dataset.name;
      applyFilters();
      goToProducts('#products');
    });
  });
}
searchResultsEl.innerHTML = `<p class="search-empty">Press Enter to search the full catalogue.</p>`;
searchInputEl.addEventListener('input', runHeaderSearch);
searchInputEl.addEventListener('keydown', (e)=>{
  if(e.key==='Enter'){
    e.preventDefault();
    document.getElementById('pfSearch').value = searchInputEl.value;
    applyFilters();
    goToProducts('#products');
  }
});

// mega menu (keyboard + touch accessible, not just hover)
const megaTrigger = document.getElementById('megaTrigger');
const mega = document.getElementById('megaMenu');
megaTrigger.addEventListener('click', (e)=>{
  e.stopPropagation();
  const isOpen = mega.classList.toggle('open');
  megaTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});
document.addEventListener('click', (e)=>{
  if(!e.target.closest('.has-mega')){ mega.classList.remove('open'); megaTrigger.setAttribute('aria-expanded','false'); }
});
document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape'){ mega.classList.remove('open'); megaTrigger.setAttribute('aria-expanded','false'); }
});

// mobile menu
const mobileMenu = document.getElementById('mobileMenu');
const burger = document.getElementById('burgerToggle');
burger.setAttribute('aria-expanded', 'false');
mobileMenu.setAttribute('aria-hidden', 'true');
function syncMobileMenuState(){
  const isOpen = mobileMenu.classList.contains('open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
  burger.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  mobileMenu.inert = !isOpen;
}
function renderMobileCategoryLinks(){
  const list = document.getElementById('mobileCategoryList');
  if(!list) return;
  list.innerHTML = categories.map(c=>`<a href="#cat-${slugifyCat(c)}">${escapeHtml(c)}</a>`).join('');
}
burger.addEventListener('click', ()=>{
  mobileMenu.classList.toggle('open');
  syncMobileMenuState();
});
mobileMenu.addEventListener('click', (e)=>{
  const anchor = e.target.closest('a');
  if(!anchor) return;
  mobileMenu.classList.remove('open');
  syncMobileMenuState();
});
mobileMenu.inert = true;
window.addEventListener('resize', ()=>{
  if(window.innerWidth > 980 && mobileMenu.classList.contains('open')){
    mobileMenu.classList.remove('open');
    syncMobileMenuState();
  }
});

// contact + newsletter forms — save to Supabase "leads" table when backend is configured,
// otherwise fall back to a friendly inline confirmation only.
const FORM_RATE_LIMITS = {
  contact_form: { windowMs: 10 * 60 * 1000, maxAttempts: 3, cooldownMs: 60 * 1000 },
  delivery_form: { windowMs: 10 * 60 * 1000, maxAttempts: 3, cooldownMs: 60 * 1000 },
  newsletter: { windowMs: 10 * 60 * 1000, maxAttempts: 5, cooldownMs: 30 * 1000 }
};

const FORM_FIRST_SEEN_AT = {
  contact_form: Date.now(),
  delivery_form: Date.now(),
  newsletter: Date.now()
};

function sanitizeText(value, maxLen = 500){
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function sanitizeEmail(value){
  const cleaned = sanitizeText(value, 254).toLowerCase();
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(cleaned);
  return ok ? cleaned : '';
}

function sanitizePhone(value){
  const cleaned = String(value || '').replace(/[^\d+]/g, '').slice(0, 20);
  const digits = cleaned.replace(/\D/g, '');
  return digits.length >= 9 ? cleaned : '';
}

function getRateStore(){
  try{
    return JSON.parse(localStorage.getItem('fh_rate_limits_v1')) || {};
  }catch(_err){
    return {};
  }
}

function setRateStore(store){
  try{
    localStorage.setItem('fh_rate_limits_v1', JSON.stringify(store));
  }catch(_err){
    // ignore storage failures
  }
}

function checkAndRecordRateLimit(key){
  const cfg = FORM_RATE_LIMITS[key];
  if(!cfg) return { ok: true };

  const now = Date.now();
  const store = getRateStore();
  const row = store[key] || { attempts: [], blockedUntil: 0 };

  if(row.blockedUntil && now < row.blockedUntil){
    return { ok: false, waitMs: row.blockedUntil - now };
  }

  row.attempts = (row.attempts || []).filter(ts => now - ts <= cfg.windowMs);
  if(row.attempts.length >= cfg.maxAttempts){
    row.blockedUntil = now + cfg.cooldownMs;
    store[key] = row;
    setRateStore(store);
    return { ok: false, waitMs: cfg.cooldownMs };
  }

  row.attempts.push(now);
  row.blockedUntil = 0;
  store[key] = row;
  setRateStore(store);
  return { ok: true };
}

function formatWait(waitMs){
  const secs = Math.max(1, Math.ceil(waitMs / 1000));
  return secs > 59 ? `${Math.ceil(secs / 60)} min` : `${secs}s`;
}

function hasRecentDuplicate(key, value){
  try{
    const store = JSON.parse(localStorage.getItem('fh_form_submissions_v1')) || {};
    const row = store[key];
    return !!row && row.value === value && Date.now() - row.at < 10 * 60 * 1000;
  }catch(_err){
    return false;
  }
}

function rememberSubmission(key, value){
  try{
    const store = JSON.parse(localStorage.getItem('fh_form_submissions_v1')) || {};
    store[key] = { value, at: Date.now() };
    localStorage.setItem('fh_form_submissions_v1', JSON.stringify(store));
  }catch(_err){
    // ignore storage failures
  }
}

async function submitLead(payload){
  if(!BACKEND_CONFIGURED) return { ok: true, offline: true };
  try{
    const res = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    }, 12000);
    return { ok: res.ok };
  }catch(err){
    console.warn('Could not save lead:', err);
    return { ok: false };
  }
}
document.getElementById('contactForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const statusEl = document.getElementById('cfStatus');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if(Date.now() - FORM_FIRST_SEEN_AT.contact_form < 2000){
    if(statusEl) statusEl.textContent = 'Please wait a moment and try again.';
    return;
  }

  if(document.getElementById('cfWebsite')?.value.trim()) return;

  const throttle = checkAndRecordRateLimit('contact_form');
  if(!throttle.ok){
    if(statusEl) statusEl.textContent = `Too many attempts. Try again in ${formatWait(throttle.waitMs)}.`;
    return;
  }

  const safeName = sanitizeText(document.getElementById('cfName')?.value || '', 120);
  const safePhone = sanitizePhone(document.getElementById('cfPhone')?.value || '');
  const safeEmail = sanitizeEmail(document.getElementById('cfEmail')?.value || '');
  const safeNeed = sanitizeText(document.getElementById('cfNeed')?.value || '', 80);
  const safeMessage = sanitizeText(document.getElementById('cfMessage')?.value || '', 1000);

  if(!safeName || !safePhone){
    statusEl.textContent = 'Please enter a valid name and phone number.';
    return;
  }

  if(safeName.length < 2 || safeMessage.length > 1000){
    statusEl.textContent = 'Please enter a real name and a shorter message.';
    return;
  }

  const submissionKey = [safeName, safePhone, safeEmail, safeNeed, safeMessage].join('|').toLowerCase();
  if(hasRecentDuplicate('contact_form', submissionKey)){
    statusEl.textContent = 'This enquiry was already submitted recently.';
    return;
  }

  statusEl.textContent = "Sending…";
  if(submitBtn) submitBtn.disabled = true;
  const payload = {
    source: 'contact_form',
    name: safeName,
    phone: safePhone,
    email: safeEmail,
    message: `[${safeNeed || 'General Enquiry'}] ${safeMessage}`
  };
  try{
    const result = await submitLead(payload);
    rememberSubmission('contact_form', submissionKey);
    e.target.reset();
    if(result.ok){
      window.location.assign('thank-you.html');
      return;
    }
    statusEl.textContent = result.ok
      ? "Thanks — your enquiry has been sent. Our team will call you back shortly."
      : "Thanks — we've noted your enquiry. If it's urgent, please WhatsApp us directly.";
  }finally{
    if(submitBtn) submitBtn.disabled = false;
  }
});
document.getElementById('newsletterForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const statusEl = document.getElementById('nlStatus');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if(Date.now() - FORM_FIRST_SEEN_AT.newsletter < 1500){
    if(statusEl) statusEl.textContent = 'Please wait a moment and try again.';
    return;
  }

  const throttle = checkAndRecordRateLimit('newsletter');
  if(!throttle.ok){
    if(statusEl) statusEl.textContent = `Too many attempts. Try again in ${formatWait(throttle.waitMs)}.`;
    return;
  }

  const safeEmail = sanitizeEmail(document.getElementById('nlEmail')?.value || '');
  if(!safeEmail){
    if(statusEl) statusEl.textContent = 'Please supply a valid email address.';
    return;
  }

  statusEl.textContent = "Subscribing…";
  if(submitBtn) submitBtn.disabled = true;
  const payload = { source: 'newsletter', email: safeEmail };
  try{
    const result = await submitLead(payload);
    e.target.reset();
    statusEl.textContent = result.ok ? "Subscribed! Watch your inbox." : "Thanks for subscribing!";
  }finally{
    if(submitBtn) submitBtn.disabled = false;
  }
});

// header hide on scroll + scroll-top button + reveal the "Get Quote" pill once past the hero
let lastY = window.scrollY;
const header = document.getElementById('siteHeader');
const scrollTopBtn = document.getElementById('scrollTop');
const navQuoteBtn = document.getElementById('navQuote');
window.addEventListener('scroll', ()=>{
  const y = window.scrollY;
  if(y > lastY && y > 200){ header.classList.add('nav-hidden'); } else { header.classList.remove('nav-hidden'); }
  lastY = y;
  scrollTopBtn.classList.toggle('show', y > 600);
  navQuoteBtn.classList.toggle('show', y > window.innerHeight * 0.6);
});
scrollTopBtn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

const deliveryModal = document.getElementById('deliveryModal');
const deliveryForm = document.getElementById('deliveryForm');
const openDeliveryModal = ()=>{
  if(!deliveryModal) return;
  deliveryModal.hidden = false;
  deliveryModal.classList.add('open');
  document.getElementById('deliveryFrom')?.focus();
};
const closeDeliveryModal = ()=>{
  if(!deliveryModal) return;
  deliveryModal.classList.remove('open');
  deliveryModal.hidden = true;
};
document.getElementById('deliveryToggle')?.addEventListener('click', openDeliveryModal);
document.getElementById('mobileDeliveryToggle')?.addEventListener('click', ()=>{
  document.getElementById('mobileMenu')?.classList.remove('open');
  openDeliveryModal();
});
document.getElementById('deliveryClose')?.addEventListener('click', closeDeliveryModal);
deliveryModal?.addEventListener('click', (event)=>{
  if(event.target === deliveryModal) closeDeliveryModal();
});
deliveryForm?.addEventListener('submit', (event)=>{
  event.preventDefault();
  const statusEl = deliveryForm.querySelector('.delivery-form-status');
  if(Date.now() - FORM_FIRST_SEEN_AT.delivery_form < 2000){
    if(statusEl) statusEl.textContent = 'Please wait a moment and try again.';
    return;
  }
  if(document.getElementById('deliveryWebsite')?.value.trim()) return;
  const throttle = checkAndRecordRateLimit('delivery_form');
  if(!throttle.ok){
    if(statusEl) statusEl.textContent = `Too many attempts. Try again in ${formatWait(throttle.waitMs)}.`;
    return;
  }
  const formData = new FormData(deliveryForm);
  const safeFrom = sanitizeText(formData.get('from'), 160);
  const safeTo = sanitizeText(formData.get('to'), 160);
  const safePackage = sanitizeText(formData.get('package'), 300);
  const safeName = sanitizeText(formData.get('name'), 100);
  const safePhone = sanitizePhone(formData.get('phone'));
  if(!safeFrom || !safeTo || !safePackage || !safeName || !safePhone || safeName.length < 2){
    if(statusEl) statusEl.textContent = 'Please complete the form with valid delivery details.';
    return;
  }
  const submissionKey = [safeFrom, safeTo, safePackage, safeName, safePhone].join('|').toLowerCase();
  if(hasRecentDuplicate('delivery_form', submissionKey)){
    if(statusEl) statusEl.textContent = 'This delivery request was already opened recently.';
    return;
  }
  const message = [
    'Hi Frontline Hardware, I would like to arrange a delivery.',
    '',
    `Pickup location: ${safeFrom}`,
    `Delivery location: ${safeTo}`,
    `Package details: ${safePackage}`,
    `Name: ${safeName}`,
    `Phone: ${safePhone}`
  ].join('\n');
  rememberSubmission('delivery_form', submissionKey);
  window.open(`https://wa.me/254727791535?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  deliveryForm.reset();
  closeDeliveryModal();
});
document.addEventListener('keydown', (event)=>{
  if(event.key === 'Escape' && deliveryModal?.classList.contains('open')) closeDeliveryModal();
});

// reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, {threshold:.15});
document.querySelectorAll('.reveal').forEach(el=> io.observe(el));

// scroll-spy active nav highlighting
const navLinks = document.querySelectorAll('nav.main-links > a[href^="#"]');
const spySections = [...navLinks].map(a=> document.querySelector(a.getAttribute('href'))).filter(Boolean);
const spyIo = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const id = '#' + entry.target.id;
      navLinks.forEach(a=> a.classList.toggle('active', a.getAttribute('href')===id));
    }
  });
}, {rootMargin:'-45% 0px -50% 0px', threshold:0});
spySections.forEach(s=> spyIo.observe(s));

// animated counters (stats band)
const countIo = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const el = e.target;
      const raw = el.textContent;
      const m = raw.match(/^(\D*)([\d,]+)(\D*)$/);
      if(m){
        const prefix = m[1], suffix = m[3];
        const num = parseInt(m[2].replace(/,/g,''));
        if(!isNaN(num) && num > 1){
          let cur = 0; const step = Math.max(1, Math.round(num/40));
          el.textContent = prefix + '0' + suffix;
          const t = setInterval(()=>{
            cur += step;
            if(cur >= num){ el.textContent = raw; clearInterval(t); }
            else{ el.textContent = prefix + cur.toLocaleString() + suffix; }
          }, 25);
        }
      }
      countIo.unobserve(el);
    }
  });
}, {threshold:.5});
document.querySelectorAll('.count').forEach(el=> countIo.observe(el));

// GSAP hero entrance
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// hero background slider — advances automatically through all slides, any count
(function initHeroSlider(){
  const slider = document.getElementById('heroSlider');
  if(!slider) return;
  const totalSlides = slider.querySelectorAll('.hero-slide').length;
  if(totalSlides <= 1 || prefersReducedMotion) return;
  let idx = 0;
  setInterval(()=>{
    idx++;
    if(idx >= totalSlides){
      idx = 0;
      slider.style.transition = 'none';
      slider.style.transform = 'translateX(0%)';
      requestAnimationFrame(()=> requestAnimationFrame(()=>{
        slider.style.transition = 'transform 1.1s cubic-bezier(.65,0,.35,1)';
      }));
      return;
    }
    slider.style.transform = `translateX(-${idx*100}%)`;
  }, 4200);
})();

if(window.gsap){
  gsap.from('.hero-content .eyebrow', {opacity:0, y:20, duration:.7, delay:.3});
  gsap.from('.hero-content h1', {opacity:0, y:30, duration:.8, delay:.45});
  if(document.querySelector('.hero-sub')) gsap.from('.hero-sub', {opacity:0, y:20, duration:.7, delay:.6});
  gsap.from('.hero-btns .btn', {opacity:0, y:20, stagger:.1, duration:.6, delay:.75});

  // subtle parallax on the hero photo as the page scrolls
  if(window.ScrollTrigger && !prefersReducedMotion){
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('.hero-parallax', {
      yPercent: 10, ease:'none',
      scrollTrigger: { trigger:'.hero', start:'top top', end:'bottom top', scrub:true }
    });

    // staggered entrance for each card grid, once per section, as it scrolls into view
    [
      {sel:'#dealsGrid', child:'.deal-card'},
      {sel:'#prodGrid', child:'.prod-card'},
      {sel:'.value-list', child:'.value-item'}
    ].forEach(({sel,child})=>{
      const container = document.querySelector(sel);
      if(!container) return;
      ScrollTrigger.create({
        trigger: container,
        start: 'top 85%',
        once: true,
        onEnter: ()=> gsap.from(container.querySelectorAll(child), {opacity:0, y:26, stagger:.08, duration:.6, ease:'power2.out'})
      });
    });
  }
}

// tactile tilt on service + category cards, mouse-tracked (skipped for touch & reduced-motion)
if(!prefersReducedMotion && window.matchMedia('(hover: hover)').matches){
  document.querySelectorAll('.deal-card').forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x*6}deg) rotateX(${-y*6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', ()=>{ card.style.transform = ''; });
  });
}

/* ===================== ROUTER (single-page view switching) ===================== */
document.getElementById('megaMenu').innerHTML = `<a href="#products" role="menuitem" style="grid-column:1/-1; font-weight:700; color:var(--yellow-dim); border-bottom:2px solid var(--black);">View All Products →</a>` + categories.slice(0,15).map(c=>`<a href="#cat-${slugifyCat(c)}" role="menuitem">${c}</a>`).join('');

function showView(view){
  document.getElementById('view-home').style.display = view==='products' ? 'none' : '';
  document.getElementById('view-products').style.display = view==='products' ? '' : 'none';
}
function routeFromHash(){
  const hash = location.hash || '';
  const productsRelated = hash === '#products' || hash.indexOf('#cat-') === 0 || hash === '#cordless';
  showView(productsRelated ? 'products' : 'home');
  const target = hash && hash !== '#' ? document.querySelector(hash) : null;
  if(target){
    requestAnimationFrame(()=> requestAnimationFrame(()=> target.scrollIntoView({behavior:'smooth'})));
  } else {
    window.scrollTo(0,0);
  }
}
window.addEventListener('hashchange', routeFromHash);
routeFromHash();
window.addEventListener('pageshow', ()=>{
  if(!location.hash) window.scrollTo(0, 0);
});

// Never keep the storefront blocked if a remote asset fails to finish loading.
setTimeout(()=> document.getElementById('loader')?.classList.add('hide'), 4500);