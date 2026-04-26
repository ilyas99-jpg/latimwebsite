/* ============================================================
<<<<<<< HEAD
   LATIMTECH CMS — Portfolio Loader
   Fetches projects.json and renders portfolio grid dynamically.
   Falls back to hardcoded HTML if fetch fails (e.g. file://).
=======
   LATIMTECH CMS — Portfolio Loader (Sanity-powered)
   Fetches projects from Sanity CDN and renders the portfolio grid.
   Requires js/sanity-config.js to be loaded first.
>>>>>>> a7e4f01 (Initial commit — Latimtech website with Sanity CMS)
   ============================================================ */

(async function () {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  const CATEGORY_META = {
    spa:         { label: 'Spa & Jacuzzi',        icon: 'fas fa-hot-tub',      bg: 'linear-gradient(135deg,#2A1A4C,#4A2A7C)' },
    bathroom:    { label: 'Bathroom',              icon: 'fas fa-bath',         bg: 'linear-gradient(135deg,#1A3050,#2A5080)' },
    plumbing:    { label: 'Plumbing',              icon: 'fas fa-wrench',       bg: 'linear-gradient(135deg,#1A365D,#2A5A8C)' },
    water:       { label: 'Water Engineering',     icon: 'fas fa-tint',         bg: 'linear-gradient(135deg,#0A2A4A,#1A4A7A)' },
    civil:       { label: 'Civil Engineering',     icon: 'fas fa-building',     bg: 'linear-gradient(135deg,#1A365D,#2A5A8C)' },
    cctv:        { label: 'CCTV',                  icon: 'fas fa-video',        bg: 'linear-gradient(135deg,#1A1A2E,#2A3050)' },
    fabrication: { label: 'Aluminium Fabrication', icon: 'fas fa-border-all',   bg: 'linear-gradient(135deg,#3A3A3A,#5A5A5A)' },
    ac:          { label: 'Air Conditioning',      icon: 'fas fa-wind',         bg: 'linear-gradient(135deg,#1A3A4C,#2A5A6C)' },
  };

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

<<<<<<< HEAD
  function buildCard(p) {
    const meta = CATEGORY_META[p.category] || { label: p.category, icon: 'fas fa-star', bg: '#1A365D' };
    const hasImage = p.image && p.image.trim() !== '';

    const inner = hasImage
      ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">`
=======
  function getImageSrc(p) {
    if (p.image && p.image.asset) return sanityImageUrl(p.image.asset, 800);
    if (p.legacyImagePath && p.legacyImagePath.trim()) return p.legacyImagePath;
    return null;
  }

  function buildCard(p) {
    const meta    = CATEGORY_META[p.category] || { label: p.category, icon: 'fas fa-star', bg: '#1A365D' };
    const imgSrc  = getImageSrc(p);
    const hasImage = !!imgSrc;

    const inner = hasImage
      ? `<img src="${esc(imgSrc)}" alt="${esc(p.title)}" loading="lazy" width="800" height="600">`
>>>>>>> a7e4f01 (Initial commit — Latimtech website with Sanity CMS)
      : `<div class="portfolio-thumb" style="background:${meta.bg};width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.75rem;">
           <i class="${meta.icon}" style="font-size:2.5rem;color:#D4A574;opacity:.7;"></i>
           <span class="pl" style="font-size:.7rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.5);">${esc(meta.label)}</span>
         </div>`;

    const bgAttr = hasImage ? '' : `style="background:${meta.bg};"`;

    return `
      <div class="portfolio-item fade-in" data-category="${esc(p.category)}" ${bgAttr}>
        ${inner}
        <div class="portfolio-overlay">
          <h4>${esc(p.title)}</h4>
          <span class="cl">${esc(p.description || meta.label)}</span>
        </div>
      </div>`;
  }

  function applyStagger(items) {
    items.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i * 0.07, 0.5)}s`;
    });
  }

  function observeItems(items) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    items.forEach(el => obs.observe(el));
  }

  function rewireFilter(items) {
    const btns = document.querySelectorAll('.filter-btn');
    if (!btns.length) return;
<<<<<<< HEAD
    btns.forEach(btn => {
      btn.replaceWith(btn.cloneNode(true)); // remove old listeners
    });
=======
    btns.forEach(btn => btn.replaceWith(btn.cloneNode(true)));
>>>>>>> a7e4f01 (Initial commit — Latimtech website with Sanity CMS)
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        items.forEach(item => {
          const show = f === 'all' || item.dataset.category === f;
          item.style.transition = 'opacity .3s ease, transform .3s ease';
          if (show) {
            item.style.display = '';
            requestAnimationFrame(() => { item.style.opacity = '1'; item.style.transform = ''; });
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(.95)';
            setTimeout(() => { if (item.style.opacity === '0') item.style.display = 'none'; }, 310);
          }
        });
      });
    });
  }

  try {
<<<<<<< HEAD
    const res = await fetch('projects.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const projects = (data.projects || []);
    if (projects.length === 0) return;
=======
    const projects = await sanityFetch(
      '*[_type == "project"] | order(order asc, _createdAt asc) { title, category, description, order, image { asset }, legacyImagePath }'
    );
    if (!projects || projects.length === 0) return;
>>>>>>> a7e4f01 (Initial commit — Latimtech website with Sanity CMS)

    grid.innerHTML = projects.map(buildCard).join('');

    const items = Array.from(grid.querySelectorAll('.portfolio-item'));
    applyStagger(items);
    observeItems(items);
    rewireFilter(items);
  } catch (e) {
    /* Silently keep the hardcoded HTML fallback already in the grid */
  }
})();
