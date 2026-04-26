/* ============================================================
   LATIMTECH Blog — Listing & Single Post
   Requires js/sanity-config.js to be loaded first.
   ============================================================ */

(async function () {

  /* ---- Helpers ---- */

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str || '');
    return d.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /* Render Sanity Portable Text blocks to HTML (basic implementation) */
  function renderBody(blocks) {
    if (!Array.isArray(blocks)) return '';
    return blocks.map(block => {
      if (block._type === 'image') {
        const src = block.asset ? sanityImageUrl(block.asset, 900) : null;
        if (!src) return '';
        const cap = block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : '';
        return `<figure class="blog-figure"><img src="${esc(src)}" alt="${esc(block.alt || '')}" loading="lazy">${cap}</figure>`;
      }

      if (block._type !== 'block') return '';

      const text = (block.children || []).map(span => {
        let t = esc(span.text || '');
        if (span.marks) {
          if (span.marks.includes('strong')) t = `<strong>${t}</strong>`;
          if (span.marks.includes('em'))     t = `<em>${t}</em>`;
          if (span.marks.includes('code'))   t = `<code>${t}</code>`;
          const linkMark = (block.markDefs || []).find(m => span.marks.includes(m._key) && m._type === 'link');
          if (linkMark) t = `<a href="${esc(linkMark.href)}" target="_blank" rel="noopener">${t}</a>`;
        }
        return t;
      }).join('');

      switch (block.style) {
        case 'h2': return `<h2>${text}</h2>`;
        case 'h3': return `<h3>${text}</h3>`;
        case 'h4': return `<h4>${text}</h4>`;
        case 'blockquote': return `<blockquote>${text}</blockquote>`;
        default: {
          if (block.listItem === 'bullet')  return `<li>${text}</li>`;
          if (block.listItem === 'number')  return `<li>${text}</li>`;
          return text ? `<p>${text}</p>` : '';
        }
      }
    }).join('\n');
  }

  /* ---- Blog listing page ---- */

  const grid = document.getElementById('blogGrid');
  if (grid) {
    try {
      const posts = await sanityFetch(
        '*[_type == "blogPost"] | order(publishedAt desc) { title, slug, excerpt, publishedAt, tags, mainImage { asset } }'
      );

      if (!posts || posts.length === 0) {
        grid.innerHTML = '<p class="blog-empty">No posts yet — check back soon!</p>';
        return;
      }

      grid.innerHTML = posts.map(post => {
        const imgSrc = post.mainImage?.asset ? sanityImageUrl(post.mainImage.asset, 600) : null;
        const imgEl  = imgSrc
          ? `<img src="${esc(imgSrc)}" alt="${esc(post.title)}" loading="lazy">`
          : `<div class="blog-card-placeholder"><i class="fas fa-newspaper"></i></div>`;
        const tagsEl = (post.tags || []).map(t => `<span class="blog-tag">${esc(t)}</span>`).join('');
        const slug   = post.slug?.current || '';

        return `
          <article class="blog-card fade-in">
            <a href="blog-post.html?slug=${encodeURIComponent(slug)}" class="blog-card-img">${imgEl}</a>
            <div class="blog-card-body">
              ${tagsEl ? `<div class="blog-tags">${tagsEl}</div>` : ''}
              <h3><a href="blog-post.html?slug=${encodeURIComponent(slug)}">${esc(post.title)}</a></h3>
              ${post.excerpt ? `<p class="blog-excerpt">${esc(post.excerpt)}</p>` : ''}
              <div class="blog-meta">
                <span><i class="fas fa-calendar-alt"></i> ${formatDate(post.publishedAt)}</span>
                <a href="blog-post.html?slug=${encodeURIComponent(slug)}" class="blog-read-more">Read More <i class="fas fa-arrow-right"></i></a>
              </div>
            </div>
          </article>`;
      }).join('');

      /* stagger + intersection animations */
      const cards = Array.from(grid.querySelectorAll('.blog-card'));
      cards.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i * 0.08, 0.5)}s`; });
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.08 });
      cards.forEach(el => obs.observe(el));

    } catch (e) {
      grid.innerHTML = '<p class="blog-empty">Unable to load posts. Please try again later.</p>';
    }
    return;
  }

  /* ---- Single post page ---- */

  const container = document.getElementById('post-container');
  if (!container) return;

  const slug = new URLSearchParams(location.search).get('slug');
  if (!slug) {
    container.innerHTML = '<p class="blog-empty">Post not found. <a href="blog.html">Back to Blog</a></p>';
    return;
  }

  try {
    const results = await sanityFetch(
      `*[_type == "blogPost" && slug.current == "${slug.replace(/"/g, '')}"][0] { title, publishedAt, tags, excerpt, mainImage { asset }, body[] { ..., asset } }`
    );

    if (!results) {
      container.innerHTML = '<p class="blog-empty">Post not found. <a href="blog.html">Back to Blog</a></p>';
      return;
    }

    const post   = results;
    const imgSrc = post.mainImage?.asset ? sanityImageUrl(post.mainImage.asset, 1200) : null;
    const tagsEl = (post.tags || []).map(t => `<span class="blog-tag">${esc(t)}</span>`).join('');

    document.title = `${post.title} — Latimtech Life & Light Ltd`;
    const heroTitle   = document.getElementById('hero-title');
    const heroHeading = document.getElementById('hero-heading');
    if (heroTitle)   heroTitle.textContent   = post.title;
    if (heroHeading) heroHeading.textContent = post.title;

    container.innerHTML = `
      <article class="blog-post-article">
        <div class="blog-post-header">
          <div class="breadcrumb">
            <a href="index.html">Home</a>
            <span class="sep"><i class="fas fa-chevron-right"></i></span>
            <a href="blog.html">Blog</a>
            <span class="sep"><i class="fas fa-chevron-right"></i></span>
            <span class="current">${esc(post.title)}</span>
          </div>
          ${tagsEl ? `<div class="blog-tags">${tagsEl}</div>` : ''}
          <h1>${esc(post.title)}</h1>
          ${post.excerpt ? `<p class="blog-post-excerpt">${esc(post.excerpt)}</p>` : ''}
          <div class="blog-post-meta">
            <span><i class="fas fa-calendar-alt"></i> ${formatDate(post.publishedAt)}</span>
          </div>
        </div>
        ${imgSrc ? `<div class="blog-post-hero-img"><img src="${esc(imgSrc)}" alt="${esc(post.title)}" loading="eager"></div>` : ''}
        <div class="blog-post-body">${renderBody(post.body)}</div>
        <div class="blog-post-footer">
          <a href="blog.html" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Back to Blog</a>
        </div>
      </article>`;

  } catch (e) {
    container.innerHTML = '<p class="blog-empty">Unable to load post. <a href="blog.html">Back to Blog</a></p>';
  }

})();
