/* ============================================================
   LATIMTECH Portfolio — loads projects from Sanity.
   Requires js/sanity-config.js to be loaded first.
   Falls back to static HTML items if Sanity returns nothing.
   ============================================================ */

(async function () {

  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  const catLabels = {
    spa:         'Spa & Jacuzzi',
    bathroom:    'Bathroom Installations',
    plumbing:    'Plumbing',
    water:       'Water Systems',
    civil:       'Civil Engineering',
    cctv:        'CCTV',
    fabrication: 'Aluminium Fabrication',
    ac:          'Air Conditioning',
  };

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str || '');
    return d.innerHTML;
  }

  try {
    const projects = await sanityFetch(
      '*[_type == "project"] | order(order asc, _createdAt desc) { title, category, image { asset }, legacyImagePath, description }'
    );

    if (!projects || projects.length === 0) return; // keep static HTML items

    grid.innerHTML = projects.map(p => {
      let imgEl;
      if (p.image && p.image.asset) {
        const src = sanityImageUrl(p.image.asset, 600);
        imgEl = `<img src="${src}" alt="${esc(p.title)}" loading="lazy">`;
      } else if (p.legacyImagePath) {
        imgEl = `<img src="${esc(p.legacyImagePath)}" alt="${esc(p.title)}" loading="lazy">`;
      } else {
        imgEl = `<div class="portfolio-placeholder"><i class="fas fa-image"></i></div>`;
      }

      return `
        <div class="portfolio-item" data-category="${esc(p.category || '')}">
          ${imgEl}
          <div class="portfolio-overlay">
            <h4>${esc(p.title)}</h4>
            <span class="cl">${esc(catLabels[p.category] || p.category || '')}</span>
          </div>
        </div>`;
    }).join('');

    /* Re-bind filter buttons to the newly rendered items */
    const filterBtns  = document.querySelectorAll('.filter-btn');
    const filterItems = document.querySelectorAll('[data-category]');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        filterItems.forEach(item => {
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

  } catch (e) {
    // keep static HTML items on error
  }

})();
